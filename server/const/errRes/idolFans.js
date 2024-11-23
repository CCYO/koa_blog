module.exports = {
  REMOVE: {
    ERR: {
      errno: 20700,
      msg: "刪除 IdolFans 失敗",
    },
    ROW_ERR: {
      errno: 20701,
      msg: "刪除 IdolFans 的數量不完全",
    },
    NOT_ALLOW_FOR_EMPLOYER: {
      errno: 20702,
      msg: "感謝您的測試，但礙於測試目的，限制了對我的取消追蹤：）",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30700,
      msg: "更新 IdolFans 失敗",
    },
    ERR_ROW: {
      errno: 30701,
      msg: "IdolFans 更新條數不如預期",
    },
  },
  RESTORE: {
    ERR: {
      errno: 50700,
      msg: "恢復 idolFans 軟刪除時發生錯誤",
    },
    ROW_ERR: {
      errno: 50701,
      msg: "恢復 idolFans 軟刪除 的數量不完全",
    },
  },
};
