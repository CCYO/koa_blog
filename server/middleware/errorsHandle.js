const { MyErr } = require("../utils/model");
let { ERR_RES } = require("../config");

module.exports = async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`);
    }
  } catch (error) {
    ctx.status = 500;
    if (!(error instanceof MyErr)) {
      error = new MyErr({ ...ERR_RES.SERVER.RESPONSE.ERR_500, error });
    }
    ctx.app.emit("error", error, ctx);
    let isAPI = /^\/api\//.test(ctx.path);
    if (isAPI) {
      ctx.body = new MyErr(ERR_RES.SERVER.RESPONSE.ERR_500);
    } else {
      ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_500.errno}`);
    }
  }
};
