//	參考https://awdr74100.github.io/2020-03-16-webpack-babelloader/

module.exports = {
  plugins: ["@babel/plugin-transform-runtime"],
  presets: [
    [
      "@babel/preset-env",
      {
        // 查看哪些語法被轉譯
        // debug: true,
        modules: false,
        useBuiltIns: "usage",
        // 支援到 ES2020 特性
        // corejs: 3,
        corejs: {
          // 包含 ES2023 特性（如 Array.prototype.findLast）
          version: "3.35",
          proposals: true, // 包含 Stage 3 提案的 polyfill
        },
        targets: "> 0.25%, not dead",
      },
    ],
  ],
  // sourceType: "unambiguous",
};
