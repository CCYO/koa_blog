/**
 * @description square view
 */

/* CONFIG    ----------------------------------------------------------------------------- */
const {
  COMMON: { PAGE, SELECTOR },
  PAGINATION,
} = require("../../config");

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* CONTROLLER ----------------------------------------------------------------------------- */
const Square = require("../../controller/square");

/* UTILS      ----------------------------------------------------------------------------- */
const render = require("../../utils/render");

/**
 * @description square
 */
router.get("/square", async (ctx) => {
  let { data: blog } = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
    PAGINATION: PAGINATION.SQUARE,
  });
  await ctx.render("square", {
    active: PAGE.SQUARE.ACTIVE._,
    page: PAGE.SQUARE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    title: "廣場頁",
    blog,
    pagination: PAGINATION.SQUARE,
    ejs_render: {
      blogList: render.blogList[PAGE.SQUARE.PAGE_NAME],
    },
    SELECTOR,
  });
});

module.exports = router;
