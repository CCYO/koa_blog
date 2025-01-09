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
      clean: { keep: /dev_common\.cjs/ }, //  regex是相對output.path的路徑
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
    // prod mode，此處生成的共用模塊會提供給src打包，src會以hidden-nosources-source-map在頁面中隱藏碼源，
    // 而此處共用模塊若使用內聯模式的source-map，會導致此部分碼源被頁面讀取到，
    // 只要將source-map抽離出來，即可避免頁面讀取，且src打包的sourceMap可成功追蹤過來
    // 但要注意，此處共用模塊不可使用hidden模式的source-map，會導致src打包的sourceMap也無法追蹤
    devtool: isProd ? "nosources-source-map" : "eval-source-map",
    mode: isProd ? "production" : "development",
  };
};
