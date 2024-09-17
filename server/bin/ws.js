let SocketServer = require("ws").WebSocketServer;
let cookie = require("cookie");
let { session } = require("../db/redis");

module.exports = (server, app) => {
  let ws_list = (app._ws = new Map());
  const wss = new SocketServer({ server });
  wss.on("error", console.error);
  wss.on("connection", async (ws, req) => {
    let cookies = cookie.parse(req.headers.cookie);
    let key = `koa_blog.sid:${cookies["koa_blog.sid"]}`;

    let sessionData = await session.store.get(key);
    if (!sessionData) {
      ws.close();
      return;
    }
    let user_id = sessionData.user.id;
    console.log(`ws user/${user_id} connecting...`);
    ws._remind = function () {
      ws.send("has news");
    };
    ws_list.set(user_id, ws);
    ws_list.remind = function (user_id_list) {
      let { exist_ws_list, exist, noExist } = user_id_list.reduce(
        (acc, user_id) => {
          let _ws = ws_list.get(user_id);
          if (_ws) {
            acc.exist.push(user_id);
            acc.exist_ws_list.push(_ws);
          } else {
            acc.noExist.push(user_id);
          }
          return acc;
        },
        { exist_ws_list: [], exist: [], noExist: [] }
      );
      exist_ws_list.forEach((ws) => ws.send("111"));
      console.log(`ws_list: ${exist} send message....`);
      return true;
    };

    ws.on("close", () => {
      app._ws.delete(user_id);
      console.log(`ws user/${user_id} close`);
    });

    ws.on("message", (message) => {
      let utf8 = new Buffer(message).toString("utf-8");
      let data = JSON.parse(utf8);
      console.log(ws, data);
    });
  });
};
