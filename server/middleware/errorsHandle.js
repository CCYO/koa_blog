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
    ctx.app.emit("error", error, ctx);

    let myErr = undefined;
    if (!(error instanceof MyErr)) {
      myErr = new MyErr({ ...ERR_RES.SERVER.RESPONSE.ERR_500, error });
    } else {
      myErr = error;
    }

    if (ENV.isProd) {
      myErr = myErr.model;
    } else if (myErr.serverError) {
      //  error property is enumerable，無法傳給前端，故需處理
      myErr.serverError = JSON.stringify(
        myErr.serverError,
        Object.getOwnPropertyNames(myErr.serverError)
      );
    } else {
      myErr.serverError = JSON.stringify({
        message: undefined,
        stack: myErr.stack,
      });
    }

    let isAPI = /^\/api\//.test(ctx.path);
    if (isAPI) {
      myErr.serverError = JSON.parse(myErr.serverError);
      ctx.body = myErr;
    } else {
      let url = "/serverError";
      if (!ENV.isProd) {
        url += `?serverError=${encodeURIComponent(myErr.serverError)}`;
      }
      ctx.redirect(url);
    }
    return;
  }
};
