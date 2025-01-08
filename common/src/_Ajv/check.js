import Ajv2019 from "ajv/dist/2019";
import { ERROR_PARAMS } from "./ERROR_PARAMS";

const TOP_FIELD = "all";
const isProd = process.env.isProd;

export default async function (data, ignore_list = []) {
  let validated_errors = {};
  try {
    let validate = this;
    if (validate.$async) {
      await validate(data);
    } else {
      let valid = validate(data);
      if (!valid) {
        throw new Ajv2019.ValidationError(validate.errors);
      }
    }
  } catch (invalid_errors) {
    if (invalid_errors instanceof Ajv2019.ValidationError) {
      validated_errors = _init_errors(invalid_errors.errors);
    } else {
      throw invalid_errors;
    }
  }
  ignore_list = [...new Set(ignore_list).add("_old")];
  return _parseErrorsToForm(validated_errors, data, ignore_list);
}
//  將校驗錯誤初始化為
//  {
//    all: { [keyword]: { list, message } },
//    [property]: [ { [keyword], [message] }, ... ], ...
//  }
function _init_errors(invalid_errors) {
  !isProd && console.log("@整理前的validateErrors => ", invalid_errors);

  let acc = { [TOP_FIELD]: [] };
  let res = invalid_errors.reduce((acc, invalid_error) => {
    let {
      //  原生狀況：顯示發生錯誤的keyword
      //  "errorMessage"：代表此校驗錯誤是ajv-errors預先設定的，而原生keyword能在paramsItem找到
      //  "myKeyword"：自訂義keyword
      keyword,
      //  依據keyword，params有不同內容
      //  "errorMessage"：代表此校驗錯誤是ajv-errors預先設定的，params內容為原生錯誤
      //  "myKeyword"：自訂義keyword所設計的params，
      ////  paramsItem { keyword: 自訂義keyword, params: { 自訂義的params-kvpairs } }
      params,
      //  JSON Pointer：代表被校驗的資料為主體，實際發生錯誤的位置(ex: "/email")
      //  ""：代表指向的錯誤位置，高過於被校驗的資料的級別(ex: schema.if)
      //  無論是否自訂義keyword，都是自動生成
      instancePath,
      //  依據keyword，params有不同內容
      //  原生狀況：錯誤提醒
      //  "errorMessage"：ajv-errors預先設定的錯誤提醒
      //  "myKeyword"：自訂義keyword的校驗函數設定錯誤提醒
      message,
    } = invalid_error;
    //  ↓ 忽略未自定義message的校驗錯誤
    if (!["errorMessage", "myKeyword"].some((item) => item === keyword)) {
      !isProd && console.log(`@keyword: ${keyword} 沒有預定義錯誤訊息，故忽略`);
      return acc;
    }
    let { errors } = params;
    // JSON Pointer 級別高過於被校驗資料的錯誤
    if (!instancePath) {
      errors.reduce((_acc, error) => {
        let { keyword: origin_keyword, params: origin_params } = error;
        let key = ERROR_PARAMS[origin_keyword];
        let field_name = origin_params[key];
        let item = _acc.find(({ keyword }) => keyword === origin_keyword);
        if (!item) {
          _acc.push({ keyword: origin_keyword, list: [field_name], message });
        } else {
          item.list.push(field_name);
        }
        return _acc;
      }, acc[TOP_FIELD]);
      return acc;
    }
    // JSON Pointer 級別與被校驗資料相同&以下的錯誤
    //  { [field_name]: [{ keyword, message }, ...], ... }
    let field_name = instancePath.split("/").pop();
    let { keyword: origin_keyword } = errors[0];
    if (!acc[field_name]) {
      acc[field_name] = [];
    }
    ////  忽略掉重複性的keyword(錯誤)，通常會因為如allOf設定的條件，指定一個property重複的keyword而發生
    if (!acc[field_name].some(({ keyword }) => keyword === origin_keyword)) {
      acc[field_name].push({ keyword: origin_keyword, message });
    }
    return acc;
  }, acc);
  !isProd && console.log("@整理後的validateErrors => ", res);
  return res;
}
//  將轉化後的校驗錯誤再轉化為
//  [
//    { field_name, valid: boolean, <message|value>, }, ...
//  ]
function _parseErrorsToForm(invalid_errors, data, ignore_list = []) {
  //  先將傳入的 data properties 皆視為 valid，待會進行過濾
  let valid_list = Object.keys(data);
  let res_list = [];
  res_list.valid = !Object.getOwnPropertyNames(invalid_errors).length;
  if (!res_list.valid) {
    for (let error of invalid_errors[TOP_FIELD]) {
      // JSON Pointer 級別高過於被校驗資料的錯誤
      let { keyword, message, list } = error;
      for (let field_name of list) {
        if (!invalid_errors[field_name] || !invalid_errors[field_name].top) {
          ////  覆蓋掉同級以下的錯誤資訊
          invalid_errors[field_name] = {
            message,
            top: true,
            keyword: [keyword],
          };
        } else {
          invalid_errors[field_name].message += `,${message}`;
          invalid_errors[field_name].keyword.push(keyword);
        }
      }
    }
    delete invalid_errors[TOP_FIELD];
    //  過濾校驗錯誤field
    for (let field_name in invalid_errors) {
      valid_list = valid_list.filter((item) => item !== field_name);
    }
  }
  //  從 invalid_errors 與 valid_list 過濾掉 ignore_list
  for (let field_name of ignore_list) {
    valid_list = valid_list.filter((item) => item !== field_name);
    delete invalid_errors[field_name];
  }

  //  從 valid_errors 整理出校驗錯誤的各別結果給 res_list
  for (let field_name in invalid_errors) {
    let field_error = invalid_errors[field_name];
    // JSON Pointer 級別高過於被校驗資料的錯誤
    let keyword_and_message;
    if (field_error.top) {
      keyword_and_message = {
        message: (field_error.message += "。"),
        keyword: field_error.keyword,
      };
    } else {
      // JSON Pointer 級別與被校驗資料相同&以下的錯誤
      keyword_and_message = field_error.reduce(
        (acc, { message, keyword }, index) => {
          acc.keyword.push(keyword);
          if (!index) {
            acc.message = message;
            return acc;
          }
          acc.message += `,${message}`;
          if (index === field_error.length - 1) {
            acc.message += "。";
          }
          return acc;
        },
        { keyword: [], message: "" }
      );
    }
    let item = {
      field_name,
      value: data[field_name],
      valid: false,
      ...keyword_and_message,
    };
    res_list.push(item);
  }

  for (let field_name of valid_list) {
    res_list.push({ field_name, valid: true, value: data[field_name] });
  }
  !isProd && console.log("整理後的驗證結果 res_list => ", res_list);
  return res_list;
}
