////  NODE MODULE
const { resolve } = require("path");
const chalk = require("chalk");
const os = require("node:os");
////  NPM MODULE
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const ProgressBarPlugin = require("progress-bar-webpack-plugin");
////  MY MODULE
const htmlWebpackPlugins = require("./_htmlWebpackPlugins");
const entry = require("./_entry");
const WEBPACK_CONFIG = require("./config");

const isProd = process.env.NODE_ENV === "production";

const plugins = [
  ...htmlWebpackPlugins,
  new FaviconsWebpackPlugin({
    logo: resolve(__dirname, "../src/assets/imgs/favicon.png"),
    //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
    prefix: "imgs/favicon/",
    outputPath: resolve(__dirname, "../server/assets/imgs/favicon"),
    inject: true,
  }),
  new webpack.ProvidePlugin({
    $: "jquery",
  }),
  new BundleAnalyzerPlugin(),
  new webpack.DefinePlugin({
    "process.env.isProd": JSON.stringify(isProd),
  }),
  // new webpack.ProgressPlugin({
  //   activeModules: true,
  //   entries: true,
  //   // modules: false,
  //   modulesCount: 5000,
  //   profile: false,
  //   // dependencies: false,
  //   dependenciesCount: 1000
  // }),
  new ProgressBarPlugin({
    width: 50, // 默认20，进度格子数量即每个代表进度数，如果是20，那么一格就是5。
    format:
      chalk.blue.bold("build") +
      chalk.yellow("[:bar] ") +
      chalk.green.bold(":percent") +
      " (:elapsed秒)",
    stream: process.stderr, // 默认stderr，输出流
    complete: "#", // 默认“=”，完成字符
    clear: false, // 默认true，完成时清除栏的选项
    renderThrottle: "", // 默认16，更新之间的最短时间（以毫秒为单位）
    callback() {
      // 进度条完成时调用的可选函数
      console.log(chalk.red.bold("完成"));
    },
  }),
];

module.exports = {
  context: resolve(__dirname),
  entry,
  output: {
    path: WEBPACK_CONFIG.BUILD.DIST,
    publicPath: `${WEBPACK_CONFIG.PUBLIC_PATH}/`,
    filename: `${WEBPACK_CONFIG.BUILD.SCRIPT}/[name].[contenthash:5].js`,
    // chunkFilename: `${WEBPACK_CONFIG.BUILD.SCRIPT}/chunk.[name].[contenthash:5].js`,
    clean: true,
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "../"),
      "~build": resolve(__dirname, "../build"),
      "~server": resolve(__dirname, "../server"),
      "@src": resolve(__dirname, "../src"),
      "@config": resolve(__dirname, "../src/config"),
      "@js": resolve(__dirname, "../src/js"),
      "@css": resolve(__dirname, "../src/css"),
      "@less": resolve(__dirname, "../src/less"),
      "@views": resolve(__dirname, "../src/views"),
      "@_views": resolve(__dirname, "../src/_views"),
    },
    extensions: [".js", ".json", ".css", ".scss"],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "thread-loader", // 开启多进程
            options: {
              workers: os.cpus().length, // 数量
            },
          },
          //	cacheDirectory 緩存
          //  cacheCompression 緩存壓縮,
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: !isProd,
              cacheCompression: false,
            },
          },
        ],
        exclude: /(node_modules|lib|libs)/,
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
        type: "asset/resource",
        generator: {
          filename: `${WEBPACK_CONFIG.BUILD.FONT}/[name].[contenthash:5][ext]`,
        },
      },
      {
        test: /\.ejs$/,
        use: [
          {
            loader: "raw-loader",
          },
          {
            //	用來<%% → <%
            loader: "template-ejs-loader",
            options: {
              rmWhitespace: true,
            },
          },
        ],
      },
    ],
  },
  plugins,
};
