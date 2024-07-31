const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.USER.REGISTER}.json`,
  type: "object",
  properties: {
    email: {
      type: "string",
      $ref: `${DEFAULT_URL}/email`,
      isEmailExist: true,
    },
    password: {
      type: "string",
      $ref: `${DEFAULT_URL}/password`,
    },
    password_again: {
      type: "string",
      $ref: `${DEFAULT_URL}/password_again`,
    },
  },
  required: ["email", "password", "password_again"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
