const webpack = require("webpack");
const path = require("path");
console.log("@common process.version => ", process.version);
module.exports = (env) => {
  return {
    mode: "none",
    entry: {
      "common.cjs": {
        import: "./src/index.js",
        library: {
          type: "commonjs2",
        },
        filename: env.dev
          ? "../server/dev_assets/js/common.js"
          : "../server/assets/js/common.js",
      },
      "common.esm": {
        import: "./src/index.js",
        library: {
          type: "module",
        },
        filename: "../src/assets/js/common.js",
      },
    },
    output: {
      path: path.resolve(__dirname),
      filename: "[name].js",
      clean: true,
    },
    experiments: {
      outputModule: true,
    },
    plugins: [
      new webpack.DefinePlugin({
        "process.env.isProd": JSON.stringify(!!env.dev),
      }),
    ],
    // devtool: env.dev ? "eval-source-map" : "cheap-module-source-map",
    // devtool: false,
    devtool: "eval-source-map",
    mode: env.dev ? "development" : "production",
  };
};
