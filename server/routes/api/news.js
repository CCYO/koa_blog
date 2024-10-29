/**
 * @description news api
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const { CACHE, CHECK, SESSION } = require("../../middleware/api");
const News = require("../../controller/news");
const C_User = require("../../controller/user");
const C_Blog = require("../../controller/blog");
const C_Comment = require("../../controller/comment");

router.prefix("/api/news");

/**
 * @description confirm idolFans
 */
router.get("/idolFans/:idolFans_id", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    idol_id: ctx.session.user.id,
    idolFans_id: ctx.params.idolFans_id * 1,
  };
  ctx.body = await C_User.confirmNews(opts);
});

/**
 * @description confirm msgReceiver
 */
router.get(
  "/msgReceiver/:msgReceiver_id",
  CHECK.login,
  CACHE.modify,
  async (ctx) => {
    let opts = {
      receiver_id: ctx.session.user.id,
      msgReceiver_id: ctx.params.msgReceiver_id * 1,
    };
    ctx.body = await C_Comment.confirmNews(opts);
  }
);

/**
 * @description confirm articleReader
 */
router.get(
  "/articleReader/:articleReader_id",
  CHECK.login,
  CACHE.modify,
  async (ctx) => {
    let opts = {
      reader_id: ctx.session.user.id,
      articleReader_id: ctx.params.articleReader_id * 1,
    };
    ctx.body = await C_Blog.confirmNews(opts);
  }
);

/**
 * @description find news
 */
router.post("/", CHECK.login, SESSION.news, async (ctx) => {
  let opts = {
    user_id: ctx.session.user.id,
    excepts: ctx.request.body.excepts,
  };
  ctx.body = await News.readMore(opts);
});

module.exports = router;
