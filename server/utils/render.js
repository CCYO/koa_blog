/* CONFIG      ----------------------------------------------------------------------------- */
const { ENV } = require("../config");

const { render } = ENV.isProd
  ? require("../assets/js/common")
  : require("../dev_assets/js/common");

module.exports = render;
