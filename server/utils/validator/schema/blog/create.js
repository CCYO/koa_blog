const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.BLOG.CREATE}.json`,
  type: "object",
  properties: {
    title: {
      $ref: `${DEFAULT_URL}/title`,
    },
  },
  required: ["title"],
  _notEmpty: ["title"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    required: "必填",
  },
};
