const router = require("koa-router")();
const { ERR_RES } = require("../../config");
const { ErrModel } = require("../../utils/model");

//  預判過的錯誤
router.get("/permission/:errno", async (ctx) => {
  let opts = {};
  switch (ctx.params.errno * 1) {
    //  此API需要登入權限
    case ERR_RES.SERVER.RESPONSE.NO_LOGIN.errno:
      opts.errModel = new ErrModel(ERR_RES.SERVER.RESPONSE.NO_LOGIN);
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
  await ctx.render("page404", opts);
});
//  意料外的錯誤
router.get("/serverError", async (ctx) => {
  let opts = {
    errModel: new ErrModel(ERR_RES.SERVER.RESPONSE.ERR_500),
  };
  await ctx.render("page404", opts);
});

module.exports = router;
