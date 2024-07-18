////  NODE MODULE
const glob = require("glob");
const fs = require("fs");
const { resolve } = require("path");
////  NPM MODULE
const HtmlWebpackPlugin = require("html-webpack-plugin");
////  MY MODULE
const WEBPACK_CONFIG = require("./config");
const FRONTEND_CONST = require("../src/config/frontend_cjs");

//  將ejs內被標註的字符替換為指定常量
let _replaceFrontendConst = (function () {
  //  ejs 須被替換為常量的標記
  const PREFIX = "CONS";
  const REG_REPLACE = new RegExp(`[-]{2}${PREFIX}\\.(\\S+?)[-]{2}`, "g");
  //  存放ejs內需要替換的常量
  let cache_ejs_const = new Map();
  return function (filepath) {
    ////  替換 ejs_string 內的變量常數 "--CONS.[PAGE_NAME]--"
    let ejs_string = fs.readFileSync(filepath, "utf-8");
    return ejs_string.replace(REG_REPLACE, (match, target_string) => {
      //  匹配的常量變數若已存在，直接取得
      if (cache_ejs_const.has(match)) {
        return cache_ejs_const.get(match);
      }
      //  JSON.stringify result雖然已經是string，但此時ejs_string也是string，所以必須在result外在加上' '
      let json_string = `'${JSON.stringify(FRONTEND_CONST[target_string])}'`;
      cache_ejs_const.set(match, json_string);
      // }
      return json_string;
    });
  };
})();

module.exports = (function () {
  const result = [];
  //  所有 ejs 檔案的路徑
  let template_dir = resolve(__dirname, "../src/views/**/*.ejs");
  let dirList = glob.sync(template_dir);
  dirList.forEach((filepath) => {
    /**
     * ~/.../views/pages/[TypeName]
     * ~/.../views/wedgets/[wedgetType]/component
     * * ~/.../views/wedgets/[wedgetType]/component/[TypeName]
     * /index.ejs -------------------- TypeName下的基礎模塊
     * /components/*.ejs ------------- TypeName下的components
     * /template/*.ejs --------------- 當前後端需要生成TypeName部分template，時，被作為 genTemplateFn 的參數使用
     */
    // eslint-disable-line
    let array_filepath = filepath.split(/[\/|\/\/|\\|\\\\]/g);
    array_filepath.shift();
    const filename = array_filepath.pop(); //  移除、取得原檔名
    ////  判斷檔案type
    const isTemplate = !!array_filepath.find((item) => item === "template");
    const isComponent = !!array_filepath.find((item) => item === "components");
    const isWedget = !!array_filepath.find((item) => item === "wedgets");
    const isPageIndex = !isWedget && !isTemplate && !isComponent;
    let index_views = array_filepath.findIndex((item) => item === "views");
    ////  取得絕對路徑形式的新檔案名
    let newFilename_list = [];
    let target_folder;
    if (isPageIndex) {
      array_filepath[index_views] = "_views";
    } else if (!isTemplate) {
      array_filepath[index_views - 1] = "server";
    }
    for (let [index, folder] of array_filepath.entries()) {
      if (isTemplate) {
        let typeName = array_filepath[array_filepath.length - 2];
        let dir_server = resolve(__dirname, `../server/utils/render/template`);
        let dir_src = resolve(__dirname, `../src/js/utils/render/template`);

        newFilename_list = [dir_server, dir_src].map((dir) => {
          target_folder = dir;
          if (!fs.existsSync(target_folder)) {
            fs.mkdirSync(target_folder);
          }
          target_folder += `/${typeName}`;
          if (!fs.existsSync(target_folder)) {
            //  若 dirPath 不存在，則新建
            fs.mkdirSync(target_folder);
          }
          return (target_folder += `/${filename}`);
        });
        break;
      } else if (folder === "pages") {
        continue;
      } else {
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
    ////  更新ejs內容，並創建新檔
    let ejs_string = _replaceFrontendConst(filepath);
    if (isPageIndex) {
      ejs_string = ejs_string.replace(/\<%/g, "<%%");
    }
    newFilename_list.forEach((item) => {
      fs.writeFileSync(item, ejs_string);
    });
    ////  生成 HtmlWebpackPlugin
    if (!isPageIndex) {
      return;
    }
    //  匹配到 webpackConfig.entry {[chunkName]: 檔案位置}
    const fileChunk = array_filepath[index_views + 2];
    let opts = {
      filename: `${WEBPACK_CONFIG.BUILD.VIEW}/${fileChunk}/${filename}`,
      template: newFilename_list[0],
      //   以entry[chunkName]匹配那些打包後js要被插入
      chunks: [fileChunk],
      //   指定打包完成的js，插入body尾部
      inject: "body",
    };
    if (process.env.NODE_ENV === "production") {
      opts.chunks.push("vendors");
    }
    result.push(new HtmlWebpackPlugin(opts));
  });
  return result;
})();
