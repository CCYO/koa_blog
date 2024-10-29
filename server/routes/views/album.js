/**
 * @description Router/Views album
 */
let router = require("koa-router")();
const { CHECK, CACHE } = require("../../middleware/views");
const Blog = require("../../controller/blog");
const { FRONTEND_CONST, ALBUM_LIST } = require("../../config");
const render = require("../../utils/render");

const ejs_render = render.albumList;

router.prefix("/album");

//  album list page
router.get("/list", CACHE.noCache, CHECK.login, async (ctx) => {
  let author = ctx.session.user;
  let { data: album } = await Blog.findListAndCountOfAlbum({
    author_id: author.id,
  });
  await ctx.render("albumList", {
    active: FRONTEND_CONST.ALBUM_LIST.ACTIVE._,
    page: FRONTEND_CONST.ALBUM_LIST.PAGE_NAME,
    login: true,
    title: "文章相簿",
    author,
    album,
    pagination: ALBUM_LIST.PAGINATION,
    ejs_render,
  });
});
//  album page of blog_id
router.get("/:blog_id", CACHE.noCache, CHECK.login, async (ctx) => {
  let opts = {
    blog_id: ctx.params.blog_id * 1,
    author_id: ctx.session.user.id,
  };
  let { errno, data } = await Blog.findAlbum(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    let { imgs, ...blog } = data;
    await ctx.render("album", {
      active: FRONTEND_CONST.ALBUM.ACTIVE._,
      page: FRONTEND_CONST.ALBUM.PAGE_NAME,
      login: true,
      title: `${blog.title}的相簿`,
      blog,
      imgs,
    });
  }
});

module.exports = router;
