const { MyErr } = require("../utils/model");
let { ERR_RES, ENV } = require("../config");

module.exports = async (ctx, next) => {
  try {
    await next();
    if (ctx.status !== 404) {
      return;
    }
    ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`);
  } catch (error) {
    ctx.status = 500;
    if (!(error instanceof MyErr)) {
      error = new MyErr({ ...ERR_RES.SERVER.RESPONSE.ERR_500, error });
    }
    ctx.app.emit("error", error, ctx);
    let isAPI = /^\/api\//.test(ctx.path);
    if (isAPI) {
      ctx.body = error;
    } else {
      ctx.redirect("/serverError");
    }
  }
};
