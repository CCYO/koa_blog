/**
 * @description  webpack打包完後才執行的動作
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK, COMMON } = require("../config");

/* NODEJS     ----------------------------------------------------------------------------- */
const fs = require("fs");
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const ejs = require("ejs");

/* VAR        ----------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("create_error_page", (compilation) => {
      create_nginx_error_pages();
    });
  },
};

//   生成NGINX響應的ERROR PAGE
function create_nginx_error_pages() {
  let template = fs.readFileSync(
    `${WEBPACK.BUILD.VIEW}/page404/index.ejs`,
    "utf-8"
  );
  template = template.replace(
    /include\('\.\.\//g,
    `include('./server/${isProd ? "views/" : "dev_views/"}`
  );
  let folder = resolve(WEBPACK.BUILD.DIST, "./html");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  for (let [status, errModel] of Object.entries(COMMON.ERR_RES.VIEW)) {
    let filename = resolve(folder, `./${status}.html`);
    fs.writeFileSync(
      filename,
      ejs.render(template, {
        filename, //  ejs.render指定要求的傳參，應該是緩存所需
        active: COMMON.PAGE.ERR_PAGE.ACTIVE.NGINX,
        page: COMMON.PAGE.ERR_PAGE.PAGE_NAME,
        login: false,
        errModel,
      })
    );
  }
}
