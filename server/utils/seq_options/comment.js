const { Op } = require("sequelize");
const xss = require("xss");
const _REMOVE = require("./_remove");
const FIND = {
  _removeListInBlog: (article_id) => ({
    where: { article_id },
    attributes: ["id"],
    include: {
      association: "receivers",
      attributes: ["id"],
      through: {
        attributes: ["id"],
      },
    },
  }),
  _receiverListForDestory: (article_id) => ({
    where: { article_id },
    attributes: ["id"],
    include: {
      association: "receivers",
      attributes: ["id"],
      through: {
        attributes: ["id"],
        required: true,
      },
    },
  }),
  _receiverListForRestory: (article_id) => ({
    where: { article_id },
    attributes: ["id"],
    include: {
      association: "receivers",
      attributes: ["id"],
      through: {
        where: { deletedAt: { [Op.not]: null } },
        attributes: ["id", "confirm"],
        paranoid: false,
      },
    },
  }),
  _infoAboutItem: (id, paranoid = true) => ({
    where: { id },
    paranoid,
    include: {
      association: "receivers",
      attributes: ["id"],
      through: {
        paranoid: false,
      },
    },
  }),
  _infoAboutPid: ({ article_id, pid }) => {
    //  找尋指定 blogId
    let where = { article_id };
    if (!pid) {
      ////  沒有pid，代表item是根評論，故要尋找的相關數據是與根評論(pid = null)有關的數據
      where.pid = null;
    } else {
      ////  有pid，代表要尋找的是子評論，故要尋找的相關數據是父評論(id = pid)以及兄弟評論(pid = pid)
      where[Op.or] = [{ id: pid }, { pid }];
    }
    return {
      attributes: ["id", "commenter_id"],
      where,
      include: {
        association: "receivers",
        attribute: ["id"],
      },
    };
  },
  _one: (id) => ({
    attributes: [
      "id",
      "html",
      "updatedAt",
      "createdAt",
      "deletedAt",
      "pid",
      "commenter_id",
    ],
    where: { id },
    include: {
      association: "commenter",
      attributes: ["id", "email", "nickname"],
    },
  }),
  _msgReceiverOfAuthor: ({ article_id, author_id }) => ({
    attributes: ["id"],
    where: { article_id },
    include: {
      association: "receivers",
      attributes: ["id"],
      where: { id: author_id },
    },
  }),
  _lastItemOfPidAndNotSelf: (article_id, commenter_id, time, pid) => ({
    attributes: [
      "id",
      "html",
      "article_id",
      "commenter_id",
      "updatedAt",
      "createdAt",
      "deletedAt",
      "pid",
    ],
    where: {
      article_id,
      commenter_id: { [Op.not]: commenter_id },
      createdAt: { [Op.lte]: time },
      pid,
    },
    order: [["createdAt", "DESC"]],
  }),
  lastItemOfNotSelf: (article_id, commenter_id, time) => ({
    attributes: [
      "id",
      "html",
      "article_id",
      "commenter_id",
      "updatedAt",
      "createdAt",
      "deletedAt",
      "pid",
    ],
    where: {
      article_id,
      commenter_id: { [Op.not]: commenter_id },
      createdAt: { [Op.lte]: time },
    },
    order: [["createdAt", "DESC"]],
  }),
  _wholeInfo: (id, paranoid = true) => ({
    attributes: [
      "id",
      "html",
      "article_id",
      "updatedAt",
      "createdAt",
      "deletedAt",
      "pid",
    ],
    where: { id },
    paranoid,
    include: [
      {
        association: "commenter",
        attributes: ["id", "email", "nickname"],
      },
      {
        association: "article",
        attributes: ["id", "title"],
        include: {
          association: "author",
          attributes: ["id", "email", "nickname"],
        },
      },
    ],
  }),
  itemByMsgReceiver: ({ receiver_id, msgReceiver_id }) => ({
    attributes: ["id"],
    include: [
      {
        association: "receivers",
        attributes: ["id"],
        where: { id: receiver_id },
        through: {
          attributes: ["id", "confirm"],
          where: { id: msgReceiver_id },
        },
      },
      {
        association: "article",
        attributes: ["id"],
      },
    ],
  }),
  _unconfirmListBeforeNews: ({ comment_id, pid, article_id, createdAt }) => ({
    attributes: ["id"],
    where: {
      id: { [Op.not]: comment_id },
      article_id,
      pid: pid === 0 ? null : pid,
      createdAt: { [Op.gte]: createdAt },
    },
    include: {
      association: "commenter",
      attributes: ["id", "email", "nickname"],
    },
  }),
};
const REMOVE = {
  list: _REMOVE.list,
};
const CREATE = {
  one: ({ commenter_id, article_id, html, pid }) => ({
    html: xss(html),
    article_id,
    commenter_id,
    pid: !pid ? null : pid,
  }),
};
module.exports = {
  CREATE,
  REMOVE,
  FIND,
};
