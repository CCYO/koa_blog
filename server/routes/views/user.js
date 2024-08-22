/**
 * @description Router/Views user
 */
const router = require("koa-router")();
const { CHECK, CACHE } = require("../../middleware/views");
const User = require("../../controller/user");
const ejs_render = require("../../utils/render");
const {
  BLOG,
  CACHE: { TYPE },
} = require("../../config");

const privateCache = CACHE.genPrivate(TYPE.PAGE.USER);
const commonCache = CACHE.genCommon(TYPE.PAGE.USER);

//  register page
router.get("/register", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    login: false,
    active: "register",
    title: "註冊",
  });
});
//  login page
router.get("/login", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    login: false,
    active: "login",
    title: "登入",
  });
});
//  個人頁
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
    login: true,
    active: "self",
    ejs_render,
    pagination: BLOG.PAGINATION,
    isSelf: true,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});
//  他人頁
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
  let { data } = await User.findDataForUserPage(opts);
  //  將 DB 數據賦予給 ctx.cache
  let { currentUser, relationShip, blogs } = (ctx.cache.data = data);
  //  非文章作者，所以不傳入未公開的文章
  blogs = { public: blogs.public };
  await ctx.render("user", {
    login: Boolean(ctx.session.user),
    active: "other",
    ejs_render,
    pagination: BLOG.PAGINATION,
    isSelf: false,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
  });
});
//  設置頁
router.get("/setting", CACHE.noCache, CHECK.login, async (ctx, next) => {
  let currentUser = ctx.session.user;
  await ctx.render("setting", {
    login: true,
    active: "setting",
    title: `${currentUser.nickname}個人資料設置`,
    currentUser,
  });
});
//  0504
module.exports = router;
