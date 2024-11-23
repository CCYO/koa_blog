import default_schema from "./schema";
import keyword_list from "./keyword";
import check from "./check";

import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import AjvErrors from "ajv-errors";
import AjvKeywords from "ajv-keywords";

import AJV_CONST from "./const";

export default class extends Ajv2019 {
  constructor({ axios, schemaFn_list, type }) {
    //  建立ajv instance
    super({
      allErrors: true,
      $data: true,
    });
    AjvKeywords(this);
    //  添加axios(async性質的schema需要用到)
    if (axios) {
      this.$$axios = axios;
    }
    this._type = type;
    //  自定義校驗函數
    this._validate = {};
    //  添加功能:自定義錯誤提示
    AjvErrors(this);
    //  添加format關鍵字
    addFormats(this);
    //  添加schema
    const schema_list = schemaFn_list.map((fn) =>
      fn(AJV_CONST.HOST, AJV_CONST.TYPE.DEFAULT)
    );
    this.addSchema([default_schema, ...schema_list]);
    //  添加自定義關鍵字
    keyword_list.forEach((keyword) => {
      this.addKeyword(keyword);
    });

    for (let key in type) {
      let validate = this.getSchema(`${AJV_CONST.HOST}/${type[key]}.json`);
      this._validate[type[key]] = check.bind(validate);
    }
  }
}
