import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.BLOG_TITLE}.json`,
    type: "object",
    properties: {
      title: {
        type: "string",
        $ref: `${DEFAULT_URL}/title`,
      },
    },
    required: ["title"],
    _notEmpty: ["title"],
    additionalProperties: false,
    errorMessage: {
      type: "驗證數據必須是 object 格式",
      required: "必填",
      additionalProperties: "混入了非正規數據",
    },
  };
}
