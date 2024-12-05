/* CONFIG     ----------------------------------------------------------------------------- */
const { DB } = require("../../_config");

/* NPM        ----------------------------------------------------------------------------- */
const redisStore = require("koa-redis");

/* UTILS      ----------------------------------------------------------------------------- */
const { log } = require("../../utils/log");

const store = redisStore(DB.REDIS_CONF);

store.client
  .on("connect", () => log("Redis connect"))
  .on("error", (e) => console.error("Redis connect Error:\n", e));

module.exports = store;
