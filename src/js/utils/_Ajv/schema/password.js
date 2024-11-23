import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.PASSWORD}.json`,
    type: "object",
    properties: {
      origin_password: {
        type: "string",
        $ref: `${DEFAULT_URL}/password`,
      },
    },
    required: ["origin_password"],
    _notEmpty: ["origin_password"],
    additionalProperties: false,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
  };
}
