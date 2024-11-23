const { _Ajv } = require("../../../common/dist/index.cjs.js");
const schemaFn_list = require("./schema");
const type = require("./type");
const _ajv = new _Ajv({
  schemaFn_list,
  type,
});
module.exports = _ajv;
