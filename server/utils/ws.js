/* CONFIG      ----------------------------------------------------------------------------- */
let { ENV } = require("../config");

/* MIDDLEWARE  ----------------------------------------------------------------------------- */
const { ws_clients } = require("../middleware/ws");

module.exports = {
  broadcast_news,
};

// 以特定且登入狀態的user為對象，使前端再次開放readMore鈕
function broadcast_news(user_id_list, hasNews) {
  let ws_list = [...ws_clients].filter((ws) =>
    user_id_list.some((user_id) => user_id === ws._user_id)
  );
  for (let ws of ws_list) {
    ws.send(hasNews);
  }
  if (!ENV.isProd) {
    let list = ws_list.map((ws) => ws._user_id);
    console.log(`ws send broadcast has news,\n【user_list】[${list}]`);
  }
}
