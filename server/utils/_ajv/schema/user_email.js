const { USER_EMAIL } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${USER_EMAIL}.json`,
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
};
