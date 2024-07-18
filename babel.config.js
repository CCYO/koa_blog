//	參考https://awdr74100.github.io/2020-03-16-webpack-babelloader/

module.exports = {
  plugins: ["@babel/plugin-transform-runtime"],
  presets: [
    [
      "@babel/preset-env",
      {
        modules: false,
        useBuiltIns: "usage",
        corejs: 3,
      },
    ],
  ],
  // sourceType: "unambiguous",
};
