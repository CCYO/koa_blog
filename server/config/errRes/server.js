const COMMON = require("../common");
const NO_LOGIN = COMMON.ERR_RES.AXIOS.RESPONSE_NO_LOGIN;
const ERR_50x = COMMON.ERR_RES.VIEW.SERVER_ERROR;
const ERR_504 = COMMON.ERR_RES.VIEW.TIME_OUT;
const ERR_404 = COMMON.ERR_RES.VIEW.NOT_FOUND;

module.exports = {
  RESPONSE: {
    NO_LOGIN,
    PAGINATION_UPDATE: {
      errno: 98003,
      msg: "伺服器資料已更新，需重新整理",
      code: 409,
    },
    ERR_50x,
    ERR_504,
    ERR_404,
    TEST: {
      errno: 99999,
      msg: "測試報錯",
    },
  },
  FORMIDABLE: {
    PARSE_ERR: {
      errno: 80201,
      msg: "formidable parse 發生錯誤",
    },
    NO_PAYLOAD: {
      errno: 80202,
      msg: "formidable parse 沒有任何 payload",
    },
    GCE_ERR: {
      errno: 80203,
      msg: "formidable parse 進行 GFB 上傳時發生錯誤",
    },
  },
};
