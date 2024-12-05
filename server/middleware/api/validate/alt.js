/**
 * @description middleware validate
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const {
  ERR_RES: { BLOG_IMG_ALT },
} = require("../../../config");

/* CONTROLLER ----------------------------------------------------------------------------- */
const C_BlogImgAlt = require("../../../controller/blogImgAlt");

/* UTILS      ----------------------------------------------------------------------------- */
const _ajv = require("../../../utils/_ajv");
const { MyErr } = require("../../../utils/model");

/** Middleware - 校驗 USER 資料
 * @param {*} ctx
 * @param {function} next
 * @returns
 */
module.exports = async (ctx, next) => {
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/album(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "PATCH-/":
      ctx.request.body.author_id = ctx.session.user.id;
      // 找出原值比對
      let { data } = await C_BlogImgAlt.findWholeInfo(ctx.request.body);
      ctx.request.body._old = { alt: data.alt };
      // ctx.request.body { author_id, blog_id, alt_id, alt, _old }
      validate_result = await _ajv._validate[_ajv._type.IMG_ALT](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, BLOG_IMG_ALT.UPDATE.AJV_UPDATE, method, to);
      }
      break;
  }
  delete ctx.request.body._old;
  return await next();
};
function throwErr(result, errRes, method, to) {
  let msg = `【${method}】/api/album/${to}\n 資料校驗錯誤\n data: ${JSON.stringify(
    result
  )}`;
  throw new MyErr({
    ...errRes,
    error: new Error(msg),
  });
}
