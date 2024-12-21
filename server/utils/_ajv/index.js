/* CONFIG      ----------------------------------------------------------------------------- */
const { ENV } = require("../../config");

// const { _Ajv } = ENV.isProd
//   ? require("../../assets/js/common")
//   : require("../../dev_assets/js/common");

const { _Ajv } = ENV.isProd
  ? require("../../../common/dist/common.cjs.js")
  : require("../../../common/dist/dev_common.cjs.js");

const schemaFn_list = require("./schema");
const type = require("./type");
const _ajv = new _Ajv({
  schemaFn_list,
  type,
});

module.exports = _ajv;
