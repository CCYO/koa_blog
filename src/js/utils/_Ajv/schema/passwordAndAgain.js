import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.PASSOWRD_AGAIN}.json`,
    type: "object",
    properties: {
      password: {
        type: "string",
        $ref: `${DEFAULT_URL}/password`,
      },
      password_again: {
        type: "string",
        $ref: `${DEFAULT_URL}/password_again`,
      },
    },
    required: ["password", "password_again"],
    _notEmpty: ["password", "password_again"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  };
}
