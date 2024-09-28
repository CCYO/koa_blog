const { ENV } = require("../config");
let router = require("koa-router")();

const api = require("./api");
const views = require("./views");
const ws = require("./ws");

router.use(api.routes());
router.use(views.routes());
router.use(ws.routes());

router.get("/", (ctx) => {
  ctx.redirect("/square");
});

if (!ENV.isProd) {
  const { MyErr } = require("../utils/model");
  const { ERR_RES } = require("../config/index");
  router.get("/api/error", () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
  router.get("/view/error", () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
}

module.exports = router;
