/**
 * @description error view
 */

/* CONFIG      ----------------------------------------------------------------------------- */
const {
  ERR_RES,
  COMMON: { PAGE },
} = require("../../config");

/* NPM        ----------------------------------------------------------------------------- */
const router = require("koa-router")();

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { CHECK } = require("../../middleware/views");

/* UTILS      ----------------------------------------------------------------------------- */
const { ErrModel } = require("../../utils/model");

/**
 * @description error page
 */
router.get("/permission/:id", CHECK.validParam, async (ctx) => {
  let opts = {};
  switch (ctx.params.id * 1) {
    //  意料外的錯誤
    case ERR_RES.SERVER.RESPONSE.ERR_50x.errno:
      opts.errModel = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_50x);
      break;
    //  無此頁面
    case ERR_RES.SERVER.RESPONSE.ERR_404.errno:
      opts.errModel = new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_404);
      break;
    //  失效的通知
    case ERR_RES.NEWS.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.NEWS.READ.NOT_EXIST);
      break;
    case ERR_RES.USER.READ.NO_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.USER.READ.NO_EXIST);
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
      break;
    default:
      return ctx.redirect(
        `/permission/${ERR_RES.SERVER.RESPONSE.ERR_404.errno}`
      );
  }
  opts = {
    active: PAGE.ERR_PAGE.ACTIVE.NODE_JS,
    page: PAGE.ERR_PAGE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    ...opts,
  };
  await ctx.render("page404", opts);
});

module.exports = router;
