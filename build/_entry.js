////  NODE MODULE
const glob = require("glob");
const { resolve } = require("path");

module.exports = ((filepathList) => {
  let res = {};
  filepathList.forEach((filepath) => {
    const arr = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line

    const chunkName = arr[arr.length - 1].replace(/\.js/g, "");
    res[chunkName] =
      process.env.NODE_ENV === "development"
        ? [filepath, "webpack-hot-middleware/client?reload=true"]
        : filepath;
  });
  return res;
})(glob.sync(resolve(__dirname, "../src/js/page/*.js")));
