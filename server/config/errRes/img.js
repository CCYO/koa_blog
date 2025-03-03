module.exports = {
  CREATE: {
    ERR: {
      errno: 10400,
      msg: "IMG 創建失敗",
    },
    BLOG_IMG_FROMAT_ERR: {
      errno: 10401,
      msg: "創建BLOG_IMG時，格式錯誤",
    },
    BLOG_IMG_NO_EXT: {
      errno: 10402,
      msg: "創建BLOG_IMG時，未提供ext",
    },
    BLOG_IMG_NO_HASH: {
      errno: 10402,
      msg: "創建BLOG_IMG時，未提供HASH",
    },
  },
  READ: {
    NO_DATA: {
      errno: 40401,
      msg: "沒有相符的 IMG",
    },
  },
};
