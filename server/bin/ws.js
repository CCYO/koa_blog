let SocketServer = require("ws").WebSocketServer;
let cookie = require("cookie");
let { store } = require("../db/redis");
let { log } = require("../utils/log");

async function genKey(req) {
  let cookies = cookie.parse(req.headers.cookie);
  let session_id = `koa_blog.sid:${cookies["koa_blog.sid"]}`;
  let sessionData = await store.get(session_id);
  let user_id = sessionData?.user.id;
  return user_id && { user_id, session_id };
}

module.exports = (server, app) => {
  let ws_map = (app._ws = new Map());

  ws_map.remind = function (user_id_list) {
    let { id_list, ws_list } = user_id_list.reduce(
      (acc, user_id) => {
        let ws_list = ws_map.get(user_id);
        if (ws_list) {
          acc.id_list.push(user_id);
          for (let session_id in ws_list) {
            let ws = ws_list[session_id];
            acc.ws_list.push({ ws, user_id });
          }
        }
        return acc;
      },
      { id_list: [], ws_list: [] }
    );
    ws_list.forEach(({ ws, user_id }) => ws.send(user_id));
    log(`ws send remind has news for: ${id_list}`);
    return true;
  };

  const wss = new SocketServer({ server });

  wss.on("error", console.error);

  wss.on("connection", async (ws, req) => {
    let key = await genKey(req);
    if (!key) {
      ws.close();
      return;
    }
    let { user_id, session_id } = key;
    let _ws_list = ws_map.get(user_id);
    if (!_ws_list) {
      _ws_list = { [session_id]: ws };
      ws_map.set(user_id, _ws_list);
    } else {
      _ws_list[session_id] = ws;
    }

    log(`ws connecting\n【user】${user_id}\n【session_id】${session_id}`);

    ws.on("close", (code) => {
      // 參考MDN:
      // https://developer.mozilla.org/zh-CN/docs/Web/API/CloseEvent#%E5%B1%9E%E6%80%A7
      // 自定義 closeEvent code
      if (code === 4444) {
        let _ws_list = ws_map.get(user_id);
        delete _ws_list[session_id];
      }
      log(
        `ws close\n【code】${code}\n【user】${user_id}\n【session_id】${session_id}`
      );
    });
  });
};
