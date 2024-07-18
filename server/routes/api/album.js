/**
 * @description API album 相關
 */
const router = require("koa-router")();
const { CHECK, CACHE, VALIDATE } = require("../../middleware/api");
const BlogImgAlt = require("../../controller/blogImgAlt");
const C_Blog = require("../../controller/blog");

router.prefix("/api/album");

router.post("/list", CHECK.login, async (ctx) => {
  let author = ctx.session.user;

  ctx.body = await C_Blog.findListAndCountOfAlbum({
    author_id: author.id,
    ...ctx.request.body,
  });
});
// update alt of blog's img
router.patch("/", CHECK.login, CACHE.modify, VALIDATE.ALT, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    ...ctx.request.body,
  };
  ctx.body = await BlogImgAlt.modify(opts);
});

module.exports = router;
