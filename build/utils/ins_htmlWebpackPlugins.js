/**
 * @description  取得webpack.base.config內，plugins中的htmlWebpackPlugins
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK, COMMON } = require("../config");

/* NODEJS     ----------------------------------------------------------------------------- */
const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const HtmlWebpackPlugin = require("html-webpack-plugin");

/* VAR        ----------------------------------------------------------------------------- */
//  ejs 須被替換為常量的標記
const PREFIX = "CONS";
//  server/utils/render/template位置
const dir_template_server = resolve(
  __dirname,
  `../../server/utils/render`,
  WEBPACK.ENV.isProd ? `./template` : `./dev_template`
);
//  src/js/utils/render/template位置
const dir_template_src = resolve(
  __dirname,
  `../../src/js/utils/render`,
  WEBPACK.ENV.isProd ? `./template` : `./dev_template`
);

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
    //  取得絕對路徑形式的新檔案名
    let newFilename_list = [];
    let target_folder;
    // if (isPageIndex) {
    // array_filepath[index_views] = "_views";
    // } else
    if (!isTemplate) {
      array_filepath[index_views - 1] = "server";
      if (!WEBPACK.ENV.isProd) {
        array_filepath[index_views] = "dev_views";
      }
    }

    //  1)生成要放入ejs_string的文件路徑
    //  2)創建(1)路徑不存在的folder
    for (let [index, folder] of array_filepath.entries()) {
      if (isTemplate) {
        // 改
        continue;
      } else if (folder === "pages") {
        continue;
      } else {
        //
        target_folder = !index ? `/${folder}` : `${target_folder}/${folder}`;
        //  index_views 之後的資料夾若不存在，則創建
        if (index >= index_views && !fs.existsSync(target_folder)) {
          fs.mkdirSync(target_folder);
        }
        if (index + 1 === array_filepath.length) {
          newFilename_list.push(`${target_folder}/${filename}`);
        }
      }
    }
    //  替換ejs內的標記
    // 改
    // let ejs_string = _replaceFrontendConst(filepath);
    let ejs_string = fs.readFileSync(filepath, "utf-8");
    newFilename_list.forEach((item) => {
      item && fs.writeFileSync(item, ejs_string);
    });
    ////  生成 HtmlWebpackPlugin
    if (!isPageIndex) {
      return;
    }
    //  匹配到 webpackConfig.entry {[chunkName]: 檔案位置}
    const fileChunk = array_filepath[index_views + 2];
    let opts = {
      filename: `${WEBPACK.BUILD.VIEW}/${fileChunk}/${filename}`,
      template: newFilename_list[0],
      //   以entry[chunkName]匹配那些打包後js要被插入
      chunks: [fileChunk],
      //   指定打包完成的js，插入body尾部
      inject: "body",
    };
    result.push(new HtmlWebpackPlugin(opts));
  });
  return result;
})();
