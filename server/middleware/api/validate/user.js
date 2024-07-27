/**
 * @description middleware validate
 */
const { USER } = require("../../../config/_errRes");
const { TYPE } = require("../../../utils/validator/config");
const validator = require("../../../utils/validator");
const { MyErr } = require("../../../utils/model");

/** Middleware - 校驗 USER 資料
 * @param {*} ctx
 * @param {function} next
 * @returns
 */
module.exports = async (ctx, next) => {
  let validate_result = [];
  let method = ctx.method.toUpperCase();
  let reg = /\/api\/user(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  let errRes;
  switch (condition) {
    case "POST-/isEmailExist":
      validate_result = await validator(TYPE.USER.EMAIL)(ctx.request.body);
      errRes = USER.READ.AJV_IS_EMAIL_EXIST;
      break;
    case "POST-/register":
      validate_result = await validator(TYPE.USER.REGISTER)(ctx.request.body);
      errRes = USER.CREATE.AJV_REGISTER;
      break;
    case "POST-/":
      validate_result = await validator(TYPE.USER.LOGIN)(ctx.request.body);
      errRes = USER.READ.AJV_LOGIN;
      break;
    case "PATCH-/":
      ctx.request.body._old = { ...ctx.session.user };
      if (ctx.request.body.hasOwnProperty("avatar")) {
        ctx.request.body.avatar_hash = ctx.request.query["avatar_hash"];
      }
      if (ctx.request.body.hasOwnProperty("age")) {
        ctx.request.body.age = Number.parseInt(ctx.request.body.age);
      }
      validate_result = await validator(TYPE.USER.SETTING)(ctx.request.body);
      errRes = USER.UPDATE.AJV_SETTING;
      break;
  }
  //    validate_result [ { <field_name>, <valid: boolean>, <value>, <message> }, ... ]
  throwErr(validate_result, method, errRes, to);
  delete ctx.request.body._old;
  return await next();
};
function throwErr(validate_result, method, errRes, to) {
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
