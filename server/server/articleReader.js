const { ArticleReader } = require("../db/mysql/model");
const { MyErr } = require("../utils/model");
const { ERR_RES } = require("../config");

async function create(opts) {
  try {
    return await ArticleReader.create(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.ARTICLE_READER.CREATE.ERR, error });
  }
}

async function restore(opts) {
  // RV ROW
  try {
    return await ArticleReader.restore(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.ARTICLE_READER.RESTORE.ERR, error });
  }
}

async function destroyList(opts) {
  try {
    //  RV row
    return await ArticleReader.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.ARTICLE_READER.REMOVE.ERR, error });
  }
}

async function update(id, newData) {
  try {
    let [row] = await ArticleReader.update(newData, {
      where: { id },
    });
    return row;
  } catch (error) {
    throw new MyErr({ ...ERR_RES.ARTICLE_READER.UPDATE.ERR, error });
  }
}

module.exports = {
  create,
  restore,
  update,
  destroyList,
};
