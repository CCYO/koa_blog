/* CONFIG     ----------------------------------------------------------------------------- */
const {
  SERVER: { EMPLOYER, DB },
  COMMON: { WS },
} = require("../config");

/* NPM        ----------------------------------------------------------------------------- */
const ws_middleware = require("koa-easy-ws")();

/* UTILS      ----------------------------------------------------------------------------- */
let { log } = require("../utils/log");

/* VAR      ----------------------------------------------------------------------------- */
const CODE_CLOSE_NORMAL = 1000;
const REASON_CLOSE_NORMAL = "登出";

const ws_clients = ws_middleware.server.clients;

module.exports = {
  ws_middleware,
  ws_clients,
  close_same_id,
  close,
  init,
};

async function init(ctx, next) {
  if (!ctx.ws) {
    ctx.status = 404;
    return;
  }
  const ws = (ctx.ws = await ctx.ws());
  let user_id = ctx.session.user.id;
  let token = `${DB.REDIS_PREFIX}:${ctx.sessionId}`;
  ws._user_id = user_id;
  ws._token = token;
  log(`ws connect\n【user_id】${user_id}\n【token】${token}`);
  ws.on("close", (code, reason) => {
    reason = reason.toString("utf8");
    log(
      `ws close\n【user_id】${user_id}\n【token】${token}\n【CODE】${code}\n【REASON】${reason}`
    );
  });

  for (let ws_client of [...ws_clients]) {
    !ws_client._user_id &&
      ws_client.close(WS.CLOSE.NO_INIT.CODE, WS.CLOSE.NO_INIT.REASON);
  }
  await next();
}

// 關閉指定ws
function close(ctx) {
  let token = `${DB.REDIS_PREFIX}:${ctx.sessionId}`;
  let ws = [...ws_clients].find(
    (ws) => ws._user_id === ctx.session.user.id && ws._token === token
  );
  if (ws) {
    ws.close(CODE_CLOSE_NORMAL, REASON_CLOSE_NORMAL);
  }
}

// 關閉同為user_id的ws
async function close_same_id(ctx, next) {
  await next();
  let user_id = ctx.session.user?.id;
  if (!user_id) {
    return;
  }
  let code = WS.CLOSE.SOME_ID.CODE;
  let reason = WS.CLOSE.SOME_ID.REASON;
  const token = `${DB.REDIS_PREFIX}:${ctx.sessionId}`;
  // 關閉重複登入連接中的ws，並傳入自定義 closeEvent code，讓前端判斷操作
  // 參考MDN:
  // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
  [...ws_clients].forEach((ws) => {
    let { _user_id, _token } = ws;
    if (user_id === _user_id && token !== _token) {
      if (user_id === EMPLOYER.ID) {
        code = WS.CLOSE.EMPLOYER_ID.CODE;
        reason = WS.CLOSE.EMPLOYER_ID.REASON;
      }
      ws.close(code, reason);
    }
  });
}
