/**
 * @description middleware validate
 */
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
  let action;
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/blog(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "POST-/":
      action = "建立BLOG";
      validate_result = await validator(TYPE.BLOG.CREATE)(ctx.request.body);
      break;
    case "PATCH-/":
      action = "更新BLOG";
      let opts = {
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
      };
      let { data } = await C_Blog.checkPermission(opts);
      let { title, html, show } = data;
      let _origin = { title, html, show };
      let newData = { ...ctx.request.body, _origin };
      validate_result = await validator(TYPE.BLOG.UPDATE)(newData);
      break;
  }
  //    validate_result [ item, ... ]
  //    item { <field_name>, <valid>, <value|message> }
  let invalid_list = validate_result.filter(({ valid }) => !valid);
  if (invalid_list.length) {
    throw new MyErr("VALIDATE 捕捉到資料校驗錯誤");
  }
  return await next();
};
