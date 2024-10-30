const glob = require("glob");
let fs = require("fs");
const lodash_template = require("lodash/template");
const { resolve } = require("path");
const { ENV } = require("../../config");

// let template_dir = resolve(__dirname, `./template/**/*.ejs`);
let template_dir = resolve(
  __dirname,
  ENV.isProd ? `./template` : `./dev_template`,
  "./**/*.ejs"
);
const res = {};
glob.sync(template_dir).forEach((filepath) => {
  let array_filepath = filepath.split(/[\/|\/\/|\\|\\\\]/g);
  let filename = array_filepath.pop();
  //  移除""空值
  array_filepath.shift();
  let pageName = array_filepath[array_filepath.length - 1];
  let [key] = filename.split(".");
  if (!res[pageName]) {
    res[pageName] = {};
  }
  let dir = resolve(
    __dirname,
    ENV.isProd ? `./template/` : `./dev_template`,
    `${pageName}/${filename}`
  );
  let str = fs.readFileSync(dir);
  res[pageName][key] = lodash_template(str);
});

module.exports = res;
