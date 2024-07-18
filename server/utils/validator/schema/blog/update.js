const { HOST, TYPE } = require("../../config");
const DEFAULT_URL = `${HOST}/${TYPE.DEFAULT}.json#/definitions`;

module.exports = {
  $id: `${HOST}/${TYPE.BLOG.UPDATE}.json`,
  type: "object",
  minProperties: 2,
  properties: {
    _origin: {
      type: "object",
      errorMessage: {
        type: "_origin需是object",
      },
    },
    title: {
      $ref: `${DEFAULT_URL}/title`,
    },
    html: {
      $ref: `${DEFAULT_URL}/html`,
    },
    show: {
      $ref: `${DEFAULT_URL}/show`,
    },
    cancelImgs: {
      $ref: `${DEFAULT_URL}/cancelImgs`,
    },
  },
  _notOrigin: ["title", "html", "show"],
  errorMessage: {
    type: "驗證數據必須是 object 格式",
    minProperties: "至少需改1筆資料",
  },
};
