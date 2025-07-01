/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (env) => {
  const isProd = !Boolean(env.dev);
  const common_conf = {
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
    // koa-blog/common 負責打包前後端都會用到的「通用模塊」，實際上在前/後端會如何使用
    // 後端：由NodeJS直接運行使用（不需再討論）
    // 前端：再一次被koa-blog/build進行打包，生成最終的前端代碼
    // 因此，prod mode必須考量到不會因為sourceMap導致碼源曝光
    // koa-blog/build 設定 devtool: hidden-nosources-source-map，可成功遮蔽Browser獲取碼源
    // 而被koa-blog/build再一次引入的koa-blog/common，則須考慮到2點
    // (1)koa-blog/common的sourceMap要能避免被Browser撈取
    //    使用(source-map)建立外部map，不要使用(eval)內聯
    // (2)koa-blog/build要能找得到koa-blog/common的sourceMap
    //    不能使用會省略sourceMappingURL資訊的(hidden)模式，會導致koa-blog/build無法獲取koa-blog/common的sourceMap
    devtool: isProd ? "source-map" : "eval-source-map",
    mode: isProd ? "production" : "development",
  };
  // clean.keep 可以是regex，匹配的是「相對output.path的路徑」
  // output.clean: { keep: /common\.cjs/ }
  return [
    // CJS 配置
    {
      entry: resolve(__dirname, "./src/index.js"),
      output: {
        path: resolve(__dirname, "dist"),
        library: { type: "commonjs2" },
        filename: isProd ? "common.cjs.js" : "dev_common.cjs.js",
      },
      experiments: { outputModule: false },
      ...common_conf,
    },
    // ESM 配置
    {
      entry: resolve(__dirname, "./src/index.js"),
      output: {
        path: resolve(__dirname, "dist"),
        library: { type: "module" },
        filename: "common.esm.js",
      },
      experiments: { outputModule: true },
      ...common_conf,
    },
  ];
};
