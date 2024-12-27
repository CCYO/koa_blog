module.exports = {
  CREATE: {
    ERR: {
      errno: 10300,
      msg: "COMMENT 創建失敗",
    },
    ERR_EMPTY: {
      errno: 10301,
      msg: "COMMENT 是空數據",
    },
  },
  REMOVE: {
    ERR: {
      errno: 20300,
      msg: "刪除 comment 失敗",
    },
    ROW: {
      errno: 20301,
      msg: "刪除 COMMENT 的條目數量不如預期",
    },
    ERR_NO_PERMISSION: {
      errno: 20302,
      msg: "沒有刪除權限",
    },
  },
  READ: {
    NOT_EXIST: {
      errno: 40301,
      msg: "不存在任何相符的 Comment",
      code: 404,
    },
  },
};
