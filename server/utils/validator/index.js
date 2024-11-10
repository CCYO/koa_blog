const keyword_list = require("./keyword");
const check = require("./check");
const AJV_CONFIG = require("./config");

const Ajv2019 = require("ajv/dist/2019");
const addFormats = require("ajv-formats");
const AjvErrors = require("ajv-errors");

const schema_list = require("./schema");

module.exports = class extends Ajv2019 {
  constructor(axios) {
    //  建立ajv instance
    super({
      allErrors: true,
      $data: true,
    });
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
};
