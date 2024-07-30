const session = require("koa-generic-session");
const redisStore = require("koa-redis");
const { DB } = require("../../_config");
const { log } = require("../../utils/log");

const store = redisStore({
  port: DB.REDIS_CONF.port,
  host: DB.REDIS_CONF.host,
  cookie: DB.REDIS_CONF.cookie,
});

store.client
  .on("connect", () => {
    log("Redis session connect");
  })
  .on("ready", () => log("Redis session ready"))
  .on("error", (e) => console.error("Redis session error ==> \n", e));

module.exports = session({
  //cookie name前綴
  key: "koa_blog.sid",
  //redis key前綴
  prefix: "koa_blog.sid:",
  store,
});
