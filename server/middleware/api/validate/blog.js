/**
 * @description middleware validate
 */
const { BLOG, BLOG_IMG } = require("../../../config/_errRes");
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
const C_Blog = require("../../../controller/blog");
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
      validate_result = await validator(TYPE.BLOG.CREATE)(ctx.request.body);
      errRes = BLOG.CREATE.AJV_CREATE;
      break;
    case "POST-/img":
      ctx.request.query.blog_id *= 1;
      if (ctx.request.query.blogImg_id) {
        ctx.request.query.blogImg_id *= 1;
      }
      if (ctx.request.query.img_id) {
        ctx.request.query.img_id *= 1;
      }
      validate_result = await validator(TYPE.BLOG_IMG.CREATE)(
        ctx.request.query
      );
      errRes = BLOG_IMG.CREATE.AJV_CREATE;
      break;
    case "PATCH-/":
      let opts = {
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
      };
      // 找出原值比對
      let { data } = await C_Blog.checkPermission(opts);
      // data { title, html, show };
      ctx.request.body._old = data;
      validate_result = await validator(TYPE.BLOG.UPDATE)(ctx.request.body);
      errRes = BLOG.UPDATE.AJV_UPDATE;
      break;
  }
  //    validate_result [ item, ... ]
  //    item { <field_name>, <valid>, <value|message> }
  throwErr(validate_result, method, errRes, to);
  delete ctx.request.body._old;
  return await next();
};
function throwErr(validate_result, method, errRes, to) {
  let invalid_list = validate_result.filter(({ valid }) => !valid);
  if (!invalid_list.length) {
    return;
  }
  let msg = `【${method}】/api/blog/${to}\n 資料校驗錯誤\n data: ${JSON.stringify(
    invalid_list
  )}`;
  throw new MyErr({
    ...errRes,
    error: new Error(msg),
  });
}
