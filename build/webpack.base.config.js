////  NODE MODULE
const { resolve } = require("path");
////  NPM MODULE
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
////  MY MODULE
const htmlWebpackPlugins = require("./_htmlWebpackPlugins");
const entry = require("./_entry");
const WEBPACK_CONFIG = require("./config");

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
];

module.exports = {
  context: resolve(__dirname),
  entry,
  output: {
    path: WEBPACK_CONFIG.BUILD.DIST,
    publicPath: `${WEBPACK_CONFIG.PUBLIC_PATH}/`,
    filename: `${WEBPACK_CONFIG.BUILD.SCRIPT}/[name].[contenthash:5].js`,
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
        use: ["babel-loader"],
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
