/**
 * @description middleware validate
 */
const {
  ERR_RES: { USER },
} = require("../../../const");
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
  let reg = /\/api\/user(?:\/)?(?<to>[^\/\?]*)?.*/;
  let res = reg.exec(ctx.path);
  let to = res.groups.to ? res.groups.to : "";
  let condition = `${method}-/${to}`;
  switch (condition) {
    case "POST-/isEmailExist":
      validate_result = await _ajv._validate[_ajv._type.USER_EMAIL](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, USER.READ.AJV_IS_EMAIL_EXIST, method, to);
      }
      break;
    case "POST-/register":
      validate_result = await _ajv._validate[_ajv._type.REGISTER](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, USER.CREATE.AJV_REGISTER, method, to);
      }
      break;
    case "POST-/":
      validate_result = await _ajv._validate[_ajv._type.LOGIN](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, USER.READ.AJV_LOGIN, method, to);
      }
      break;
    case "PATCH-/":
      ctx.request.body._old = { ...ctx.session.user };
      if (ctx.request.body.hasOwnProperty("avatar")) {
        ctx.request.body.avatar_hash = ctx.request.query["avatar_hash"];
      }
      if (ctx.request.body.hasOwnProperty("age")) {
        ctx.request.body.age = Number.parseInt(ctx.request.body.age);
      }
      validate_result = await _ajv._validate[_ajv._type.SETTING](
        ctx.request.body
      );
      if (!validate_result.valid) {
        throwErr(validate_result, USER.UPDATE.AJV_SETTING, method, to);
      } else {
        ctx.request.body._origin = {
          user_id: ctx.session.user.id,
          email: ctx.session.user.email,
        };
        delete ctx.request.body.password_again;
      }
      break;
  }
  delete ctx.request.body._old;
  return await next();
};
function throwErr(result, errRes, method, to) {
  let msg = `【${method}】/api/user/${to}\n 資料校驗錯誤\n data: ${JSON.stringify(
    result
  )}`;
  throw new MyErr({
    ...errRes,
    error: new Error(msg),
  });
}
