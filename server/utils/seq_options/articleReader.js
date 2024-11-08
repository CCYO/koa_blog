const { Op } = require("sequelize");
const _RESTORE = require("./_restore");
const _REMOVE = require("./_remove");

const CREATE = {
  addEmployerBeReader: (reader_id) => ({
    article_id: 1,
    reader_id,
  }),
};

const RESTORE = {
  list: _RESTORE.list,
};

const REMOVE = {
  list: _REMOVE.list,
};

const UPDATE = {
  modify: (id) => ({
    where: { id },
  }),
  reShowArticle: (id_list) => ({
    where: { id: { [Op.in]: id_list } },
    paranoid: false, //  無視軟刪除
  }),
};

module.exports = {
  CREATE,
  REMOVE,
  RESTORE,
  UPDATE,
};
