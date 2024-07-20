const { resolve } = require("path");
////  NPM MODULE
const webpack = require("webpack");
const { merge } = require("webpack-merge");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const liveServer = require("live-server");
////  MY MODULE
const webpackBaseConfig = require("./webpack.base.config");
const WEBPACK_CONFIG = require("./config");

module.exports = merge(webpackBaseConfig, {
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new BundleAnalyzerPlugin(),
    {
      apply: (compiler) => {
        compiler.hooks.done.tap(
          "MyAwesomeOpenAfterBuildPlugin",
          (compilation) => {
            (async function () {
              const open = await import("open");
              // await open.default("http://104.199.147.100:8080/self");
              await open.default("http://localhost:8080/self");
              // liveServer.start({
              //   port: 8888,
              //   host: "localhost",
              //   root: resolve(__dirname, "../server/assets"),
              //   file: "report.html",
              //   open: true,
              // });
            })();
          }
        );
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: "asset",
        generator: {
          filename: `${WEBPACK_CONFIG.BUILD.IMAGE}/[name].[contenthash:5][ext]`,
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        use: [
          {
            loader: "image-webpack-loader",
            options: {
              pngquant: {
                quality: [0.3, 0.5],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.s[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },
  devtool: "eval-source-map",
  mode: "development",
});
