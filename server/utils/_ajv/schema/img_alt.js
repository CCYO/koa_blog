const { IMG_ALT } = require("../type");
module.exports = function (HOST, DEFAULT) {
  const DEFAULT_URL = `${HOST}/${DEFAULT}.json#/definitions`;
  return {
    $id: `${HOST}/${IMG_ALT}.json`,
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
};
