/**
 * @description 彙整api routes
 */
let router = require("koa-router")();

let album = require("./album");
let square = require("./square");
let blog = require("./blog");
let comment = require("./comment");
let news = require("./news");
let user = require("./user");

router.use(album.routes());
router.use(square.routes());
router.use(blog.routes());
router.use(comment.routes());
router.use(news.routes());
router.use(user.routes());

module.exports = router;
