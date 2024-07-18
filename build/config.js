const { resolve } = require("path");
module.exports = {
  PUBLIC_PATH: "/public",
  //  存放的資料夾名稱
  BUILD: {
    DIST: resolve(__dirname, "../server/assets"),
    VIEW: resolve(__dirname, "../server/views"),
    STYLE: "css",
    SCRIPT: "js",
    FONT: "fonts",
    IMAGE: "imgs",
  },
};
