export default {
  AXIOS: {
    NEWS_NO_LOGIN: {
      errno: 41002,
      msg: "尚未登入",
      code: 401,
    },
    RESPONSE_NO_LOGIN: {
      errno: 99903,
      msg: "登入已過期",
      code: 401,
    },
  },
  VIEW: {
    SERVER_ERROR: {
      errno: 99900,
      msg: "伺服器錯誤",
      code: 500,
    },
    TIME_OUT: {
      errno: 99901,
      msg: "伺服器回應超時",
      code: 504,
    },
    NOT_FOUND: {
      errno: 99902,
      msg: "此頁面不存在",
      code: 404,
    },
    // NEWS_NOT_EXIST: {
    //   errno: 41001,
    //   msg: "此通知已失效",
    //   code: 404,
    // },
    // USER_NOT_EXIST: {
    //   errno: 40103,
    //   msg: "找不到此帳戶",
    //   code: 404,
    // },
    // NOT_AUTHOR: {
    //   errno: 40201,
    //   msg: "非作者本人，無此權限",
    //   code: 403,
    // },
    // BLOG_NOT_EXIST: {
    //   errno: 40202,
    //   msg: "該文章不存在",
    //   code: 404,
    // },
    // NO_ALBUM: {
    //   errno: 40204,
    //   msg: "此相本不存在",
    //   code: 404,
    // },
    // COMMENT_NOT_EXIST: {
    //   errno: 40301,
    //   msg: "不存在任何相符的 Comment",
    //   code: 404,
    // },
  },
};
