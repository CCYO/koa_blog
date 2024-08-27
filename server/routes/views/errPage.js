const router = require("koa-router")();
const { FRONTEND_CONST, ERR_RES } = require("../../config");
const { ErrModel } = require("../../utils/model");

//  預判過的錯誤
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
    case ERR_RES.BLOG.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.BLOG.READ.NOT_EXIST);
      break;
    case ERR_RES.COMMENT.READ.NOT_EXIST.errno:
      opts.errModel = new ErrModel(ERR_RES.COMMENT.READ.NOT_EXIST);
      break;
    case ERR_RES.BLOG.READ.NO_ALBUM.errno:
      opts.errModel = new ErrModel(ERR_RES.BLOG.READ.NO_ALBUM);
  }
  opts = {
    page: FRONTEND_CONST.ERR_PAGE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    active: "permission",
    ...opts,
  };
  await ctx.render("page404", opts);
});

module.exports = router;
