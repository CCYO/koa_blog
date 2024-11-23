import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.IMG_ALT}.json`,
    type: "object",
    properties: {
      _old: {
        type: "object",
        errorMessage: {
          type: "_old需是object",
        },
      },
      alt: {
        type: "string",
        $ref: `${DEFAULT_URL}/alt`,
      },
      blog_id: {
        type: "integer",
        $ref: `${DEFAULT_URL}/blog_id`,
      },
      alt_id: {
        type: "integer",
        $ref: `${DEFAULT_URL}/alt_id`,
      },
    },
    _notEmpty: ["alt", "blog_id", "alt_id"],
    _notRepeat: ["alt"],
    minProperties: 2,
    additionalProperties: false,
    errorMessage: {
      minProperties: "至少需改一筆資料",
      additionalProperties: "多了",
      type: "必須是object",
    },
  };
}
