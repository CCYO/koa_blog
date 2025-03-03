module.exports = {
  CREATE: {
    ERR: {
      errno: 10801,
      msg: "新增 ArticleReader 失敗",
    },
  },
  REMOVE: {
    ERR: {
      errno: 20800,
      msg: "刪除 ArticleReader 失敗",
    },
    ROW_ERR: {
      errno: 20801,
      msg: "刪除 ArticleReader 的數量不完全",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30800,
      msg: "更新 ArticleReader 失敗",
    },
    ERR_ROW: {
      errno: 30801,
      msg: "ArticleReader 更新條數不如預期",
    },
  },
  RESTORE: {
    ERR: {
      errno: 50800,
      msg: "恢復 ArticleReader 軟刪除時發生錯誤",
    },
    ROW_ERR: {
      errno: 50801,
      msg: "恢復軟刪除 ArticleReader 的數量不完全",
    },
  },
};
