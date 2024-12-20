module.exports = {
  CREATE: {
    ERR_BULK_ROW: {
      errno: 10901,
      msg: "MsgReceiver bulkCreate 設置多條數據時，條目數不如預期",
    },
  },
  REMOVE: {
    ERR: {
      errno: 20900,
      msg: "刪除 MsgReceiver 失敗",
    },
    ROW: {
      errno: 20901,
      msg: "MsgReceiver 刪除條數不如預期",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30900,
      msg: "更新 MsgReceiver 失敗",
    },
    ERR_ROW: {
      errno: 30901,
      msg: "MsgReceiver 更新條數不如預期",
    },
  },
  READ: {
    SHOULD_NOT_EXIST: {
      errno: 40901,
      msg: "出現不該存在的 MsgReceiver",
    },
  },
  RESTORE: {
    ERR: {
      errno: 50900,
      msg: "恢復 msgReceiver 軟刪除時發生錯誤",
    },
    ROW_ERR: {
      errno: 50901,
      msg: "恢復 msgReceiver 軟刪除 的數量不完全",
    },
  },
};
