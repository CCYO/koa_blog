/**
 * @description  取得webpack.base.config內，plugins中的htmlWebpackPlugins
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("../config");

/* NODEJS     ----------------------------------------------------------------------------- */
const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const HtmlWebpackPlugin = require("html-webpack-plugin");

/* VAR        ----------------------------------------------------------------------------- */

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (function () {
  const result = [];
  let template_dir = resolve(__dirname, "../../src/views/**/*.ejs");
  let dirList = glob.sync(template_dir);
  dirList.forEach((filepath) => {
    /**
     * ~/.../views/pages/[TypeName]/index.ejs
     * ~/.../views/pages/[TypeName]/component/*.ejs     --> 提供index.ejs使用
     * ~/.../views/pages/[TypeName]/template/*.ejs      --> 提供src/js/utils/render與server/js/utils/render使用
     * ~/.../views/wedgets/[wedgetType]/index.ejs
     * ~/.../views/wedgets/[wedgetType]/component/*.ejs
     * ~/.../views/wedgets/[wedgetType]/template/*.ejs  --> 提供src/js/utils/render使用
     */
    let array_filepath = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    array_filepath.shift();
    const filename = array_filepath.pop(); //  移除、取得原檔名
    const isPage = !!array_filepath.find((item) => item === "pages");
    const isTemplate = !!array_filepath.find((item) => item === "template");
    const isComponent = !!array_filepath.find((item) => item === "components");
    const isPageIndex = isPage && !isTemplate && !isComponent;
    let index_views = array_filepath.findIndex((item) => item === "views");

    let target_folder;

    if (isTemplate) {
      return;
    }
    // src -> server
    array_filepath[index_views - 1] = "server";
    if (!WEBPACK.ENV.isProd) {
      // views -> dev_views
      array_filepath[index_views] = "dev_views";
    }

    array_filepath.findIndex((folder) => folder);
    //  創建 server/[dev_]views 內，除了 isPageIndex 以外的 ejs
    for (let [index, folder] of array_filepath.entries()) {
      if (
        // 不用生成 pages 資料夾
        folder === "pages" ||
        // [page]/index.ejs 由 HtmlWebpackPlugin 生成
        isPageIndex
      ) {
        continue;
      }
      //  ejs檔要存放的folder
      target_folder = !index ? `/${folder}` : `${target_folder}/${folder}`;
      if (index >= index_views && !fs.existsSync(target_folder)) {
        //  創建index_views內相符的folder
        fs.mkdirSync(target_folder);
      }
      if (index + 1 === array_filepath.length) {
        let ejs_string = fs.readFileSync(filepath, "utf-8");
        fs.writeFileSync(`${target_folder}/${filename}`, ejs_string);
      }
    }
    if (!isPageIndex) {
      return;
    }
    //  生成 HtmlWebpackPlugin
    //  匹配到 webpackConfig.entry {[chunkName]: 檔案位置}
    const pageName = array_filepath[index_views + 2];
    let opts = {
      filename: `${WEBPACK.BUILD.VIEW}/${pageName}/${filename}`,
      // template: new_filepath,
      template: filepath,
      //   以entry[chunkName]匹配那些打包後js要被插入
      chunks: [pageName],
      //   指定打包完成的js，插入body尾部
      inject: "body",
    };
    result.push(new HtmlWebpackPlugin(opts));
  });
  return result;
})();
