/**
 * @description middleware validate
 */
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
const C_BlogImgAlt = require("../../../controller/blogImgAlt");
const { MyErr } = require("../../../utils/model");
const { ERR_RES } = require("../../../config");
/** Middleware - 校驗 USER 資料
 * @param {*} ctx
 * @param {function} next
 * @returns
 */
module.exports = async (ctx, next) => {
  let action;
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/album(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  let error_status;
  switch (condition) {
    case "PATCH-/":
      action = "更新ALT";
      let { data } = await C_BlogImgAlt.findWholeInfo({
        author_id: ctx.session.user.id,
        blog_id: ctx.request.body.blog_id,
        alt_id: ctx.request.body.alt_id,
      });
      let _origin = { alt: data.alt };
      let newData = { ...ctx.request.body, _origin };
      validate_result = await validator(TYPE.ALT.UPDATE)(newData);
      error_status = ERR_RES.BLOG_IMG_ALT.UPDATE.ERR;
      break;
  }
  //    validate_result [ item, ... ]
  //    item { <field_name>, <valid>, <value|message> }
  let invalid_list = validate_result.filter(({ valid }) => !valid);
  if (invalid_list.length) {
    throw new MyErr({
      ...error_status,
      error: new Error(JSON.stringify(invalid_list)),
    });
  }
  return await next();
};
