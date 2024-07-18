const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.USER.EMAIL}.json`,
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
