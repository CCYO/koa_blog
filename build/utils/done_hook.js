/**
 * @description  webpack打包完後才執行的動作
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK, COMMON } = require("../config");

/* NODEJS     ----------------------------------------------------------------------------- */
const fs = require("fs");
const zlib = require("zlib");
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const ejs = require("ejs");

/* VAR        ----------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("create_error_page", async (compilation) => {
      await create_nginx_error_pages();
    });
  },
};
//   生成NGINX響應的ERROR PAGE
async function create_nginx_error_pages() {
  let template = fs.readFileSync(
    `${WEBPACK.BUILD.VIEW}/page404/index.ejs`,
    "utf-8"
  );
  // 要建檔的folder
  let folder = resolve(WEBPACK.BUILD.DIST, "./html");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  // 針對生成NGINX錯誤頁，提供給 page404.ejs 的參數，格式為 { [STATUS]: { errno, msg, code }, ... }
  let map = Object.entries(COMMON.ERR_RES.VIEW);
  // map [[status, errModel], ... ]
  return Promise.all(
    map.map(([status, errModel]) => {
      let filename = `${status}.html`;
      let filePath = resolve(folder, filename);
      fs.writeFileSync(
        filePath,
        ejs.render(
          template,
          {
            active: COMMON.PAGE.ERR_PAGE.ACTIVE.NGINX,
            page: COMMON.PAGE.ERR_PAGE.PAGE_NAME,
            login: false,
            errModel,
          },
          {
            // 必填，除了協助ejs緩存機制，
            // 另協助template內的includes(pathname)，依據filename此參數正確定位pathname，
            // 否則在pathname是相對路徑的情況下，是以process.cwd()作為相對位置的基準。
            filename: `${WEBPACK.BUILD.VIEW}/page404/index.ejs`,
          }
        )
      );
      if (!isProd) {
        return Promise.resolve();
      }
      // 生產模式下，生成gz
      let rs = fs.createReadStream(filePath);
      let gz_path = `${filePath}.gz`;
      let gzip = zlib.createGzip();
      let ws = fs.createWriteStream(gz_path);
      rs.pipe(gzip).pipe(ws);
      return new Promise((resolve, reject) => {
        ws.on("finish", () => {
          resolve();
          return;
        });
      });
    })
  );
}
