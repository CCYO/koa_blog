/**
 * @description square api
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const Square = require("../../controller/square");

router.prefix("/api/square");

/**
 * @description find pagination of square list
 */
router.post("/list", async (ctx) => {
  ctx.body = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
    ...ctx.request.body,
  });
});

module.exports = router;
