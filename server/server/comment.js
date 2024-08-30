const { Comment } = require("../db/mysql/model");
const { MyErr } = require("../utils/model");
const { ERR_RES } = require("../config");
const Init = require("../utils/init");

async function read(opts) {
  let comment = await Comment.findOne(opts);
  return Init.comment(comment);
}
async function readList(opts) {
  let comments = await Comment.findAll(opts);
  return Init.comment(comments);
}
async function create(data) {
  try {
    let comment = await Comment.create(data);
    return Init.comment(comment);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.COMMENT.CREATE.ERR, error });
  }
}
async function destroyList(opts) {
  try {
    //  RV row
    return await Comment.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.COMMENT.REMOVE.ERR, error });
  }
}

module.exports = {
  destroyList,
  create,
  readList,
  read,
};
