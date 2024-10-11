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
  // 經過VALIDATE.ALT後, ctx.request.body 有被新添入 author_id
  // ctx.request.body { _old, author_id, blog_id, alt_id, alt }
  ctx.body = await BlogImgAlt.modify(ctx.request.body);
});

module.exports = router;
