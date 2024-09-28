const router = require("koa-router")();

const _ws = require("../../utils/ws");

router.prefix("/ws");

router.get("/", async (ctx) => {
  if (!ctx.ws) {
    ctx.status = 404;
    return;
  }
  ctx.ws = await ctx.ws();
  _ws.init(ctx);
});

module.exports = router;
