const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.USER.LOGIN}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${DEFAULT_URL}/email`,
    },
    password: {
      type: "string",
      $ref: `${DEFAULT_URL}/password`,
    },
  },
  required: ["email", "password"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
