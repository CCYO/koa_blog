/**
 * @description middleware validate
 */
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
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
  let reg = /\/api\/user(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "POST-/isEmailExist":
      action = "確認信箱是否可用";
      // validate_result = await validator.user(TYPE.EMAIL)(ctx.request.body);
      validate_result = await validator(TYPE.USER.EMAIL)(ctx.request.body);
      break;
    case "POST-/register":
      action = "註冊";
      // validate_result = await validator.user(TYPE.REGISTER)(ctx.request.body);
      validate_result = await validator(TYPE.USER.REGISTER)(ctx.request.body);
      break;
    case "POST-/":
      action = "登入";
      // validate_result = await validator.user(TYPE.LOGIN)(ctx.request.body);
      validate_result = await validator(TYPE.USER.LOGIN)(ctx.request.body);
      break;
    case "PATCH-/":
      action = "更新";
      ctx.request.body._origin = { ...ctx.session.user };
      if (ctx.request.body.hasOwnProperty("avatar")) {
        ctx.request.body.avatar_hash = ctx.request.query["avatar_hash"];
      }
      if (ctx.request.body.hasOwnProperty("age")) {
        ctx.request.body.age = Number.parseInt(ctx.request.body.age);
      }
      // validate_result = await validator.user(TYPE.SETTING)(ctx.request.body);
      validate_result = await validator(TYPE.USER.SETTING)(ctx.request.body);
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
