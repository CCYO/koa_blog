const _REMOVE = require("./_remove");
const _RESTORE = require("./_restore");

const CREATE = {
  bulk: (datas) => ({
    datas,
    //  注意，無論要更新的資料是否被 updateOnDuplicate 標示，RV 顯示的數據皆會符合newDatas
    //  但實際上DB內的數據有沒有被更新，還是要看有沒有被 updateOnDuplicate 標示
    updateOnDuplicate: [
      "id",
      "msg_id",
      "receiver_id",
      "confirm",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ],
  }),
};

const REMOVE = {
  list: _REMOVE.list,
};

const RESTORE = {
  list: _RESTORE.list,
};

module.exports = {
  RESTORE,
  REMOVE,
  CREATE,
};
