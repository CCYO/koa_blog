/* UTILS      ----------------------------------------------------------------------------- */
import list_ajv_keyword from "./keyword";
import check from "./validate";
import AJV_CONFIG from "./config";

/* NPM        ----------------------------------------------------------------------------- */
import Ajv2019 from "ajv/dist/2019";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

/* CUSTOM     ----------------------------------------------------------------------------- */
import schema_list from "./schema";

/* EXPORT     ----------------------------------------------------------------------------- */
export default class extends Ajv2019 {
  constructor(axios) {
    //  建立ajv instance
    super({
      allErrors: true,
      $data: true,
    });
    //  添加功能:自定義錯誤提示
    ajvErrors(this);
    //  添加format關鍵字
    addFormats(this);
    //  添加自定義關鍵字
    for (let keyword of list_ajv_keyword) {
      this.addKeyword(keyword);
    }
    //  添加schema
    this.addSchema(schema_list);
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
