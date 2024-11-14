const keyword_list = require("./keyword");
const check = require("./check");

// 1) npm 取出 { default } + module.exports = { _my } ok
// const { default: Ajv2019_default } = require("ajv/dist/2019");
// 2) npm 取出 ajv2019 + extends 2019.default + module.exports = { _my }
const ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");
// const { _Ajv } = require("../../src/js/utils");

// class _my extends Ajv2019_default {
const { default: d } = ajv2019;
console.log("ajv2019 === ajv2019.default", ajv2019 === ajv2019.default);
class _Ajv extends d {
  constructor({ axios, schema_list, AJV_CONFIG }) {
    //  建立ajv instance
    super({
      allErrors: true,
      $data: true,
    });
    console.log("建立_Ajv ins");
    //  添加功能:自定義錯誤提示
    AjvErrors(this);
    //  添加format關鍵字
    addFormats(this);
    //  添加schema
    this.addSchema(schema_list);
    //  添加自定義關鍵字
    keyword_list.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    //  添加axios(async性質的schema需要用到)
    if (axios) {
      this.$$axios = axios;
    }
    //  自定義校驗函數
    this._validate = {};

    for (let type in AJV_CONFIG.TYPE) {
      let key = AJV_CONFIG.TYPE[type];
      let id = `${AJV_CONFIG.HOST}/${key}.json`;
      let validate = this.getSchema(id);
      this._validate[key] = check.bind(validate);
    }
  }
}
module.exports = _Ajv;
