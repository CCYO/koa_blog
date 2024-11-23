import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.REGISTER}.json`,
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
    additionalProperties: false,
    required: ["email", "password", "password_again"],
    _notEmpty: ["email", "password", "password_again"],
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  };
}
