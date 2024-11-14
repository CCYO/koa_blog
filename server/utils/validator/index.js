const { _Ajv } = require("../../../common/dist/index.cjs");
const schema_list = require("./schema");
const AJV_CONFIG = require("./config");
const _ajv = new _Ajv({
  schema_list,
  AJV_CONFIG,
});
module.exports = _ajv;
