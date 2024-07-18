import AJV_CONFIG from "../config";

const { HOST, TYPE } = AJV_CONFIG;
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

export default {
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
