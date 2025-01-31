/* CONFIG     ----------------------------------------------------------------------------- */
const {
  CACHE: {
    REGISTER_CODE: { REFRESH, TTL },
  },
  ERR_RES,
} = require("../config");

/* SERVER     ----------------------------------------------------------------------------- */
const CacheRegisterCode = require("../server/cache_register_code");

/* UTILS      ----------------------------------------------------------------------------- */
const { SuccModel, ErrModel } = require("../utils/model");
const U_mail = require("../utils/mail");

async function getCode(email) {
  // { code, expire } || null
  let data = await CacheRegisterCode.read(email);
  // 還未超過能夠刷新驗證碼的時間
  if (data && TTL - REFRESH > data.expire - Date.now()) {
    return new SuccModel({ data: { expire: data.expire, REFRESH, TTL } });
  }
  let { code, expire } = await CacheRegisterCode.create(email);
  await U_mail(email, code);
  return new SuccModel({ data: { expire, REFRESH, TTL } });
}

async function checkCode(email, code) {
  let data = await CacheRegisterCode.read(email);
  if (!data) {
    let { expire, code } = await CacheRegisterCode.create(email);
    await U_mail(email, code);
    return new ErrModel({
      ...ERR_RES.USER.CREATE.REGISTER_CODE_EXPIRE,
      data: { expire, REFRESH, TTL },
    });
  }
  if (data.code === code) {
    // 驗證成功
    await CacheRegisterCode.remove(email);
    return new SuccModel();
  } else {
    // 驗證失敗
    return new ErrModel(ERR_RES.USER.CREATE.REGISTER_CODE_FAIL);
  }
}

module.exports = {
  getCode,
  checkCode,
};
