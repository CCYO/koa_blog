const session = require("koa-generic-session");
const redisStore = require("koa-redis");
const { DB } = require("../../_config");
const { log } = require("../../utils/log");

const store = redisStore(DB.REDIS_CONF);

store.client
  .on("connect", () => {
    log("Redis session connect");
  })
  .on("ready", () => log("Redis session ready"))
  .on("error", (e) => console.error("Redis session error ==> \n", e));

const middleware = session({
  //cookie name前綴
  key: "koa_blog.sid",
  //redis key前綴
  prefix: "koa_blog.sid:",
  store,
});

module.exports = {
  middleware,
  store,
};
