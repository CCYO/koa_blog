/**
 * @description 前後端共用的常數
 */

// const { CONST: COMMON } = process.env.isProd
//   ? require("../../server/assets/js/common")
//   : require("../../server/dev_assets/js/common");

const { CONST: COMMON } = process.env.isProd
  ? require("../../common/dist/common.cjs.js")
  : require("../../common/dist/dev_common.cjs.js");

module.exports = COMMON;
