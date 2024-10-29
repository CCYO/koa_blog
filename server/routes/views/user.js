/**
 * @description user view
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const { CHECK, CACHE } = require("../../middleware/views");
const User = require("../../controller/user");
const render = require("../../utils/render");
/* Config      ----------------------------------------------------------------------------- */
const {
  FRONTEND_CONST,
  BLOG,
  CACHE: { TYPE },
} = require("../../config");
/* Var         ----------------------------------------------------------------------------- */
const privateCache = CACHE.genPrivate(TYPE.PAGE.USER);
const commonCache = CACHE.genCommon(TYPE.PAGE.USER);
const ejs_render = render.user;

/**
 * @description register
 */
router.get("/register", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    page: FRONTEND_CONST.REGISTER_LOGIN.PAGE_NAME,
    login: false,
    active: FRONTEND_CONST.REGISTER_LOGIN.ACTIVE.REGISTER,
    title: "註冊",
  });
});

/**
 * @description login
 */
router.get("/login", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    active: FRONTEND_CONST.REGISTER_LOGIN.ACTIVE.LOGIN,
    page: FRONTEND_CONST.REGISTER_LOGIN.PAGE_NAME,
    login: false,
    title: "登入",
  });
});

/**
 * @description self
 */
router.get("/self", privateCache, async (ctx) => {
  //  middleware/privateCache 取得的緩存數據
  //  ctx.cache[TYPE.PAGE.USER]
  //  { exist: 提取緩存數據的結果 ,
  //    data: { currentUser, fansList, idolList, blogList } || undefined }
  let opts = {
    cache: ctx.cache,
    user_id: ctx.session.user.id,
  };
  let { data } = await User.findDataForUserPage(opts);
  //  將 DB 數據賦予給 ctx.cache
  let { currentUser, relationShip, blogs } = (ctx.cache.data = data);
  await ctx.render("user", {
    active: FRONTEND_CONST.USER.ACTIVE.SELF,
    page: FRONTEND_CONST.USER.PAGE_NAME,
    login: true,
    ejs_render,
    pagination: BLOG.PAGINATION,
    isSelf: true,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});

/**
 * @description otehr
 */
router.get("/other/:id", CHECK.isSelf, commonCache, async (ctx) => {
  //  從 middleware 取得的緩存數據 ctx.cache[PAGE.USER]
  /**
   * {
   ** exist: 提取緩存數據的結果 ,
   ** data: { currentUser, fansList, idolList, blogList } || undefined
   * }
   */
  // cache = { exist: STATUS.NO_CACHE, data: undefined };

  let opts = {
    cache: ctx.cache,
    user_id: ctx.params.id * 1,
  };
  let resModel = await User.findDataForUserPage(opts);
  if (resModel.errno) {
    return ctx.redirect(`/permission/${resModel.errno}`);
  }
  let { data } = resModel;
  //  將 DB 數據賦予給 ctx.cache
  let { currentUser, relationShip, blogs } = (ctx.cache.data = data);
  //  非文章作者，所以不傳入未公開的文章
  blogs = { public: blogs.public };
  await ctx.render("user", {
    active: FRONTEND_CONST.USER.ACTIVE.OTEHR,
    page: FRONTEND_CONST.USER.PAGE_NAME,
    login: Boolean(ctx.session.user),
    ejs_render,
    pagination: BLOG.PAGINATION,
    isSelf: false,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});

/**
 * @description setting
 */
router.get("/setting", CACHE.noCache, CHECK.login, async (ctx, next) => {
  let currentUser = ctx.session.user;
  await ctx.render("setting", {
    active: FRONTEND_CONST.SETTING.ACTIVE._,
    page: FRONTEND_CONST.SETTING.PAGE_NAME,
    login: true,
    title: `${currentUser.nickname}個人資料設置`,
    currentUser,
  });
});

module.exports = router;
