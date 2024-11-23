/**
 * @description album view
 */
/* NPM        ----------------------------------------------------------------------------- */
let router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const { CHECK, CACHE } = require("../../middleware/views");
const Blog = require("../../controller/blog");
const render = require("../../utils/render");
/* Config      ----------------------------------------------------------------------------- */
const {
  COMMON: { PAGE },
  PAGINATION,
} = require("../../const");
/* Var         ----------------------------------------------------------------------------- */
const ejs_render = render.albumList;

router.prefix("/album");

/**
 * @description album list
 */
router.get("/list", CACHE.noCache, CHECK.login, async (ctx) => {
  let author = ctx.session.user;
  let { data: album } = await Blog.findListAndCountOfAlbum({
    author_id: author.id,
  });
  await ctx.render("albumList", {
    active: PAGE.ALBUM_LIST.ACTIVE._,
    page: PAGE.ALBUM_LIST.PAGE_NAME,
    login: true,
    title: "文章相簿",
    author,
    album,
    pagination: PAGINATION.ALBUM_LIST,
    ejs_render,
  });
});

/**
 * @description album
 */
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
      active: PAGE.ALBUM.ACTIVE._,
      page: PAGE.ALBUM.PAGE_NAME,
      login: true,
      title: `${blog.title}的相簿`,
      blog,
      imgs,
    });
  }
});

module.exports = router;
