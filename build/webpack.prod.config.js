/**
 * @description webpack.prod.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./config");
const webpackBaseConfig = require("./webpack.base.config");

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const { merge } = require("webpack-merge");
const OptimizeCss = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
/**
 * SpeedMeasurePlugin hack
 * npm i -D speed-measure-webpack-plugin
 * const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
 */
const TerserPlugin = require("terser-webpack-plugin");
const CompressionWebpackPlugin = require("compression-webpack-plugin");
const filemanagerWebpackPlugin = require("filemanager-webpack-plugin");

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
  // 據說效果不佳，反而會拖慢度，使用cache.type: "filesystem"即可
  // 不時出現的 loaderContext.getLogger is not a function 問題，似乎也是因為使用此loader的原因
  // {
  //   loader: "thread-loader", // 開啟多線程
  //   options: {
  //     workers: os.cpus().length, // 根據CPU數量開啟線程數
  //   },
  // },
  {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: ["postcss-preset-env"],
      },
    },
  },
];

const optimization = {
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
        filename: `${WEBPACK.BUILD.SCRIPT}/dynamic_vendor.[name].[contenthash:5].js`,
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
        filename: `${WEBPACK.BUILD.SCRIPT}/dynamic_common.[name].[contenthash:5].js`,
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

const plugins = (analyzer) =>
  [
    runBundleAnalyzerPlugin(analyzer),
    /**
     * SpeedMeasurePlugin hack
     * 最後再加入MiniCssExtractPlugin
     */
    new MiniCssExtractPlugin({
      filename: `${WEBPACK.BUILD.STYLE}/[name].[contenthash:5].min.css`,
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/[.]ejs$/],
      scriptMatchPattern: [/runtime[.]\w+[.]js$/],
      assetPreservePattern: [/runtime[.]\w+[.]js$/],
    }),
    new OptimizeCss(),
    new CompressionWebpackPlugin({
      test: /\.(js|css)$/,
      threshold: 1024, // 超過 1kb
      deleteOriginalAssets: false, // 不刪除原檔
      minRatio: 0.8, //  壓縮率優於此值，才作壓縮
    }),
    new filemanagerWebpackPlugin({
      events: {
        // onStart: {
        //   delete: [resolve(__dirname, "../server/views/")],
        // },
        onEnd: {
          mkdir: [resolve(__dirname, "../server/assets/map/")],
          copy: [
            {
              source: resolve(__dirname, "../server/assets/js/*.map"),
              destination: resolve(__dirname, "../server/assets/map"),
            },
            {
              source: resolve(__dirname, "../server/assets/css/*.map"),
              destination: resolve(__dirname, "../server/assets/map"),
            },
          ],
          delete: [
            resolve(__dirname, "../server/assets/css/*.map"),
            resolve(__dirname, "../server/assets/js/*.map"),
          ],
        },
      },
    }),
  ].filter(Boolean);

const prod_config = (analyzer) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: "asset",
        generator: {
          filename: `${WEBPACK.BUILD.IMAGE}/[name].[contenthash:5][ext]`,
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
  plugins: plugins(analyzer),
  optimization,
  devtool: "hidden-nosources-source-map",
  mode: "production",
});

module.exports = (env) => {
  let analyzer = Boolean(env.analyzer === "true");
  /**
   * SpeedMeasurePlugin 會導致
   * 1)因為MiniCssExtractPlugin報錯，無法打包
   * 2)HtmlInlineScriptPlugin無作用
   * 3)FaviconsWebpackPlugin無作用
   * 若要使用，需將MiniCssExtractPlugin額外取出，wrap後再添入，
   * 但除了避免1)，打包後其他問題仍存在
   */
  /**
   * SpeedMeasurePlugin hack
   * let config = new SpeedMeasurePlugin().wrap(
   *   merge(webpackBaseConfig, prod_config(env.build))
   * );
   * config.plugins.push(
   *   new MiniCssExtractPlugin({
   *     filename: `${WEBPACK.BUILD.STYLE}/[name].[contenthash:5].min.css`,
   *   })
   * );
   */
  let config = merge(webpackBaseConfig, prod_config(analyzer));
  config.module.rules = [{ oneOf: [...config.module.rules] }];
  return config;
};

function runBundleAnalyzerPlugin(analyzer) {
  return analyzer ? new BundleAnalyzerPlugin() : undefined;

  // return {
  //   apply(compiler) {
  //     compiler.hooks.done.tap("_", () => {});
  //   },
  // };
}
