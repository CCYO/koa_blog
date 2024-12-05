/**
 * @description 彙整routes
 */

/* Config     ----------------------------------------------------------------------------- */
const { ENV, ERR_RES } = require("../config");

/* NPM        ----------------------------------------------------------------------------- */
let router = require("koa-router")();

/* UTILS      ----------------------------------------------------------------------------- */
const { MyErr } = require("../utils/model");

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
  router.get("/api/error", () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
  router.get("/view/error", () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
}

module.exports = router;
