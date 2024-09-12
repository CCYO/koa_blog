/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");
const os = require("node:os");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const WebpackBar = require("webpackbar");

/* CUSTOM     ----------------------------------------------------------------------------- */
const htmlWebpackPlugins = require("./_htmlWebpackPlugins");
const entry = require("./_entry");

/* CONFIG     ----------------------------------------------------------------------------- */
const WEBPACK_CONFIG = require("./config");

/* VAR        ----------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  context: resolve(__dirname),
  entry,
  output: {
    path: WEBPACK_CONFIG.BUILD.DIST,
    publicPath: `${WEBPACK_CONFIG.PUBLIC_PATH}/`,
    filename: isProd
      ? `${WEBPACK_CONFIG.BUILD.SCRIPT}/[name].[contenthash:5].js`
      : `${WEBPACK_CONFIG.BUILD.SCRIPT}/[name].js`,
    clean: true,
  },
  resolve: {
    modules: [resolve(__dirname, "../node_modules")],
    alias: {
      jquery: resolve(__dirname, "../node_modules/jquery/dist/jquery.min.js"),
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
    noParse: /jquery/,
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
          {
            loader: "babel-loader",
            // webpack.dev.config 已開啟 cache.type: "filesystem"，故不需要開啟babel cache
            // options: {
            //   cacheDirectory: !isProd, //	cacheDirectory 緩存
            //   cacheCompression: false, //  cacheCompression 緩存壓縮,
            // },
          },
        ],
        exclude: /(node_modules|lib|libs)/,
      },
      {
        test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
        type: "asset/resource",
        generator: {
          filename: isProd
            ? `${WEBPACK_CONFIG.BUILD.FONT}/[name].[contenthash:5][ext]`
            : `${WEBPACK_CONFIG.BUILD.FONT}/[name][ext]`,
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
  plugins: [
    ...htmlWebpackPlugins,
    new FaviconsWebpackPlugin({
      devMode: "webapp",
      cache: true,
      logo: resolve(__dirname, "../src/assets/imgs/favicon.png"),
      //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
      // publicPath: "/public",
      prefix: "imgs/favicon/",
      // outputPath: resolve(__dirname, "../server/assets/imgs/favicon"),
      inject: true,
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(isProd),
    }),
    new WebpackBar(),
  ],
};
