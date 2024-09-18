let SocketServer = require("ws").WebSocketServer;
let cookie = require("cookie");
let { session } = require("../db/redis");

async function parseUserId(req) {
  let cookies = cookie.parse(req.headers.cookie);
  let key = `koa_blog.sid:${cookies["koa_blog.sid"]}`;
  let sessionData = await session.store.get(key);
  return sessionData?.user.id;
}

module.exports = (server, app) => {
  let ws_map = (app._ws = new Map());

  ws_map.remind = function (user_id_list) {
    let { id_list, ws_list } = user_id_list.reduce(
      (acc, user_id) => {
        let ws = ws_map.get(user_id);
        if (ws) {
          acc.id_list.push(user_id);
          acc.ws_list.push({ ws, user_id });
        }
        return acc;
      },
      { id_list: [], ws_list: [] }
    );
    ws_list.forEach(({ ws, user_id }) => ws.send(user_id));
    console.log(`ws_list: ${id_list} send message....`);
    return true;
  };

  const wss = new SocketServer({ server });

  wss.on("error", console.error);

  wss.on("connection", async (ws, req) => {
    let user_id = await parseUserId(req);
    if (!user_id) {
      ws.close();
      return;
    } else if (!ws_map.has(user_id)) {
      ws_map.set(user_id, ws);
    }
    console.log(`ws user/${user_id} connecting...`);

    ws.on("close", () => {
      ws_map.delete(user_id);
      console.log(`ws user/${user_id} close`);
    });

    ws.on("message", (message) => {
      let utf8 = new Buffer.from(message, "utf-8");
      let data;
      try {
        data = JSON.parse(utf8);
      } catch (e) {
        data = utf8;
      }
      console.log(data);
    });
  });
};
