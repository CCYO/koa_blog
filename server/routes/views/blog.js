/**
 * @description Router/Views blog
 */
const router = require("koa-router")();
const Blog = require("../../controller/blog");
const render = require("../../utils/render");
const {
  FRONTEND_CONST,
  CACHE: { TYPE },
} = require("../../config");
const { CACHE } = require("../../middleware/views");
const privateCache = CACHE.genPrivate(TYPE.PAGE.BLOG);
const commonCache = CACHE.genCommon(TYPE.PAGE.BLOG);
const {
  BLOG: { PREVIEW_KEY },
} = require("../../config");

const ejs_render = render.blog;

//  preview blog page
router.get("/blog/preview/:id", privateCache, async (ctx) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    author_id: ctx.session.user.id,
    blog_id: ctx.params.id * 1,
  };
  let { errno, data } = await Blog.findInfoForPrivatePage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog", {
      active: FRONTEND_CONST.BLOG.ACTIVE.PREVIEW,
      page: FRONTEND_CONST.BLOG.PAGE_NAME,
      login: true,
      title: new URL(ctx.href).searchParams.get(PREVIEW_KEY)
        ? "文章預覽"
        : data.title,
      blog: { ...data, showComment: false },
    });
  }
});
//  blog editor pge
router.get("/blog/edit/:id", privateCache, async (ctx, next) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    author_id: ctx.session.user.id,
    blog_id: ctx.params.id * 1,
  };
  let { errno, data } = await Blog.findInfoForPrivatePage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog-edit", {
      active: FRONTEND_CONST.BLOG_EDIT.ACTIVE._,
      page: FRONTEND_CONST.BLOG_EDIT.PAGE_NAME,
      login: true,
      title: data.title,
      blog: { ...data, showComment: false },
    });
  }
});
//  blog page
router.get("/blog/:id", commonCache, async (ctx) => {
  let opts = {
    //  來自 privateCache
    cache: ctx.cache,
    blog_id: ctx.params.id * 1,
  };
  let { errno, data } = await Blog.findInfoForCommonPage(opts);
  if (errno) {
    ctx.redirect(`/permission/${errno}`);
  } else {
    //  將 data 賦予 ctx.cache，稍後 privateCache 會視情況處理緩存
    ctx.cache.data = data;
    await ctx.render("blog", {
      active: FRONTEND_CONST.BLOG.ACTIVE._,
      page: FRONTEND_CONST.BLOG.PAGE_NAME,
      login: Boolean(ctx.session.user),
      title: data.title,
      ejs_render,
      blog: { ...data, showComment: true },
    });
  }
});

module.exports = router;
