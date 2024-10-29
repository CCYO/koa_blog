/**
 * @description 彙整routes
 */
/* NPM        ----------------------------------------------------------------------------- */
let router = require("koa-router")();
/* Config     ----------------------------------------------------------------------------- */
const { ENV } = require("../config");

const api = require("./api");
const views = require("./views");
const ws = require("./ws");

router.use(api.routes());
router.use(views.routes());
router.use(ws.routes());

/**
 * @description index -> square
 */
router.get("/", (ctx) => {
  ctx.redirect("/square");
});

/**
 * @description test error
 */
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
