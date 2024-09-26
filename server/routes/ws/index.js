const router = require("koa-router")();

const _ws = require("../../utils/ws");

router.prefix("/ws");

router.get("/", async (ctx, next) => {
  if (!ctx.ws) {
    // 404
    return;
  }
  ctx._ws_instance = await ctx.ws();
  _ws.init(ctx);
  // ctx.body = 666;
  ctx.status = 101;
});

module.exports = router;
