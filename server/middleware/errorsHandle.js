const { MyErr, ErrModel } = require("../utils/model");
let { ERR_RES } = require("../const");

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
      error = new MyErr({ ...ERR_RES.SERVER.RESPONSE.ERR_50x, error });
    }
    ctx.app.emit("error", error, ctx);
    let accept = ctx.header.accept;
    if (accept && ~ctx.header.accept.indexOf("html")) {
      ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_50x.errno}`);
    } else {
      ctx.body = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_50x);
    }
  }
};
