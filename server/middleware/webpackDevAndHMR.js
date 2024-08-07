let SERVER_CONFIG = require("../config");

let webpackDev;
let webpackHMR;
if (SERVER_CONFIG.ENV.isProd) {
  webpackDev = webpackHMR = async (ctx, next) => {
    await next();
  };
} else {
  let webpackDevConfig = require("../../build/webpack.dev.config");
  const genWebpackDevMiddleware = require("../utils/genWebpackDev");
  const koaConvert = require("koa-convert");
  const webpackHotMiddleware = require("koa-webpack-hot-middleware"); //  警告：沒有TS檔
  let webpack = require("webpack");
  //  webpackDev 與 webpackHMR 必須是同一個 compiler
  let compiler = webpack(webpackDevConfig);
  let publicPath = webpackDevConfig.output.publicPath;
  webpackDev = genWebpackDevMiddleware(compiler, {
    //  需要打包後的ejs
    writeToDisk: true,
    publicPath,
    stats: {
      colors: true,
    },
  });
  webpackHMR = koaConvert(
    webpackHotMiddleware(compiler, {
      publicPath,
      // noInfo: true,
      reload: true,
    })
  );
}
module.exports = {
  webpackDev,
  webpackHMR,
};
