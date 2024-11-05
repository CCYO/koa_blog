const ws_middleware = require("koa-easy-ws")();
const { ws_map } = require("../utils/ws");
let { store } = require("../db/redis");
const { WS, DB, EMPLOYER } = require("../config");
let { log } = require("../utils/log");

// 關閉指定ws
function close(ctx) {
  let ws_list_of_user = ws_map.get(ctx.session.user.id);
  let token = `${DB.REDIS_PREFIX}:${ctx.sessionId}`;
  let ws = ws_list_of_user && ws_list_of_user[token];
  if (ws) {
    ws.close();
  }
}

// 關閉同為user_id的ws
async function close_same_id(ctx, next) {
  await next();
  let { errno, data } = ctx.body;
  if (errno || ctx.session.user) {
    return;
  }
  // await _ws.close_same_id(data.id);
  let user_id = data.id;
  let ws_list_of_user = ws_map.get(user_id);
  for (let token in ws_list_of_user) {
    // 移除重複登入的session
    await store.destroy(token);
    let ws = ws_list_of_user[token];
    if (ws) {
      let code = WS.CLOSE.SOME_ID.CODE;
      let reason = WS.CLOSE.SOME_ID.REASON;
      if (user_id === EMPLOYER.ID) {
        code = WS.CLOSE.EMPLOYER_ID.CODE;
        reason = WS.CLOSE.EMPLOYER_ID.REASON;
      }
      // 關閉重複登入連接中的ws，並傳入自定義 closeEvent code，讓前端判斷操作
      // 參考MDN:
      // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
      await ws.close(code, reason);
      log(`移除user_id:${user_id}的重複登入`);
    }
  }
}

module.exports = {
  ws_middleware,
  close_same_id,
  close,
};
