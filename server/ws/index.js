let router = require("koa-router")();

let news = require("./new");

module.exports = router.use(news.routes());
