const _RESTORE = require("./_restore");
const _REMOVE = require("./_remove");

const RESTORE = {
  list: _RESTORE.list,
};

const REMOVE = {
  list: _REMOVE.list,
};

module.exports = {
  REMOVE,
  RESTORE,
};
