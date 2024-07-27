let router = require("koa-router")();

const api = require("./api");
const views = require("./views");

router.use(api.routes());
router.use(views.routes());
router.get("/", (ctx, next) => {
  ctx.redirect("/square");
});
module.exports = router;
