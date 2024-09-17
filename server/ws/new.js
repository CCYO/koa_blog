/**
 * @description API news相關
 */
const router = require("koa-router")();
const { CHECK, SESSION } = require("../middleware/api");
const News = require("../controller/news");

// router.prefix("/news");

//  get news data
// router.post("/", CHECK.login, SESSION.news, async (ctx) => {
module.exports = router.all("/", (ctx) => {
  // let opts = {
  //   user_id: ctx.session.user.id,
  //   excepts: ctx.request.body.excepts,
  // };
  // ctx.body = await News.readMore(opts);
  ctx.websocket.on("message", (message) => {
    console.log("ws message: ", message);
  });

  ctx.websocket.on("connection", (ws) => {
    console.log(`ws/user:${ctx.params.user_id} connection......`);
  });
});
