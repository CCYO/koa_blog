/**
 * @description blog api
 */

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { CHECK, CACHE, FIREBASE, VALIDATE } = require("../../middleware/api");

/* CONTROLLER ----------------------------------------------------------------------------- */
const Blog = require("../../controller/blog");

router.prefix("/api/blog");

/**
 * @description find pagination of blog list
 */
router.post("/list", async (ctx) => {
  let opts = {
    currentUser_id: ctx.session.user?.id,
    ...ctx.request.body,
  };
  ctx.body = await Blog.findListForPagination(opts);
});

/**
 * @description remove blog
 */
router.delete("/", CHECK.login, CACHE.modify, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    blogList: ctx.request.body.blogList,
  };
  ctx.body = await Blog.removeList(opts);
});

/**
 * @description upload blog img
 */
router.post(
  "/img",
  CHECK.login,
  VALIDATE.BLOG,
  CACHE.modify,
  FIREBASE.blogImg,
  async (ctx) => {
    let opts = {
      author_id: ctx.session.user.id,
      ...ctx.request.body,
    };
    ctx.body = await Blog.addImg(opts);
  }
);

/**
 * @description modify blog
 */
router.patch("/", CHECK.login, CACHE.modify, VALIDATE.BLOG, async (ctx) => {
  let opts = {
    author_id: ctx.session.user.id,
    ...ctx.request.body,
  };
  ctx.body = await Blog.modify(opts);
});

/**
 * @description add blog
 */
router.post(
  "/",
  CHECK.login,
  VALIDATE.BLOG,
  CACHE.modify,
  async (ctx, next) => {
    const { title } = ctx.request.body;
    ctx.body = await Blog.add(title, ctx.session.user.id);
  }
);

module.exports = router;
