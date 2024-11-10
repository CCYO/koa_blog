const AJV_CONFIG = require("../config");
const DEFAULT_URL = `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.USER_EMAIL}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${DEFAULT_URL}/email`,
    },
  },
  required: ["email"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
