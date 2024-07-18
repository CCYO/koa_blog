const HOST = "http://my_ajv";
const TYPE = {
  DEFAULT: "default",
  //	register&login/register
  REGISTER: "register",
  IS_EMAIL_EXIST: "is_email_exist",
  PASSOWRD_AGAIN: "password_again",
  //	register&login/login
  LOGIN: "login",
  //	user/self
  BLOG_TITLE: "blog_title",
  //	blog-editor
  BLOG: "blog",
  //	album
  IMG_ALT: "img_alt",
  //	setting
  SETTING: "setting",
  PASSWORD: "password",
  AVATAR: "avatar",
};
//  參考 https://ajv.js.org/api.html#error-parameters
const ERROR_PARAMS = {
  required: "missingProperty",
  dependentRequired: "missingProperty",
  additionalProperties: "additionalProperty",
  _notEmpty: "_notEmpty",
  _notRepeat: "_notRepeat",
  _noSpace: "noSpace",
};

export default {
  HOST,
  TYPE,
  ERROR_PARAMS,
};
