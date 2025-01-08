/* NODEJS     ----------------------------------------------------------------------------- */
const path = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (env) => {
  const isProd = Boolean(env.prod);
  return {
    mode: "none",
    entry: {
      "common.cjs": {
        import: "./src/index.js",
        library: {
          type: "commonjs2",
        },
        filename: isProd ? "common.cjs.js" : "dev_common.cjs.js",
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
        "process.env.isProd": JSON.stringify(isProd),
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
    devtool: isProd ? "source-map" : "eval-source-map",
    mode: isProd ? "production" : "development",
  };
};
