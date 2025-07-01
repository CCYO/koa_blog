/**
 * @description 前後端共用的常數
 */

const { ENV } = require("./webpack");

const { CONST: COMMON } = ENV.isProd
  ? require("../../common/dist/common.cjs.js")
  : require("../../common/dist/dev_common.cjs.js");
module.exports = COMMON;
