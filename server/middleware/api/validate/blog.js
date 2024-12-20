/**
 * @description middleware validate
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const {
  ERR_RES: { BLOG, BLOG_IMG },
} = require("../../../config");

/* CONTROLLER ----------------------------------------------------------------------------- */
const C_Blog = require("../../../controller/blog");

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
  let reg = /\/api\/blog(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "POST-/":
      validate_result = await _ajv._validate[_ajv._type.BLOG_TITLE](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, BLOG.CREATE.AJV_CREATE, method, to);
      }
      break;
    case "POST-/img":
      ctx.request.query.blog_id *= 1;
      if (ctx.request.query.blogImg_id) {
        ctx.request.query.blogImg_id *= 1;
      }
      if (ctx.request.query.img_id) {
        ctx.request.query.img_id *= 1;
      }
      validate_result = await _ajv._validate[_ajv._type.BLOG_IMG](
        ctx.request.query
      );
      if (!validate_result.valid) {
        throwErr(validate_result, BLOG_IMG.CREATE.AJV_CREATE, method, to);
      }
      break;
    case "PATCH-/":
      let opts = {
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
      };
      // 找出原值比對
      let resModel = await C_Blog.checkPermission(opts);
      if (resModel.errno) {
        throwErr(resModel, BLOG.UPDATE.AJV_UPDATE, method, to);
      }
      // data { title, html, show };
      ctx.request.body._old = resModel.data;
      validate_result = await _ajv._validate[_ajv._type.BLOG_UPDATE](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, BLOG.UPDATE.AJV_UPDATE, method, to);
      }
      break;
  }
  delete ctx.request.body._old;
  return await next();
};
function throwErr(result, errRes, method, to) {
  let msg = `【${method}】/api/blog/${to}\n 資料校驗錯誤\n data: ${JSON.stringify(
    result
  )}`;
  throw new MyErr({
    ...errRes,
    error: new Error(msg),
  });
}
