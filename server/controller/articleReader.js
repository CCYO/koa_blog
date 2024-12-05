/**
 * @description controller articleReader
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* SERVER     ----------------------------------------------------------------------------- */
const ArticleReader = require("../server/articleReader");

/* UTILS      ----------------------------------------------------------------------------- */
const Opts = require("../utils/seq_options");
const { MyErr, SuccModel } = require("../utils/model");

async function reShowArticle(id_list) {
  let row = await ArticleReader.update(
    Opts.ARTICLE_READER.UPDATE.reShowArticle(id_list),
    {
      deletedAt: null,
      updatedAt: new Date(),
    }
  );
  if (row !== id_list.length) {
    throw new MyErr(ERR_RES.ARTICLE_READER.UPDATE.ERR_ROW);
  }
  return new SuccModel();
}

/**
 * @description restory articleReader list
 * @param {Array<number>} id_list articelReader id list
 * @returns {Promise<SuccModel>}SuccModel || throw MyErr
 */
async function restoringList(id_list) {
  let row = await ArticleReader.restore(
    Opts.ARTICLE_READER.RESTORE.list(id_list)
  );
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.ARTICLE_READER.RESTORE.ROW_ERR);
  }
  return new SuccModel();
}

/**
 * @description soft remove articleReader list
 * @param {Array<number>} id_list articleReader id list
 * @returns SuccModel || throw MyErr
 */
async function removeList(id_list) {
  let row = await ArticleReader.destroyList(
    Opts.ARTICLE_READER.REMOVE.list(id_list)
  );
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.ARTICLE_READER.REMOVE.ROW_ERR);
  }
  return new SuccModel();
}

/**
 * @description modify articleReader
 * @param {Number} id articleReader id
 * @param {Object} newData articleReader data
 * @returns SuccModel || throw MyErr
 */
async function modify(id, newData) {
  let row = await ArticleReader.update(
    Opts.ARTICLE_READER.UPDATE.modify(id),
    newData
  );
  if (!row) {
    throw new MyErr({
      ...ERR_RES.ARTICLE_READER.UPDATE.ERR_ROW,
      error: `articleReader/${id} 未更新`,
    });
  }
  return new SuccModel();
}

/**
 * @description add employer be reader
 * @param {Number} reader_id user id
 * @returns SuccModel
 */
async function addEmployerBeReader(reader_id) {
  await ArticleReader.create(
    Opts.ARTICLE_READER.CREATE.addEmployerBeReader(reader_id)
  );
  return new SuccModel();
}

module.exports = {
  addEmployerBeReader,
  modify,
  removeList,
  restoringList,
  reShowArticle,
};
