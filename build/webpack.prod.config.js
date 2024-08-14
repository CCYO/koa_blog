////  NODE MODULE
const os = require("node:os");
const { resolve } = require("path");
////  NPM MODULE
const pm2 = require("pm2");
const { merge } = require("webpack-merge");
const OptimizeCss = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
// 1)必須將MiniCssExtractPlugin額外取出，wrap後再添入
// 2)會導致HtmlInlineScriptPlugin無作用
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
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
    loader: "thread-loader", // 开启多进程
    options: {
      workers: os.cpus().length, // 数量
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

const plugins = (run) =>
  [
    // 針對 SpeedMeasurePlugin 的 hack
    // new MiniCssExtractPlugin({
    //   filename: `${WEBPACK_CONFIG.BUILD.STYLE}/[name].[contenthash:5].min.css`,
    // }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/[.]ejs$/],
      scriptMatchPattern: [/runtime[.]\w+[.]js$/],
      assetPreservePattern: [/runtime[.]\w+[.]js$/],
    }),
    new RemovePlugin({
      after: { include: [resolve(__dirname, "../src/_views")], trash: true },
    }),
    new OptimizeCss(),
    DONE(run),
  ].filter(Boolean);

const prod_config = (run) => ({
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
  plugins: plugins(run),

  optimization,

  // devtool: "cheap-module-source-map",
  mode: "production",
});
var optimization = {
  splitChunks: {
    cacheGroups: {
      defaultVendors: {
        priority: 10,
        chunks: "async",
        test: /[\\/]node_modules[\\/]/,
        minChunks: 1,
        minSize: 0,
        reuseExistingChunk: true,
        name(module, chunks, cacheGroupKey) {
          return chunks.reduce((acc, chunk) => (acc += `@${chunk.name}`), "");
        },
        filename: `${WEBPACK_CONFIG.BUILD.SCRIPT}/dynamic_vendor.[name].[contenthash:5].js`,
      },
      vendors_npm: {
        priority: 0,
        chunks: "all",
        test: /[\\/]node_modules[\\/]/,
        minChunks: 1,
        name: "vendors_npm",
      },
      default: {
        priority: -10,
        chunks: "async",
        minChunks: 2,
        reuseExistingChunk: true,
        filename: `${WEBPACK_CONFIG.BUILD.SCRIPT}/dynamic_common.[name].[contenthash:5].js`,
        name(module, chunks, cacheGroupKey) {
          return chunks.reduce((acc, chunk) => (acc += `@${chunk.name}`), "");
        },
      },
      common: {
        priority: -20,
        chunks: "initial",
        minChunks: 2,
        minSize: 0,
        name: "common",
      },
    },
  },
  //  紀錄所有chunk彼此的引用關係
  runtimeChunk: {
    name: "runtime",
  },
  minimize: true,
  minimizer: [
    new TerserPlugin({
      minify: TerserPlugin.esbuildMinify,
      terserOptions: {},
    }),
  ],
};

function DONE(run) {
  if (!run) {
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
  // 針對 SpeedMeasurePlugin 的 hack
  let config = new SpeedMeasurePlugin().wrap(
    merge(webpackBaseConfig, prod_config(env.run))
  );
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: `${WEBPACK_CONFIG.BUILD.STYLE}/[name].[contenthash:5].min.css`,
    })
  );
  // 正式打包
  // let config = merge(webpackBaseConfig, prod_config(env.run));
  // config.module.rules = [{ oneOf: [...config.module.rules] }];
  return config;
};
