const HOST = "http://my_ajv";
const TYPE = {
  DEFAULT: "default",
  REGISTER: "user_register",
  LOGIN: "user_login",
  SETTING: "user_setting",
  USER_EMAIL: "user_email",
  IMG_ALT: "img_alt",
  BLOG_TITLE: "blog_title",
  BLOG_UPDATE: "blog_update",
  BLOG_IMG: "blog_img_create",
};
//  參考 https://ajv.js.org/api.html#error-parameters
const ERROR_PARAMS = {
  required: "missingProperty",
  dependentRequired: "missingProperty",
  additionalProperties: "additionalProperty",
  _noSpace: "_noSpace",
  _notRepeat: "_notRepeat",
  _notEmpty: "_notEmpty",
};

module.exports = {
  HOST,
  TYPE,
  ERROR_PARAMS,
};
