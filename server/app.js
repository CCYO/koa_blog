const { consola } = require("consola/basic");
const { ENV } = require("./config");
////  NODE.JS MODULE
const { resolve } = require("path");
//  設定環境變量，以 ~/.env 作為設定檔
require("dotenv").config({
  path: resolve(__dirname, `./_config/${ENV.isProd ? ".prod" : ".dev"}.env`),
});

const Koa = require("koa");
//  針對JSON類型的response提高可讀性
const json = require("koa-json")();
//  處理非 multipart/form-data 的請求數據
const bodyparser = require("koa-bodyparser")({
  enableTypes: ["json", "form", "text"],
});
const koaViews = require("@ladjs/koa-views");
const koaMount = require("koa-mount");
const koaStatic = require("koa-static");

////  MY MODULE
//  錯誤處理
const middleware_errors = require("./middleware/errorsHandle");
const { webpackDev, webpackHMR } = require("./middleware/webpackDevAndHMR");
//  middleware:與redis-session連線
const { session_middleware } = require("./db/redis");
//  middleware:sequelize transaction
const sequelizeTransaction = require("./middleware/api/seq_transaction");
//  middleware:ws
const ws_middleware = require("./middleware/ws");
const router = require("./routes");

//  避免觸發 ../build/htmlWebpackPlugins.js
const WEBPACK_CONFIG = require("../build/config");
const { SESSION_KEY } = require("./_config");
const { MyErr } = require("./utils/model");

const app = new Koa();

//  加密 session
app.keys = [SESSION_KEY];

app.use(middleware_errors);

if (!ENV.isProd) {
  //  打印每一次的request與response
  app.use(require("koa-logger")());
}

app.use(json);
app.use(webpackDev);
app.use(webpackHMR);
app.use(bodyparser);
app.use(ws_middleware);
app.use(session_middleware);
app.use(sequelizeTransaction);
//  渲染模板
app.use(
  koaViews(WEBPACK_CONFIG.BUILD.VIEW, {
    extension: "ejs",
  })
);

//  靜態檔案交由NGINX負責
// app.use(
//   koaMount(
//     WEBPACK_CONFIG.PUBLIC_PATH,
//     koaStatic(WEBPACK_CONFIG.BUILD.DIST, {
//       maxage: 60 * 60 * 1000,
//     })
//   )
// );

app.use(router.routes(), router.allowedMethods());

//  列印錯誤
app.on("error", (error, ctx) => {
  let msg = [
    `----- -----\n
      METHOD:${ctx.method}\n
      PATH:${ctx.path}\n
      ERROR TYPE:`,
  ];
  if (error instanceof MyErr) {
    let { serverError } = error;
    msg = msg.concat([
      "【MyErr】\nmodel:\n",
      error.model,
      "\n+++++ +++++\nstack:\n",
      error.stack,
      "\n+++++ +++++\norigin stack:\n",
      serverError?.stack,
    ]);
  } else {
    msg = msg.concat(["【SEVER ERROR】\n", error]);
  }
  msg = msg.concat("\n----- -----");
  consola.error(...msg);
});

module.exports = app;
