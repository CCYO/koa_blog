const AJV_CONFIG = require("../config");
const DEFAULT_URL = `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.IMG_ALT}.json`,
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

  _noSpace: ["alt"],
  required: ["_old", "blog_id", "alt", "alt_id"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
  },
};
