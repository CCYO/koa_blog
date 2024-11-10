const AJV_CONFIG = require("../config");
const DEFAULT_URL = `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.BLOG_UPDATE}.json`,
  type: "object",
  minProperties: 2,
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    blog_id: {
      type: "integer",
      $ref: `${DEFAULT_URL}/blog_id`,
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
  required: ["_old", "blog_id"],
  minProperties: 3,
  additionalProperties: false,
  errorMessage: {
    minProperties: "至少需改一筆資料",
    additionalProperties: "多了",
  },
};
