/**
 * @description album api
 */

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* UTILS      ----------------------------------------------------------------------------- */
const { CHECK, CACHE, VALIDATE } = require("../../middleware/api");

/* CONTROLLER ----------------------------------------------------------------------------- */
const C_Blog = require("../../controller/blog");
const C_BlogImgAlt = require("../../controller/blogImgAlt");

router.prefix("/api/album");
/**
 * @description find album list
 */
router.post("/list", CHECK.login, async (ctx) => {
  let author = ctx.session.user;

  ctx.body = await C_Blog.findListAndCountOfAlbum({
    author_id: author.id,
    ...ctx.request.body,
  });
});

/**
 * @description modify blog img
 */
router.patch("/", CHECK.login, CACHE.modify, VALIDATE.ALT, async (ctx) => {
  // 經過VALIDATE.ALT後, ctx.request.body 有被新添入 author_id
  // ctx.request.body { _old, author_id, blog_id, alt_id, alt }
  ctx.body = await C_BlogImgAlt.modify(ctx.request.body);
});

module.exports = router;
