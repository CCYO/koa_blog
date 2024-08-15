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

module.exports = {
  CREATE,
  REMOVE,
  RESTORE,
};
