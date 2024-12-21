const ENV = require("./env");

// const { CONST: COMMON } = ENV.isProd
//   ? require("../assets/js/common")
//   : require("../dev_assets/js/common");

const { CONST: COMMON } = ENV.isProd
  ? require("../../common/dist/common.cjs.js")
  : require("../../common/dist/dev_common.cjs.js");

module.exports = COMMON;
