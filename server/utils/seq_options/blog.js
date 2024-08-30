const { Op } = require("sequelize");
const { Img, BlogImg, BlogImgAlt, User } = require("../../db/mysql/model");
const _REMOVE = require("./_remove");
const my_xss = require("../xss");
const BACKEND = require("../../config");
const { msgReceiver } = require("../init");

const REMOVE = {
  list: _REMOVE.list,
};

const FIND = {
  permission: (id, paranoid) => ({
    where: { id },
    attributes: ["id", "author_id"],
    paranoid,
  }),
  wholeInfo: (id) => ({
    attributes: ["id", "title", "html", "show", "showAt", "updatedAt"],
    where: { id },
    include: [
      {
        association: "author",
        attributes: ["id", "email", "nickname"],
      },
      {
        model: BlogImg,
        attributes: ["id", "name"],
        include: [
          {
            model: Img,
            attributes: ["id", "url", "hash"],
          },
          {
            model: BlogImgAlt,
            attributes: ["id", "alt"],
          },
        ],
      },
      {
        association: "replys",
        paranoid: false,
        attributes: [
          "id",
          "html",
          "commenter_id",
          "pid",
          "createdAt",
          "deletedAt",
        ],
        include: {
          association: "commenter",
          attributes: ["id", "email", "nickname"],
        },
      },
    ],
    order: [["replys", "id"]],
  }),
  listAndCountForAlbum: ({
    author_id,
    show = true,
    limit = BACKEND.ALBUM_LIST.PAGINATION.BLOG_COUNT,
    offset = 0,
  }) => {
    return {
      list: genList(author_id, show, limit, offset),
      count: genCount(author_id, show),
    };
    function genList(author_id, show, limit, offset) {
      return `
        SELECT id, title, \`show\`, showAt, updatedAt, createdAt
        FROM
          (
            SELECT DISTINCT blog_id
            FROM BlogImgs
          ) AS BI
          JOIN
          (
            SELECT id, title, \`show\`, showAt, updatedAt, createdAt
            FROM Blogs
            WHERE
              author_id=${author_id}
              AND \`show\`=${show}
              AND deletedAt IS NULL
            ORDER BY ${show ? "showAt" : "updatedAt"} DESC
          ) AS B
        ON BI.blog_id = B.id
        LIMIT ${limit} OFFSET ${offset}
        `;
    }

    function genCount(author_id, show) {
      return `
        SELECT count(DISTINCT id) AS count
        FROM
          (
            SELECT blog_id
            FROM BlogImgs
          ) AS BI
          JOIN
          (
            SELECT id
            FROM Blogs
            WHERE
              author_id=${author_id}
              AND \`show\`=${show}
              AND deletedAt IS NULL
          ) AS B
          ON BI.blog_id = B.id
        `;
    }
  },
  listAndCountForSquare({
    user_id = undefined,
    offset = 0,
    limit = BACKEND.SQUARE.PAGINATION.BLOG_COUNT,
  }) {
    return {
      list: genList(user_id, limit, offset),
      count: genCount(user_id),
    };
    function genList(author_id, limit, offset) {
      return `
        SELECT
          id, title, author_id, \`show\`, showAt, updatedAt,
          author_email, author_nickname
        FROM
          (
            SELECT id, title, author_id, \`show\`, showAt, updatedAt
            FROM Blogs
            WHERE
              ${author_id ? `author_id!=${author_id}` : "1"} 
              AND \`show\`=1
              AND deletedAt IS NULL
            ORDER BY showAt DESC
          ) AS B
        JOIN 
          (
            SELECT 
              id as _id,
              email as author_email,
              nickname as author_nickname
            FROM Users
          ) AS U
        ON B.author_id = U._id
        LIMIT ${limit} OFFSET ${offset} 
        `;
    }

    function genCount(author_id) {
      return `
        SELECT count(*) AS count
        FROM
          (
            SELECT id, author_id
            FROM Blogs
            WHERE
              ${author_id ? `author_id!=${author_id}` : "1"} 
              AND \`show\`=1
              AND deletedAt IS NULL
          ) AS public_list
        `;
    }
  },
  listAndCount({
    user_id = undefined,
    show = true,
    offset = 0,
    limit = BACKEND.BLOG.PAGINATION.BLOG_COUNT,
  }) {
    return {
      list: genList(user_id, show, limit, offset),
      count: genCount(user_id, show),
    };
    function genList(author_id, show, limit, offset) {
      return `
        SELECT id, title, author_id, \`show\`, showAt, updatedAt
        FROM Blogs
        WHERE
          author_id${author_id ? "=" + author_id : ">0"} 
          AND \`show\`=${show}
          AND deletedAt IS NULL
        ORDER BY ${show ? "showAt" : "updatedAt"} DESC
        LIMIT ${limit} OFFSET ${offset} 
        `;
    }

    function genCount(author_id, show) {
      return `
        SELECT count(*) AS count
        FROM Blogs
        WHERE
          author_id${author_id ? "=" + author_id : ">0"} 
          AND \`show\`=${show}
          AND deletedAt IS NULL
        `;
    }
  },
  //  尋找作者粉絲以及blog_id的軟刪除reader
  fansAndDestoryedReaderList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: [
      {
        association: "author",
        // model: User,
        // as: "author",
        attributes: ["id"],
        include: {
          model: User,
          as: "fansList",
          attributes: ["id"],
          through: {
            attributes: [],
          },
        },
      },
      {
        association: "readers",
        attributes: ["id"],
        through: {
          attributes: ["id"],
          where: {
            deletedAt: { [Op.ne]: null },
          },
          paranoid: false, //  無視軟刪除
        },
      },
    ],
  }),
  readerList: (id) => ({
    where: { id },
    attributes: ["id"],
    include: {
      association: "readers",
      attributes: ["id"],
      through: {
        attributes: [],
      },
    },
  }),
  album: (id) => ({
    where: { id },
    attributes: ["id", "title", "show"],
    include: [
      {
        model: BlogImg,
        attributes: ["id", "name"],
        include: [
          {
            model: Img,
            attributes: ["id", "url"],
          },
          {
            model: BlogImgAlt,
            attributes: ["id", "alt"],
          },
        ],
      },
    ],
  }),
  itemByArticleReader: ({ reader_id, articleReader_id }) => ({
    attributes: ["id"],
    include: {
      association: "readers",
      attributes: ["id"],
      where: { id: reader_id },
      through: {
        attributes: ["id", "confirm"],
        where: { id: articleReader_id },
      },
    },
  }),
  itemForNews: (id) => ({
    attributes: ["id", "title", "show", "showAt"],
    where: { id },
    include: {
      association: "author",
      attributes: ["id", "email", "nickname"],
    },
  }),
};

const CREATE = {
  one: ({ title, author_id }) => ({
    title: my_xss(title),
    author_id,
  }),
};
const UPDATE = {
  one: ({ blog_id, newData }) => {
    let { html, title, ...data } = newData;
    if (newData.hasOwnProperty("html")) {
      data.html = my_xss(html);
    }
    if (newData.hasOwnProperty("title")) {
      data.title = my_xss(title);
    }
    return { id: blog_id, ...data };
  },
};
module.exports = {
  UPDATE,
  CREATE,
  REMOVE,
  FIND,
};
