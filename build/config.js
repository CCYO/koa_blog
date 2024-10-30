/**
 * @description webpack文件打包的相關配置
 */

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");
/* VAR        ----------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  PUBLIC_PATH: "/public",
  //  存放的資料夾名稱
  BUILD: {
    DIST: isProd
      ? resolve(__dirname, "../server/assets")
      : resolve(__dirname, "../server/dev_assets"),
    VIEW: isProd
      ? resolve(__dirname, "../server/views")
      : resolve(__dirname, "../server/dev_views"),
    STYLE: "css",
    SCRIPT: "js",
    FONT: "fonts",
    IMAGE: "imgs",
  },
};
