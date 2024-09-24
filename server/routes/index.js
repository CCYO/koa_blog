const { ENV } = require("../config");
let router = require("koa-router")();

const api = require("./api");
const views = require("./views");

router.use(api.routes());
router.use(views.routes());

router.get("/", (ctx, next) => {
  ctx.redirect("/square");
});

if (!ENV.isProd) {
  const { MyErr } = require("../utils/model");
  const { ERR_RES } = require("../config/index");
  router.get("/api/error", (ctx, next) => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
  router.get("/view/error", (ctx, next) => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
}

module.exports = router;
