const ArticleReader = require("../server/articleReader");
const Opts = require("../utils/seq_options");
const { MyErr, SuccModel } = require("../utils/model");
const { ERR_RES } = require("../config");

async function restoringList(id_list) {
  let row = await ArticleReader.restore(
    Opts.ARTICLE_READER.RESTORE.list(id_list)
  );
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.ARTICLE_READER.RESTORE.ROW_ERR);
  }
  return new SuccModel();
}

//  soft remove list
async function removeList(id_list) {
  let row = await ArticleReader.destroyList(
    Opts.ARTICLE_READER.REMOVE.list(id_list)
  );
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.ARTICLE_READER.REMOVE.ROW_ERR);
  }
  return new SuccModel();
}

async function modify(id, newData) {
  let row = await ArticleReader.update(id, newData);
  if (!row) {
    throw new MyErr({
      ...ERR_RES.ARTICLE_READER.UPDATE.ERR_ROW,
      error: `articleReader/${id} 未更新`,
    });
  }
  return new SuccModel();
}

async function addEmployerBeReader(reader_id) {
  let x = await ArticleReader.create(
    Opts.ARTICLE_READER.CREATE.addEmployerBeReader(reader_id)
  );
  return new SuccModel();
}

module.exports = {
  addEmployerBeReader,
  modify,
  removeList,
  restoringList,
};
