/**
 * @description blog view
 */

/* CONFIG      ----------------------------------------------------------------------------- */
const {
  CACHE: { TYPE },
  COMMON: { PAGE, BLOG, SELECTOR },
} = require("../../config");

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { CACHE, CHECK } = require("../../middleware/views");

/* CONTROLLER ----------------------------------------------------------------------------- */
const Blog = require("../../controller/blog");

/* UTILS      ----------------------------------------------------------------------------- */
const render = require("../../utils/render");

/* VAR         ----------------------------------------------------------------------------- */
const privateCache = CACHE.genPrivate(TYPE.PAGE.BLOG);
const commonCache = CACHE.genCommon(TYPE.PAGE.BLOG);

/**
 * @description blog preview
 */
router.get("/blog/preview/:id", CHECK.validParam, privateCache, async (ctx) => {
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
      active: PAGE.BLOG.ACTIVE.PREVIEW,
      page: PAGE.BLOG.PAGE_NAME,
      login: true,
      title: new URL(ctx.href).searchParams.get(BLOG.PREVIEW_KEY)
        ? "文章預覽"
        : data.title,
      blog: { ...data, showComment: false },
      SELECTOR,
    });
  }
});

/**
 * @description edit blog
 */
router.get(
  "/blog/edit/:id",
  CHECK.validParam,
  privateCache,
  async (ctx, next) => {
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
        active: PAGE.BLOG_EDIT.ACTIVE._,
        page: PAGE.BLOG_EDIT.PAGE_NAME,
        login: true,
        title: data.title,
        blog: { ...data, showComment: false },
        SELECTOR,
      });
    }
  }
);

/**
 * @description blog
 */
router.get("/blog/:id", CHECK.validParam, commonCache, async (ctx) => {
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
      active: PAGE.BLOG.ACTIVE._,
      page: PAGE.BLOG.PAGE_NAME,
      login: Boolean(ctx.session.user),
      title: data.title,
      // ejs_render: render[PAGE.BLOG.PAGE_NAME],
      ejs_render: {
        blogList: render.blogList[PAGE.BLOG.PAGE_NAME],
        commentTree: render.component[PAGE.BLOG.PAGE_NAME].commentTree,
        commentItem: render.component[PAGE.BLOG.PAGE_NAME].commentItem,
      },
      blog: { ...data, showComment: true },
      SELECTOR,
    });
  }
});

module.exports = router;
