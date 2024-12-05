/* NPM         ----------------------------------------------------------------------------- */
const { Op } = require("sequelize");

/* SEQ_OPTS    ----------------------------------------------------------------------------- */
const _RESTORE = require("./_restore");
const _REMOVE = require("./_remove");

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
  reFollow: (id_list) => ({
    where: { id: { [Op.in]: id_list } },
    paranoid: false, //  無視軟刪除
  }),
};

module.exports = {
  UPDATE,
  REMOVE,
  RESTORE,
};
