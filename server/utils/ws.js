let SocketServer = require("ws").WebSocketServer;
let { store } = require("../db/redis");
let { log } = require("./log");
const { WS } = require("../config");
const ws_map = new Map();

const token_prefix = "koa_blog.sid";
module.exports = {
  init,
  close,
  close_same_id,
  broadcast_news,
};

function init(ctx) {
  let ws = ctx._ws_instance;
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
    ws_list_of_user
  );

  ws.on("close", (code) => {
    // 參考MDN:
    // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
    // 自定義 closeEvent code

    let ws_list_of_user = ws_map.get(user_id);
    if (ws_list_of_user[token]) {
      delete ws_list_of_user[token];
    }

    log(
      `ws close\n【code】${code}\n【user_id】${user_id}\n【token】${token}\n【ws_list_of_user】`,
      ws_list_of_user
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
      // 關閉重複登入連接中的ws
      // 參考MDN:
      // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
      // 自定義 closeEvent code
      await ws.close(WS.CLOSE_CODE);
      log(`移除user_id:${user_id}的重複登入`);
    }
  }
}

function broadcast_news(user_id_list) {
  let { id_list, cb_list } = user_id_list.reduce(
    (acc, user_id) => {
      let ws_list_of_user = ws_map.get(user_id);
      if (ws_list_of_user) {
        acc.id_list.push(user_id);
        for (let token in ws_list_of_user) {
          let ws = ws_list[token];
          acc.cb_list.push(function () {
            ws.send(user_id);
          });
        }
      }
      return acc;
    },
    { id_list: [], cb_list: [] }
  );
  cb_list.forEach((cb) => cb());
  log(`ws send broadcast has news for: ${id_list}`);
}
