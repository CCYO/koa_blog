const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.BLOG_IMG.CREATE}.json`,
  type: "object",
  properties: {
    blog_id: {
      type: "integer",
      $ref: `${DEFAULT_URL}/blog_id`,
    },
    hash: {
      type: "string",
      $ref: `${DEFAULT_URL}/hash`,
    },
    ext: {
      $ref: `${DEFAULT_URL}/img_ext`,
    },
  },
  _notEmpty: ["hash", "ext"],
  _noSpace: ["hash", "ext"],
  required: ["blog_id", "ext"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
  },
};
