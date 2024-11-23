const { REGISTER } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${REGISTER}.json`,
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
};
