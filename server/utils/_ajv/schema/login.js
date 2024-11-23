const { LOGIN } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${LOGIN}.json`,
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
};
