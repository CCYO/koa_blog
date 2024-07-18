/**
 * @description API news相關
 */
const router = require("koa-router")();
const { CHECK, SESSION } = require("../../middleware/api");
const News = require("../../controller/news");

router.prefix("/api/news");

//  get news data
router.post("/", CHECK.login, SESSION.news, async (ctx) => {
  let opts = {
    user_id: ctx.session.user.id,
    excepts: ctx.request.body.excepts,
  };
  ctx.body = await News.readMore(opts);
});

module.exports = router;
