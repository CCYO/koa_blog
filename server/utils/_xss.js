/* CONFIG      ----------------------------------------------------------------------------- */
const { ENV } = require("../config");

const { _xss } = ENV.isProd
  ? require("../assets/js/common")
  : require("../dev_assets/js/common");

module.exports = _xss;
