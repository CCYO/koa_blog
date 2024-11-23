module.exports = {
  CREATE: {
    ERR: {
      errno: 10600,
      msg: "BlogImgAlt創建失敗",
    },
  },
  REMOVE: {
    ERR: {
      errno: 20600,
      msg: "刪除 BlogImgAlt 失敗",
    },
    ROW: {
      errno: 20601,
      msg: "刪除 BlogImgAlt 的數量不完全",
    },
  },
  UPDATE: {
    ERR: {
      errno: 30600,
      msg: "BLOG_IMG_ALT 更新失敗",
    },
    AJV_UPDATE: {
      errno: 30691,
      msg: "更新數據不符校驗",
    },
  },
  READ: {
    NOT_BLOG: {
      errno: 40601,
      msg: "不屬於該Blog",
    },
    NOT_AUTHOR: {
      errno: 40602,
      msg: "非作者本人",
    },
    NOT_EXIST: {
      errno: 40603,
      msg: "不存在任何相符的 BlogImgAlt",
    },
  },
};
