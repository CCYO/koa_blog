////  NODE MODULE
const { resolve } = require("path");
////  NPM MODULE
const pm2 = require("pm2");
const { merge } = require("webpack-merge");
const OptimizeCss = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

////  MY MODULE
const WEBPACK_CONFIG = require("./config");
const webpackBaseConfig = require("./webpack.base.config");
const RemovePlugin = require("remove-files-webpack-plugin");

const styleLoaderList = [
  {
    loader: MiniCssExtractPlugin.loader,
  },
  {
    loader: "css-loader",
    options: {
      importLoaders: 2,
    },
  },
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: ["postcss-preset-env"],
      },
    },
  },
];

const plugins = (prod) =>
  [
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/[.]ejs$/],
      scriptMatchPattern: [/runtime[.]\w+[.]js$/],
      assetPreservePattern: [/runtime[.]\w+[.]js$/],
    }),
    new RemovePlugin({
      after: { include: [resolve(__dirname, "../src/_views")], trash: true },
    }),
    new MiniCssExtractPlugin({
      filename: `${WEBPACK_CONFIG.BUILD.STYLE}/[name].[contenthash:5].min.css`,
    }),
    new OptimizeCss(),
    DONE(prod),
  ].filter(Boolean);

const prod_config = (env) => ({
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
      },
      {
        test: /\.css$/,
        use: styleLoaderList,
      },
      {
        test: /\.s[ac]ss$/,
        use: [...styleLoaderList, "sass-loader"],
      },
    ],
  },
  plugins: plugins(env),

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          minChunks: 1,
          //  all 同步、動態加載都要進行處理
          chunks: "all",
          priority: 100,
        },
        common: {
          name: "common",
          //  initial 僅針對同步加載進行處理
          chunks: "initial",
          minChunks: 2,
          minSize: 0,
        },
      },
    },
    //  紀錄所有chunk彼此的引用關係
    runtimeChunk: {
      name: "runtime",
    },
  },
  devtool: "cheap-module-source-map",
  mode: "production",
});

function DONE(prod) {
  if (!prod) {
    return false;
  }
  return {
    apply: (compiler) => {
      compiler.hooks.done.tap("_", (compilation) => {
        pm2.connect((connect_err) => {
          if (connect_err) {
            throw connect_err;
          }
          console.log("PM2 CONNECT");
          const config = resolve(__dirname, "../ecosystem.config.js");
          pm2.start(config, (start_err) => {
            if (start_err) {
              throw connect_err;
            }
          });
        });
      });
    },
  };
}

module.exports = (env) => {
  return merge(webpackBaseConfig, prod_config(env.prod));
};
