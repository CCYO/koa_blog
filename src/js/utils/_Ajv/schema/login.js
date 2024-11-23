import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.LOGIN}.json`,
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
    // required: ["email", "password"],
    _notEmpty: ["email", "password"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  };
}
