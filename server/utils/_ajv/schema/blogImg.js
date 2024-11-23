const { BLOG_IMG } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${BLOG_IMG}.json`,
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
};
