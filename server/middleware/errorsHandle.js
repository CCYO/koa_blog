const { MyErr } = require("../utils/model");
let { ERR_RES } = require("../config");

module.exports = async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) {
      if (ctx.header.accept && ~ctx.header.accept.indexOf("html")) {
        ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`);
      }
    }
  } catch (error) {
    ctx.status = 500;
    if (!(error instanceof MyErr)) {
      error = new MyErr({ ...ERR_RES.SERVER.RESPONSE.ERR_500, error });
    }
    ctx.app.emit("error", error, ctx);
    let accept = ctx.header.accept;
    if (accept && ~ctx.header.accept.indexOf("html")) {
      ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_500.errno}`);
    } else {
      ctx.body = new MyErr(ERR_RES.SERVER.RESPONSE.ERR_500);
    }
  }
};
