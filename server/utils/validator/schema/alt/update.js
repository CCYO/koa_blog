const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.ALT.UPDATE}.json`,
  type: "object",
  properties: {
    _old: {
      type: "object",
      errorMessage: {
        type: "_old需是object",
      },
    },
    blog_id: {
      $ref: `${DEFAULT_URL}/blog_id`,
    },
    alt_id: {
      $ref: `${DEFAULT_URL}/alt_id`,
    },
    alt: {
      $ref: `${DEFAULT_URL}/alt`,
    },
  },
  _notOrigin: ["alt"],
  _noSpace: ["alt"],
  required: ["_old", "blog_id", "alt", "alt_id"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
  },
};
