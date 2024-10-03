const ws_middleware = require("koa-easy-ws")();
let { store } = require("../db/redis");
let { log } = require("./log");
const { WS } = require("../config");
const ws_map = new Map();

const token_prefix = "koa_blog.sid";

module.exports = {
  ws_middleware,
  init,
  close,
  close_same_id,
  broadcast_news,
};

/*
//  設定wss
const wss = ws_middleware.server;
wss.on("connection", () => {
  log("ws connecting....");
});
 */

function init(ctx) {
  let ws = ctx.ws;
  let user_id = ctx.session.user.id;
  let token = `${token_prefix}:${ctx.sessionId}`;
  let ws_list_of_user = ws_map.get(user_id);
  if (!ws_list_of_user) {
    ws_list_of_user = { [token]: ws };
    ws_map.set(user_id, ws_list_of_user);
  } else {
    ws_list_of_user[token] = ws;
  }
  log(
    `ws connecting\n【user_id】${user_id}\n【token】${token}\n【ws_list_of_user】`,
    Object.keys(ws_list_of_user)
  );

  ws.on("close", (code) => {
    let ws_list_of_user = ws_map.get(user_id);
    if (ws_list_of_user[token]) {
      delete ws_list_of_user[token];
    }

    log(
      `ws close\n【code】${code}\n【user_id】${user_id}\n【token】${token}\n【ws_list_of_user】`,
      Object.keys(ws_list_of_user)
    );
  });
}

// 關閉指定ws
function close(ctx) {
  let ws_list_of_user = ws_map.get(ctx.session.user.id);
  let token = `${token_prefix}:${ctx.sessionId}`;
  let ws = ws_list_of_user && ws_list_of_user[token];
  if (ws) {
    ws.close();
  }
}
// 關閉同為user_id的ws
async function close_same_id(user_id) {
  let ws_list_of_user = ws_map.get(user_id);
  for (let token in ws_list_of_user) {
    // 移除重複登入的session
    await store.destroy(token);
    let ws = ws_list_of_user[token];
    if (ws) {
      // 關閉重複登入連接中的ws，並傳入自定義 closeEvent code，讓前端判斷操作
      // 參考MDN:
      // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
      await ws.close(WS.CLOSE_CODE);
      log(`移除user_id:${user_id}的重複登入`);
    }
  }
}

// 以特定且登入狀態的user為對象，提醒有新通知
function broadcast_news(user_id_list, hasNews) {
  let { id_list, cb_list } = user_id_list.reduce(
    (acc, user_id) => {
      let ws_list_of_user = ws_map.get(user_id);
      if (ws_list_of_user) {
        acc.id_list.push(user_id);
        for (let token in ws_list_of_user) {
          let ws = ws_list_of_user[token];
          acc.cb_list.push(function () {
            ws.send(hasNews);
          });
        }
      }
      return acc;
    },
    { id_list: [], cb_list: [] }
  );
  cb_list.forEach((cb) => cb());
  log(`ws send broadcast has news,\n【user_list】[${id_list}]`);
}
