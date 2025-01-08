/* CONFIG     ----------------------------------------------------------------------------- */
let { ERR_RES } = require("../config");

/* UTILS      ----------------------------------------------------------------------------- */
const { MyErr, ErrModel } = require("../utils/model");

async function middleware(ctx, next) {
  try {
    await next();
    if (ctx.status === 404) {
      if (ctx.header.accept && ~ctx.header.accept.indexOf("html")) {
        ctx.redirect(`/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`);
      } else {
        ctx.status = 404;
        ctx.body = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_404);
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
}

function log(error, ctx) {
  if (!ctx) {
    console.error("----- -----\n", error);
    return;
  }
  let msg = [
    `----- -----\n
      METHOD:${ctx.method}\n
      PATH:${ctx.path}\n
      ERROR TYPE:`,
  ];
  if (error instanceof MyErr) {
    let { serverError } = error;
    msg = msg.concat([
      "【MyErr】\nmodel:\n",
      error.model,
      "\n+++++ +++++\nstack:\n",
      error.stack,
      "\n+++++ +++++\norigin stack:\n",
      serverError?.stack,
    ]);
  } else {
    msg = msg.concat(["【SEVER ERROR】\n", error]);
  }
  msg = msg.concat("\n----- -----");
  console.error(...msg);
}

module.exports = {
  middleware,
  log,
};
