/* NODEJS     ----------------------------------------------------------------------------- */
const path = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (env) => {
  return {
    mode: "none",
    entry: {
      "common.cjs": {
        import: "./src/index.js",
        library: {
          type: "commonjs2",
        },
        // filename: env.dev
        //   ? "../server/dev_assets/js/common.js"
        //   : "../server/assets/js/common.js",
        filename: env.dev ? "dev_common.cjs.js" : "common.cjs.js",
      },
      "common.esm": {
        import: "./src/index.js",
        library: {
          type: "module",
        },
        // filename: "../src/assets/js/common.js",
      },
    },
    output: {
      path: path.resolve(__dirname, "dist"),
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
    devtool: env.dev ? "eval-source-map" : "none",
    mode: env.dev ? "development" : "production",
  };
};
