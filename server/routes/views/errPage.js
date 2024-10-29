/**
 * @description error view
 */
/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();
/* UTILS      ----------------------------------------------------------------------------- */
const { ErrModel } = require("../../utils/model");
/* Config      ----------------------------------------------------------------------------- */
const { FRONTEND_CONST, ERR_RES } = require("../../config");

/**
 * @description error page
 */
router.get("/permission/:errno", async (ctx) => {
  let opts = {};
  switch (ctx.params.errno * 1) {
    //  意料外的錯誤
    case ERR_RES.SERVER.RESPONSE.ERR_500.errno:
      opts.errModel = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_500);
      break;
    //  無此頁面
    case ERR_RES.SERVER.RESPONSE.ERR_404.errno:
      opts.errModel = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_404);
      break;
    //  失效的通知
    case ERR_RES.NEWS.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.NEWS.READ.NOT_EXIST);
      break;
    case ERR_RES.USER.READ.NO_DATA.errno:
      opts.errModel = new ErrModel(ERR_RES.USER.READ.NO_DATA);
      break;
    case ERR_RES.BLOG.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.BLOG.READ.NOT_EXIST);
      break;
    case ERR_RES.BLOG.READ.NOT_AUTHOR.errno:
      opts.errModel = new ErrModel(ERR_RES.BLOG.READ.NOT_AUTHOR);
      break;
    case ERR_RES.COMMENT.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
      break;
    case ERR_RES.BLOG.READ.NO_ALBUM.errno:
      opts.errModel = new ErrModel(ERR_RES.BLOG.READ.NO_ALBUM);
    default:
      return ctx.redirect(
        `/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`
      );
  }
  opts = {
    page: FRONTEND_CONST.ERR_PAGE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    active: FRONTEND_CONST.ERR_PAGE.ACTIVE.NODE_JS,
    ...opts,
  };
  await ctx.render("page404", opts);
});

module.exports = router;
