const { ENV } = require("../config");

const { CONST: COMMON } = ENV.isProd
  ? require("../assets/js/common")
  : require("../dev_assets/js/common");

module.exports = COMMON;
