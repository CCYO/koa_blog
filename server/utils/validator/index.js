const Ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");

const schema_list = require("./schema");
const keyword_list = require("./keyword");
const handle_error = require("./handle_error");
const VALIDATE_CONFIG = require("./config");

const ajv = new Ajv2019({
  strict: false,
  allErrors: true,
  $data: true,
});

addFormats(ajv);
//  為 ajv 添加 format 關鍵字，僅適用 string 與 number
AjvErrors(ajv);
//  可使用 errorMessage 自定義錯誤提示
ajv.addSchema(schema_list);
keyword_list.forEach((keyword) => {
  ajv.addKeyword(keyword);
});

module.exports = (type) => {
  let id = `${VALIDATE_CONFIG.HOST}/${type}.json`;
  let validate = ajv.getSchema(id);
  return handle_error.bind(validate);
};
