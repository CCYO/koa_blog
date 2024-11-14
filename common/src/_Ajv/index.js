import keyword_list from "./keyword";
import check from "./check";

import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import AjvErrors from "ajv-errors";

export default class extends Ajv2019 {
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
