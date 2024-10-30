const fs = require("fs");
const { resolve } = require("path");
const ejs = require("ejs");
const FRONTEND_CONST = require("../../src/config/const/frontend.json");
const WEBPACK_CONFIG = require("../config");
const isProd = process.env.NODE_ENV === "production";
const NGINX_ERR_RES = [
  {
    code: 500,
    errModel: { errno: 99900, msg: "伺服器錯誤" },
  },
  {
    code: 502,
    errModel: { errno: 99900, msg: "伺服器502錯誤" },
  },
  {
    code: 503,
    errModel: { errno: 99901, msg: "伺服器503超時" },
  },
  {
    code: 504,
    errModel: { errno: 99901, msg: "伺服器回應超時" },
  },
];
//   生成NGINX響應的ERROR PAGE
function create_nginx_error_pages() {
  let template = fs.readFileSync(
    `${WEBPACK_CONFIG.BUILD.VIEW}/page404/index.ejs`,
    // resolve(__dirname, "../../server/views/page404/index.ejs"),
    "utf-8"
  );
  // template = template.replace(/include\('\.\.\//g, `include('./server/views/`);
  template = template.replace(
    /include\('\.\.\//g,
    `include('./server/${isProd ? "views/" : "dev_views/"}`
  );
  // let folder = resolve(__dirname, `../../server/assets/html`);
  let folder = resolve(WEBPACK_CONFIG.BUILD.DIST, "./html");
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  for (let { code, errModel } of NGINX_ERR_RES) {
    fs.writeFileSync(
      // resolve(__dirname, `../../server/assets/html/${code}.html`),
      resolve(folder, `./${code}.html`),
      ejs.render(template, {
        filename: `${code}.html`,
        active: FRONTEND_CONST.ERR_PAGE.ACTIVE.NGINX,
        page: FRONTEND_CONST.ERR_PAGE.PAGE_NAME,
        login: false,
        errModel,
      })
    );
  }
}

module.exports = {
  apply(compiler) {
    compiler.hooks.afterEmit.tap("create_error_page", (compilation) => {
      create_nginx_error_pages();
    });
  },
};
