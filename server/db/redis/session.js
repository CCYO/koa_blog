const session = require("koa-generic-session");

const store = require("./store");
const { ENV, DB } = require("../../config");
const middleware = session({
  //  存放在瀏覽器的cookie裡，session 的 key
  // key: ENV.isProd ? DB.PROD.COOKIE_KEY : DB.DEV.COOKIE_KEY,
  key: DB.PROD.COOKIE_KEY,
  //  存放在 redis 裡,為 session key 所加的前綴
  prefix: DB.PROD.REDIS_PREFIX,
  store,
});

module.exports = middleware;
