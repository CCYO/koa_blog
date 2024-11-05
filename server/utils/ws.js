let { log } = require("./log");
const { DB } = require("../config");
const ws_map = new Map();

module.exports = {
  ws_map,
  init,
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
  let token = `${DB.REDIS_PREFIX}:${ctx.sessionId}`;
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
