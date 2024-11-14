// 前後端相同
const AJV_CONFIG = require("../config");
const DEFAULT_URL = `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${AJV_CONFIG.HOST}/${AJV_CONFIG.TYPE.BLOG_TITLE}.json`,
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
