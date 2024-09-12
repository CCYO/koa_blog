/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const { merge } = require("webpack-merge");

/* CONFIG     ----------------------------------------------------------------------------- */
const webpackBaseConfig = require("./webpack.base.config");
const WEBPACK_CONFIG = require("./config");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = merge(webpackBaseConfig, {
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
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
