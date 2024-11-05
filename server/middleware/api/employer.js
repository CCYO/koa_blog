const { ErrModel } = require("../../utils/model");
const { ERR_RES, EMPLOYER, ME } = require("../../config");
const C_articleReader = require("../../controller/articleReader");
const C_idolFans = require("../../controller/idolFans");

async function prohibit_cancel_Follow_me(ctx, next) {
  if (ctx.session.user.id === EMPLOYER.ID && ctx.request.body.id === ME.ID) {
    ctx.body = new ErrModel(ERR_RES.IDOL_FANS.REMOVE.NOT_ALLOW_FOR_EMPLOYER);
    return;
  }
  await next();
}

async function prohibit_setting(ctx, next) {
  if (ctx.session.user.id !== EMPLOYER.ID) {
    await next();
    return;
  }
  ctx.body = new ErrModel(ERR_RES.USER.UPDATE.NOT_ALLOW_FOR_EMPLOYER);
}

async function resetNews(ctx, next) {
  await next();
  if (ctx.body.errno || ctx.session.user.id !== EMPLOYER.ID) {
    return;
  }
  await C_articleReader.modify(EMPLOYER.ARICLE_READER.ID, {
    confirm: false,
  });
  await C_idolFans.modify(EMPLOYER.IDOL_FANS.ID, {
    confirm: false,
  });
}

module.exports = {
  resetNews,
  prohibit_setting,
  prohibit_cancel_Follow_me,
};
