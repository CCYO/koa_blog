import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.EMAIL_CODE}.json`,
    type: "object",
    properties: {
      code: {
        type: "string",
        $ref: `${DEFAULT_URL}/email_code`,
      },
    },
    additionalProperties: true,
    errorMessage: {
      type: "必須是object",
      additionalProperties: "屬於非法數據",
      required: "缺少此數據",
    },
    required: ["code"],
    _notEmpty: ["code"],
  };
}
