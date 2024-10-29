/**
 * @description Router/Views Square
 */
const router = require("koa-router")();
const Square = require("../../controller/square");
const { FRONTEND_CONST, SQUARE } = require("../../config");
const render = require("../../utils/render");

const ejs_render = render.square;

//  square page
router.get("/square", async (ctx) => {
  let { data: blog } = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
  });
  await ctx.render("square", {
    active: FRONTEND_CONST.SQUARE.ACTIVE._,
    page: FRONTEND_CONST.SQUARE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    title: "廣場頁",
    blog,
    pagination: SQUARE.PAGINATION,
    ejs_render,
  });
});

module.exports = router;
