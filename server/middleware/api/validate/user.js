/**
 * @description middleware validate
 */
const {
  SERVER: { AJV },
} = require("../../../config/_errRes");
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
  let errRes;
  switch (condition) {
    case "POST-/isEmailExist":
      action = "確認信箱是否可用";
      validate_result = await validator(TYPE.USER.EMAIL)(ctx.request.body);
      errRes = AJV.USER_IS_EMAIL_EXIST;
      break;
    case "POST-/register":
      action = "註冊";
      validate_result = await validator(TYPE.USER.REGISTER)(ctx.request.body);
      errRes = AJV.USER_REGISTER;
      break;
    case "POST-/":
      action = "登入";
      validate_result = await validator(TYPE.USER.LOGIN)(ctx.request.body);
      errRes = AJV.USER_LOGIN;
      break;
    case "PATCH-/":
      action = "更新";
      ctx.request.body._old = { ...ctx.session.user };
      if (ctx.request.body.hasOwnProperty("avatar")) {
        ctx.request.body.avatar_hash = ctx.request.query["avatar_hash"];
      }
      if (ctx.request.body.hasOwnProperty("age")) {
        ctx.request.body.age = Number.parseInt(ctx.request.body.age);
      }
      validate_result = await validator(TYPE.USER.SETTING)(ctx.request.body);
      errRes = AJV.USER_SETTING;
      break;
  }
  //    validate_result [ { <field_name>, <valid: boolean>, <value>, <message> }, ... ]
  throwErr(validate_result, method, errRes, action, to);
  return await next();
};
function throwErr(validate_result, method, errRes, action, to) {
  let invalid_list = validate_result.filter(({ valid }) => !valid);
  if (!invalid_list.length) {
    return;
  }
  let msg = `【${method}】/api/user/${to}\n 資料校驗錯誤\n data: ${JSON.stringify(
    invalid_list
  )}`;
  throw new MyErr({
    ...errRes,
    error: new Error(msg),
  });
}
