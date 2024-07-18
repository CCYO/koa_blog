const { Blog } = require("../db/mysql/model");
const Init = require("../utils/init");
const { MyErr } = require("../utils/model");
const { ERR_RES } = require("../config");

/** 創建Blog
 * @param {string} title 文章表提
 * @param {number} user_id 作者id
 * @returns {object} blog 資訊 { id, title, html, show, showAt, createdAt, updatedAt }
 */
async function create(data) {
  try {
    let blog = await Blog.create(data);
    return Init.blog(blog);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.BLOG.CREATE.ERR, error });
  }
}

async function read(opts) {
  let blog = await Blog.findOne(opts);
  return Init.blog(blog);
}
async function createReaders(blog_id, reader_list) {
  let blog = await Blog.findByPk(blog_id);
  //  IdolFans Model instances
  let list = await blog.addReaders(reader_list);
  return list;
}
async function destoryReaders(blog_id, reader_list) {
  let blog = await Blog.findByPk(blog_id);
  //  IdolFans Model instances
  let row = await blog.removeReaders(reader_list);
  return row;
}
/** 查詢 blogs
 * @param {object} param0 查詢 blogs 紀錄所需的參數
 * @param {number} param0.user_id user id
 * @param {boolean} param0.getAll 是否無視 blog 公開/隱藏，false 僅拿公開，true 全拿
 * @returns {object}
 *  [blog: {
 *      id, title, show, showAt,
 *      author: { id, email, nickname, age, avatar, avatar_hash }
 *  }]
 *
 */
async function readList(opts) {
  let blogs = await Blog.findAll(opts);
  return Init.blog(blogs);
}

const { QueryTypes } = require("sequelize");
const { seq } = require("../db/mysql/model");
async function readListAndCountAll(query) {
  let list = await seq.query(query.list, {
    type: QueryTypes.SELECT,
  });
  if (list.length && list[0].author_email) {
    list = list.map((item) => {
      item.author = {
        id: item.author_id,
        email: item.author_email,
        nickname: item.author_nickname,
      };
      delete item.author_id;
      delete item.author_email;
      return item;
    });
  }
  let blogs = Init.blog(list);
  let [{ count }] = await seq.query(query.count, {
    type: QueryTypes.SELECT,
  });
  return { blogs, count };
}
/** 更新blog
 * @param {number} blog_id blog id
 * @param {object} blog_data 要更新的資料
 * @returns {number} 1代表更新成功，0代表失敗
 */
async function update({ id, ...data }) {
  let [row] = await Blog.update(data, { where: { id } });
  if (!row) {
    throw new MyErr({
      ...ERR_RES.BLOG.UPDATE.ERR,
      error: `blog/${id} 更新失敗`,
    });
  }
  return row;
}
//  刪除
async function destroyList(opts) {
  try {
    //  RV: row
    return await Blog.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.BLOG.REMOVE.ERR, error });
  }
}
module.exports = {
  destroyList,
  update,
  readListAndCountAll,
  readList,
  destoryReaders,
  createReaders,
  read,
  create,
};
