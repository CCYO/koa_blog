/**
 * @description 彙整routes
 */

/* Config     ----------------------------------------------------------------------------- */
const { ENV, ERR_RES } = require("../config");

/* NPM        ----------------------------------------------------------------------------- */
let router = require("koa-router")();

/* UTILS      ----------------------------------------------------------------------------- */
const { MyErr, ErrModel } = require("../utils/model");

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
  router.get("/api/needLogin", (ctx) => {
    ctx.body = new ErrModel(ERR_RES.SERVER.RESPONSE.NO_LOGIN);
  });
  router.get("/api/newsNoLogin", (ctx) => {
    ctx.body = new ErrModel(ERR_RES.NEWS.READ.NO_LOGIN);
  });
  router.get("/view/error", () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
}

module.exports = router;
