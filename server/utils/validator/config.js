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
    ALT: {
      UPDATE: "alt_update",
    },
  },
  ERROR_PARAMS: {
    required: "missingProperty",
    dependentRequired: "missingProperty",
    additionalProperties: "additionalProperty",
    _noSpace: "_noSpace",
    _notOrigin: "_noOrigin",
    _notEmpty: "_notEmpty",
  },
  FIELD_NAME: {
    TOP: "all",
  },
};
