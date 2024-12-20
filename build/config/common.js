/**
 * @description 前後端共用的常數
 */

const { CONST: COMMON } = process.env.isProd
  ? require("../../server/assets/js/common")
  : require("../../server/dev_assets/js/common");

module.exports = COMMON;
