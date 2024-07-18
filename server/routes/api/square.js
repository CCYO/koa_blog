/**
 * @description API square 相關
 */
const router = require("koa-router")();
const Square = require("../../controller/square");

router.prefix("/api/square");

//  get data for square then turn pagination of blogList
router.post("/list", async (ctx) => {
  ctx.body = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
    ...ctx.request.body,
  });
});

module.exports = router;
