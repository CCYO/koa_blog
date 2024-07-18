const { ErrModel } = require("../../utils/model");
const { ERR_RES } = require("../../config");

/** Middleware 針對 API 請求，驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else if (ctx.path === "/api/news") {
    ctx.body = new ErrModel(ERR_RES.NEWS.READ.NO_LOGIN);
  } else {
    ctx.body = new ErrModel(ERR_RES.SERVER.RESPONSE.NO_LOGIN);
  }
  return;
}

module.exports = {
  login,
};
