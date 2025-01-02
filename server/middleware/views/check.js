/**
 * 系統直接調用的緩存處理
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const {
  CACHE: { STATUS },
  PAGINATION,
} = require("../../config");

/* UTILS      ----------------------------------------------------------------------------- */
const Redir = require("../../utils/redir");
const { log } = require("../../utils/log");

async function validParam(ctx, next) {
  let _id = ctx.params.id;
  if (Number(_id.replace(/e/, "x"))) {
    await next();
    return;
  }
  // return ctx.redirect("/self");
  ctx.status = 404;
  return;
}

async function userCache_is_fresh(ctx, next) {
  let fresh = true;
  if (ctx.cache.exist === STATUS.NO_CACHE) {
    fresh = false;
  } else if (
    PAGINATION.BLOG.BLOG_COUNT !== ctx.cache.data.PAGINATION.BLOG_COUNT ||
    PAGINATION.BLOG.PAGE_COUNT !== ctx.cache.data.PAGINATION.PAGE_COUNT
  ) {
    log("PAGINATION 常數被更改，緩存已無效，需重新向DB獲取數據");
    fresh = false;
  }
  if (!fresh) {
    ctx.cache.exist = STATUS.NO_CACHE;
  }
  await next();
}
//  若是當前使用者，跳往個人頁
async function isSelf(ctx, next) {
  let me = ctx.session.user ? ctx.session.user.id : undefined;
  let currentUser = ctx.params.id * 1;
  //  若是自己的ID，跳轉到個人頁面
  if (me === currentUser) {
    return ctx.redirect("/self");
  }
  await next();
}

/** 驗證是否登入
 * @param {*} ctx
 * @param {function} next
 * @returns {promise<null>}
 */
async function login(ctx, next) {
  if (ctx.session.user) {
    await next();
  } else {
    Redir.login(ctx);
  }
  return;
}
//  登入狀態鑿直接跳往個人頁，且不允許前端緩存
async function skipLogin(ctx, next) {
  if (ctx.session.user) {
    //  若已登入，跳轉到個人頁面
    ctx.redirect("/self");
    return;
  }
  await next();
}
module.exports = {
  validParam,
  skipLogin,
  isSelf,
  login,
  userCache_is_fresh,
};
