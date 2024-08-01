let router = require("koa-router")();

const api = require("./api");
const views = require("./views");

router.use(api.routes());
router.use(views.routes());
router.get("/", (ctx, next) => {
  ctx.redirect("/square");
});

let { MyErr } = require("../utils/model");
router.get("/tt", () => {
  throw new MyErr({ errno: 8888, msg: "這只是view error測試" });
});
router.get("/api/tt", () => {
  throw new MyErr({ errno: 8888, msg: "這只是api error測試" });
});

module.exports = router;
