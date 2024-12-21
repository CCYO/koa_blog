/* NODEJS     ----------------------------------------------------------------------------- */
const path = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (env) => ({
  mode: "none",
  entry: {
    "common.cjs": {
      import: "./src/index.js",
      library: {
        type: "commonjs2",
      },
      filename: env.dev ? "dev_common.cjs.js" : "common.cjs.js",
    },
    "common.esm": {
      import: "./src/index.js",
      library: {
        type: "module",
      },
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //  regex是相對output.path的路徑
    clean: { keep: /common\.cjs/ },
  },
  experiments: {
    outputModule: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(!!env.dev),
    }),
  ],
  optimization: {
    // 默認設定
    minimize: true,
    minimizer: [
      new TerserPlugin({
        // 默認為true，會因為要將註釋單獨提取，而生成LICENSE檔案，故設定為false
        extractComments: false,
      }),
    ],
  },
  devtool: env.dev ? "eval-source-map" : false,
  mode: env.dev ? "development" : "production",
});
