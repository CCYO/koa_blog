const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.ALT.UPDATE}.json`,
  type: "object",
  properties: {
    _origin: {
      type: "object",
      errorMessage: {
        type: "_origin需是object",
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
  required: ["_origin", "blog_id", "alt", "alt_id"],
  additionalProperties: false,
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    additionalProperties: "不允許除了_origin、blog_id、alt_id、alt以外的數據",
  },
};
