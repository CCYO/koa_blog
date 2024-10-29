/**
 * @description 彙整api ws
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const _ws = require("../../utils/ws");

router.prefix("/ws");

/**
 * @description 開啟ws連線
 */
router.get("/", async (ctx) => {
  if (!ctx.ws) {
    ctx.status = 404;
    return;
  }
  ctx.ws = await ctx.ws();
  _ws.init(ctx);
});

module.exports = router;
