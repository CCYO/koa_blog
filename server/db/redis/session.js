const session = require("koa-generic-session");

const store = require("./store");
const { SERVER } = require("../../const");
const middleware = session({
  //  存放在瀏覽器的cookie裡，session 的 key
  key: SERVER.DB.COOKIE_KEY,
  //  存放在 redis 裡,為 session key 所加的前綴
  prefix: SERVER.DB.REDIS_PREFIX,
  store,
});

module.exports = middleware;
