import TYPE from "../type";
export default function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${TYPE.BLOG}.json`,
    type: "object",
    properties: {
      _old: {
        type: "object",
        errorMessage: {
          type: "_old需是object",
        },
      },
      title: {
        type: "string",
        $ref: `${DEFAULT_URL}/title`,
      },
      html: {
        type: "string",
        $ref: `${DEFAULT_URL}/html`,
      },
      show: {
        type: "boolean",
        $ref: `${DEFAULT_URL}/show`,
      },
      cancelImgs: {
        $ref: `${DEFAULT_URL}/cancelImgs`,
      },
    },
    _notRepeat: ["title", "html", "show"],
    _notEmpty: ["title"],
    minProperties: 2,
    additionalProperties: false,
    errorMessage: {
      minProperties: "至少需改一筆資料",
      additionalProperties: "多了",
    },
  };
}
