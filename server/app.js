/* CONFIG     ----------------------------------------------------------------------------- */
const { ENV } = require("./config");
const { WEBPACK } = require("../build/config");
const { SESSION_KEY } = require("./_config");

/* NPM        ----------------------------------------------------------------------------- */
const Koa = require("koa");
//  處理非 multipart/form-data 的請求數據
const bodyparser = require("koa-bodyparser")({
  enableTypes: ["json", "form", "text"],
});
const koaViews = require("@ladjs/koa-views");

/* UTILS      ----------------------------------------------------------------------------- */
//  錯誤處理
const errorsHandle = require("./middleware/errorsHandle");
const { webpackDev, webpackHMR } = require("./middleware/webpackDevAndHMR");
//  middleware:與redis-session連線
const { session_middleware } = require("./db/redis");
//  middleware:sequelize transaction
const sequelizeTransaction = require("./middleware/api/seq_transaction");
//  middleware:ws
const { ws_middleware } = require("./middleware/ws");
const router = require("./routes");

/* RUNTIME    ----------------------------------------------------------------------------- */
const app = new Koa();
//  加密 session
app.keys = [SESSION_KEY];

app.use(errorsHandle.middleware);
if (!ENV.isProd) {
  //  打印每一次的request與response
  app.use(require("koa-logger")());
  //  針對JSON類型的response，提高可讀性
  app.use(require("koa-json")());
}

app.use(webpackDev);
app.use(webpackHMR);
app.use(bodyparser);
app.use(ws_middleware);
app.use(session_middleware);
app.use(sequelizeTransaction);
app.use(
  koaViews(WEBPACK.BUILD.VIEW, {
    extension: "ejs",
  })
);
app.use(router.routes(), router.allowedMethods());

//  error log
app.on("error", errorsHandle.log);

module.exports = app;
