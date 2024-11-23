const COMMON = require("../common");
const NO_LOGIN = COMMON.ERR_RES.AXIOS.NEWS_NO_LOGIN;
// const NOT_EXIST = COMMON.ERR_RES.VIEW.NEWS_NOT_EXIST;

module.exports = {
  READ: {
    NO_LOGIN,
    NOT_EXIST: {
      errno: 41001,
      msg: "此通知已失效",
      code: 404,
    },
  },
};
