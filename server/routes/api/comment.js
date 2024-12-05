/**
 * @description comment api
 */

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { CHECK, CACHE } = require("../../middleware/api");

/* CONTROLLER ----------------------------------------------------------------------------- */
const Comment = require("../../controller/comment");

router.prefix("/api/comment");

/**
 * @description remove comment
 */
router.delete("/", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    comment_id: ctx.request.body.comment_id,
    user_id: ctx.session.user.id,
  };
  ctx.body = await Comment.remove(opts);
});

/**
 * @description add comment
 */
router.post("/", CHECK.login, CACHE.modify, async (ctx) => {
  ctx.body = await Comment.add(ctx.request.body);
});

module.exports = router;
