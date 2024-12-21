/* CONFIG      ----------------------------------------------------------------------------- */
const { ENV } = require("../config");

// const { _xss } = ENV.isProd
//   ? require("../assets/js/common")
//   : require("../dev_assets/js/common");

const { _xss } = ENV.isProd
  ? require("../../common/dist/common.cjs.js")
  : require("../../common/dist/dev_common.cjs.js");

module.exports = _xss;
