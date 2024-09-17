let router = require("koa-router")();

let album = require("./album");
let square = require("./square");
let blog = require("./blog");
let comment = require("./comment");
let news = require("./news");
let user = require("./user");

router.get("/ttt", async (ctx) => {
  ctx.body = { data: { text: "這是測試" } };
});
router.use(album.routes());
router.use(square.routes());
router.use(blog.routes());
router.use(comment.routes());
router.use(news.routes());
router.use(user.routes());

module.exports = router;
