/**
 * @description webpack.base.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./config");

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const WebpackBar = require("webpackbar");

/* CUSTOM     ----------------------------------------------------------------------------- */
const htmlWebpackPlugins = require("./utils/ins_htmlWebpackPlugins");
const entry = require("./utils/entry");
const done_hook = require("./utils/done_hook");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  context: resolve(__dirname),
  entry,
  output: {
    path: WEBPACK.BUILD.DIST,
    publicPath: `${WEBPACK.PUBLIC_PATH}/`,
    filename: WEBPACK.ENV.isProd
      ? `${WEBPACK.BUILD.SCRIPT}/[name].[contenthash:5].js`
      : `${WEBPACK.BUILD.SCRIPT}/[name].js`,
    //  可設定 { keep: regex },regex是相對output.path的路徑，且若是folder則不可為空
    // clean: true,
    clean: { keep: /js\/common\.js/ },
  },
  resolve: {
    modules: [resolve(__dirname, "../node_modules")],
    alias: {
      "@const": resolve(__dirname, "../src/const"),
      "@config": resolve(__dirname, "../src/config"),
      "@css": resolve(__dirname, "../src/css"),
    },
    extensions: [".js", ".json", ".scss"],
  },

  module: {
    noParse: /jquery/,
    rules: [
      {
        test: /\.js$/,
        // thread-loader 效果不佳
        // webpack.dev.config 已開啟 cache.type: "filesystem"，可取代babel cache
        use: ["babel-loader"],
        exclude: /(node_modules|lib|libs)/,
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
        type: "asset/resource",
        generator: {
          filename: WEBPACK.ENV.isProd
            ? `${WEBPACK.BUILD.FONT}/[name].[contenthash:5][ext]`
            : `${WEBPACK.BUILD.FONT}/[name][ext]`,
        },
      },
      {
        test: /\.ejs$/,
        use: ["raw-loader"],
      },
    ],
  },
  plugins: [
    ...htmlWebpackPlugins,
    //  要加入favicon的template，必須有<head>
    new FaviconsWebpackPlugin({
      devMode: "webapp",
      cache: true,
      logo: resolve(__dirname, "../src/assets/imgs/favicon.png"),
      //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
      prefix: "imgs/favicon/",
      inject: true,
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(WEBPACK.ENV.isProd),
    }),
    new WebpackBar(),
    //  生成NGINX靜態錯誤頁面
    done_hook,
  ],
};
