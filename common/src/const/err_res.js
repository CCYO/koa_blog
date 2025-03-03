export default {
  AXIOS: {
    NEWS_NO_LOGIN: {
      errno: 98001,
      msg: "尚未登入,請先登入",
      code: 401,
    },
    RESPONSE_NO_LOGIN: {
      errno: 98002,
      msg: "登入已過期,請重新登入",
      code: 401,
    },
    PAGINATION_UPDATE: {
      errno: 98003,
      msg: "伺服器資料已更新，頁面需重新整理",
      code: 409,
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
  },
};
