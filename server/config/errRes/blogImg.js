module.exports = {
  CREATE: {
    AJV_CREATE: {
      errno: 10591,
      msg: "創建數據不符校驗",
    },
  },

  REMOVE: {
    ERR: {
      errno: 20500,
      msg: "刪除 BlogImg 失敗",
    },
    ROW: {
      errno: 20501,
      msg: "刪除 BlogImg 的數量不完全",
    },
  },
  READ: {
    NO_ARGS: {
      errno: 40501,
      msg: "沒有提供相符的參數",
    },
    NOT_EXIST: {
      errno: 40502,
      msg: "沒有相符的 BlogImg",
    },
    NO_BLOG_IMG_ALT: {
      errno: 40503,
      msg: "沒有相應對的 blogImgAlt",
    },
  },
};
