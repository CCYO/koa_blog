/**
 * @description user view
 */

/* CONFIG      ----------------------------------------------------------------------------- */
const {
  CACHE: { TYPE },
  COMMON: { PAGE, SELECTOR },
  PAGINATION,
} = require("../../config");

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { CHECK, CACHE } = require("../../middleware/views");

/* CONTROLLER ----------------------------------------------------------------------------- */
const User = require("../../controller/user");

/* UTILS      ----------------------------------------------------------------------------- */
const render = require("../../utils/render");

/* VAR        ----------------------------------------------------------------------------- */
const privateCache = CACHE.genPrivate(TYPE.PAGE.USER);
const commonCache = CACHE.genCommon(TYPE.PAGE.USER);

/**
 * @description register
 */
router.get("/register", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    page: PAGE.REGISTER_LOGIN.PAGE_NAME,
    login: false,
    active: PAGE.REGISTER_LOGIN.ACTIVE.REGISTER,
    title: "註冊",
    SELECTOR,
  });
});

/**
 * @description login
 */
router.get("/login", CACHE.noCache, CHECK.skipLogin, async (ctx) => {
  await ctx.render("register&login", {
    active: PAGE.REGISTER_LOGIN.ACTIVE.LOGIN,
    page: PAGE.REGISTER_LOGIN.PAGE_NAME,
    login: false,
    title: "登入",
    SELECTOR,
  });
});

/**
 * @description self
 */
router.get("/self", privateCache, CHECK.userCache_is_fresh, async (ctx) => {
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
    active: PAGE.USER.ACTIVE.SELF,
    page: PAGE.USER.PAGE_NAME,
    login: true,
    // ejs_render: render[PAGE.USER.PAGE_NAME],
    ejs_render: {
      blogList: render.blogList[PAGE.USER.PAGE_NAME],
      relationshipItem: render.component[PAGE.USER.PAGE_NAME].relationshipItem,
    },
    pagination: PAGINATION.BLOG,
    isSelf: true,
    title: `${currentUser.nickname}的主頁`,
    currentUser,
    blogs,
    relationShip,
    SELECTOR,
  });
});

/**
 * @description otehr
 */
router.get(
  "/other/:id",
  CHECK.validParam,
  CHECK.isSelf,
  commonCache,
  CHECK.userCache_is_fresh,
  async (ctx) => {
    //  從 middleware 取得的緩存數據 ctx.cache[PAGE.USER]
    /**
     * {
     ** exist: 提取緩存數據的結果 ,
     ** data: { currentUser, fansList, idolList, blogList } || undefined
     * }
     */
    // cache = { exist: STATUS.NO_CACHE, data: undefined };

    // 確認params.id是否為數字
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
      active: PAGE.USER.ACTIVE.OTEHR,
      page: PAGE.USER.PAGE_NAME,
      login: Boolean(ctx.session.user),
      // ejs_render: render[PAGE.USER.PAGE_NAME],
      ejs_render: {
        blogList: render.blogList[PAGE.USER.PAGE_NAME],
        relationshipItem:
          render.component[PAGE.USER.PAGE_NAME].relationshipItem,
      },
      pagination: PAGINATION.BLOG,
      isSelf: false,
      title: `${currentUser.nickname}的主頁`,
      currentUser,
      blogs,
      relationShip,
      SELECTOR,
    });
  }
);

/**
 * @description setting
 */
router.get("/setting", CACHE.noCache, CHECK.login, async (ctx, next) => {
  let currentUser = ctx.session.user;
  await ctx.render("setting", {
    active: PAGE.SETTING.ACTIVE._,
    page: PAGE.SETTING.PAGE_NAME,
    login: true,
    title: `${currentUser.nickname}個人資料設置`,
    currentUser,
    SELECTOR,
  });
});

module.exports = router;
