/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");
const os = require("node:os");
const fs = require("fs");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const WebpackBar = require("webpackbar");
const ejs = require("ejs");

/* CUSTOM     ----------------------------------------------------------------------------- */
const htmlWebpackPlugins = require("./_htmlWebpackPlugins");
const entry = require("./_entry");

/* CONFIG     ----------------------------------------------------------------------------- */
const WEBPACK_CONFIG = require("./config");
const FRONTEND_CONST = require("../src/config/const/frontend.json");

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
    //  可設定 { keep: regex },regex是相對output.path的路徑，且若是folder則不可為空
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
          // 據說效果不佳，反而會拖慢度，使用cache.type: "filesystem"即可
          // {
          //   loader: "thread-loader", // 开启多进程
          //   options: {
          //     workers: os.cpus().length, // 数量
          //   },
          // },
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
    //  要加入favicon的template，必須有<head>
    new FaviconsWebpackPlugin({
      devMode: "webapp",
      cache: true,
      logo: resolve(__dirname, "../src/assets/imgs/favicon.png"),
      //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
      prefix: "imgs/favicon/",
      inject: true,
    }),
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(isProd),
    }),
    new WebpackBar(),
    {
      apply(compiler) {
        compiler.hooks.afterEmit.tap("create_error_page", (compilation) => {
          // compiler.hooks.done.tap("_", (compilation) => {

          let template = fs.readFileSync(
            resolve(__dirname, "../server/views/page404/index.ejs"),
            "utf-8"
          );
          template = template.replace(
            /include\('\.\.\//g,
            `include('./server/views/`
          );
          let list = [
            {
              code: 500,
              errModel: { errno: 99900, msg: "伺服器錯誤" },
            },
            {
              code: 504,
              errModel: { errno: 99901, msg: "伺服器回應超時" },
            },
          ];
          let folder = resolve(__dirname, "../server/assets/html");
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
          }
          for (let { code, errModel } of list) {
            fs.writeFileSync(
              resolve(__dirname, `../server/assets/html/${code}.html`),
              ejs.render(template, {
                filename: `${code}.html`,
                page: FRONTEND_CONST.ERR_PAGE.PAGE_NAME,
                // login: Boolean(ctx.session.user),
                login: false,
                active: "nginx_error_page",
                errModel,
              })
            );
          }
        });
      },
    },
  ],
};
