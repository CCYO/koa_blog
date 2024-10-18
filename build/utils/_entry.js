/**
 * @description  取得webpack.base.config的entry
 */

/* NODEJS     ----------------------------------------------------------------------------- */
const glob = require("glob");
const { resolve } = require("path");

/* VAR        ----------------------------------------------------------------------------- */
const filepathList = glob.sync(resolve(__dirname, "../../src/js/page/*.js"));

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = ((filepathList) => {
  let res = {};
  filepathList.forEach((filepath) => {
    const arr = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line

    const chunkName = arr[arr.length - 1].replace(/\.js/g, "");
    res[chunkName] =
      process.env.NODE_ENV !== "production"
        ? [filepath, "webpack-hot-middleware/client?reload=true"]
        : filepath;
  });
  return res;
})(filepathList);
