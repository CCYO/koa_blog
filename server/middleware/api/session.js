const _ws = require("../../utils/ws");
const C_CacheNews = require("../../controller/cache_news");
const { log } = require("../../utils/log");
const { SuccModel, ErrModel } = require("../../utils/model");
const BACKEND = require("../../config");
const { ERR_RES } = require("../../config");

const SESSION_NEWS = () => ({
  //  若是設定 undefined，經過JSON.stringify會被刪除
  hasNews: null,
  list: { confirm: [], unconfirm: [] },
  num: { unconfirm: 0, confirm: 0, total: 0 },
});
//  reset session
async function reset(ctx, next) {
  if (ctx.session.user.id === 3) {
    ctx.body = new ErrModel(ERR_RES.USER.UPDATE.NOT_ALLOW_FOR_EMPLOYER);
    return;
  }
  await next();
  let { data } = ctx.body;
  log(`重設 user/${data.id} 的 session`);
  ctx.session.user = { ...data, news: ctx.session.user.news };
}
//  remove session
async function remove(ctx) {
  let user_id = ctx.session.user.id;
  // 關閉ws
  _ws.close(ctx);
  ctx.session = null;
  log(`移除 使用者user_id:${user_id} 的 session`);
  ctx.body = new SuccModel({ data: "成功登出" });
}
//  set session
async function set(ctx, next) {
  await next();
  let { errno, data } = ctx.body;
  if (errno || ctx.session.user) {
    return;
  }
  await _ws.close_same_id(data.id);
  ctx.session.user = {
    ...data,
    news: SESSION_NEWS(),
  };
}
//  撈取cacheNews，若沒有或過期，則向DB撈取，並於最後作緩存
//  依據 Cache News 判斷 session.news 過期與否，並將兩者視情況取用、更新、設置
async function news(ctx, next) {
  let default_news = {
    list: { confirm: [], unconfirm: [] },
    num: ctx.session.user.news.num,
  };
  //  body { status, excepts }
  const { status } = ctx.request.body;
  let { id, news: sessionNews } = ctx.session.user;
  let resModel = await C_CacheNews.isExist(id);
  let hasNews = resModel.errno ? false : true;
  //  若有新通知
  if (hasNews) {
    log(`根據 cache/${BACKEND.CACHE.TYPE.NEWS} 得知，user/${id} 有新通知`);
    //  清除請求數據
    ctx.request.body = {};
    await C_CacheNews.removeList([id]);
    //  恢復session.news預設值
    ctx.session.user.news = sessionNews = SESSION_NEWS();
    // ctx.session.user.news.hasNews = true
    // sessionNews = ctx.session.user.news
  } else if (status === BACKEND.NEWS.FRONT_END_STATUS.CHECK) {
    log(`user/${id} 前端請求，確認後端有無更新news`);
    default_news.hasNews = false;
    let { news, ...me } = ctx.session.user;
    let data = { me, news: default_news };
    ctx.body = new SuccModel({ data });
    return;
  } else if (
    status === BACKEND.NEWS.FRONT_END_STATUS.FIRST &&
    ctx.session.user.news.hasNews !== null
  ) {
    log(`user/${id} 直接使用緩存 session.news`);
    let { news, ...me } = ctx.session.user;
    ctx.body = new SuccModel({ data: { news, me } });
    return;
  }
  log(`user/${id} 向DB查詢 news數據`);
  await next();

  let { errno, data } = ctx.body;
  if (errno) {
    return;
  }
  //  更新 ctx.session.news
  for (let prop in data.news.list) {
    sessionNews.list[prop] = [
      ...sessionNews.list[prop],
      ...data.news.list[prop],
    ];
  }
  sessionNews.num = data.news.num;
  sessionNews.hasNews = false;
  ctx.session.user.news = sessionNews;
  log(`user/${id} 的 session.user.news 已更新`);
  data.news.hasNews = hasNews;
  //  ctx.body { errno, data: { ctx.session.user } }
  //  ctx.session.user { news, ...user session data }
  //  news { list, num, hasNews }
  //  news.list {
  //      confirm: [{ type, id, confirm, timestamp, <fans|blogs|comments> }, ...],
  //      unconfirm: [{ type, id, confirm, timestamp, <fans|blogs|comments> }, ...],
  //  }
  //  news.num { confirm, unconfirm, total }
  let { news, ...me } = ctx.session.user;
  ctx.body.data = { me, news: data.news };
}
module.exports = {
  reset,
  news,
  remove,
  set,
};
