module.exports = {
  HOST: "http://my_ajv",
  TYPE: {
    DEFAULT: "default",
    USER: {
      EMAIL: "user_email",
      REGISTER: "user_register",
      LOGIN: "user_login",
      SETTING: "user_setting",
    },
    BLOG: {
      CREATE: "blog_create",
      UPDATE: "blog_update",
    },
    BLOG_IMG: {
      CREATE: "blog_img_create",
    },
    ALT: {
      UPDATE: "alt_update",
    },
  },
  ERROR_PARAMS: {
    required: "missingProperty",
    dependentRequired: "missingProperty",
    additionalProperties: "additionalProperty",
    _noSpace: "_noSpace",
    _notRepeat: "_notRepeat",
    _notEmpty: "_notEmpty",
  },
};
