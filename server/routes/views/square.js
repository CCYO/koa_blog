/**
 * @description Router/Views Square
 */
const router = require("koa-router")();
const Square = require("../../controller/square");
const { SQUARE } = require("../../config");
const ejs_render = require("../../utils/render");
//  square page
router.get("/square", async (ctx) => {
  let { data: blog } = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
  });
  await ctx.render("square", {
    page: "square",
    login: Boolean(ctx.session.user),
    active: "square",
    title: "廣場頁",
    blog,
    pagination: SQUARE.PAGINATION,
    ejs_render,
  });
});

module.exports = router;
