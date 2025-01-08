/* CONFIG     ----------------------------------------------------------------------------- */
const { ENV } = require("../../config");

/* NodeJS     ----------------------------------------------------------------------------- */
const path = require("path");
const fs = require("fs");

/* NPM        ----------------------------------------------------------------------------- */
const { SourceMapConsumer } = require("source-map");

/* UTILS      ----------------------------------------------------------------------------- */
const { SuccModel } = require("../../utils/model");

async function loadErr(ctx) {
  let err = JSON.parse(ctx.request.body);
  err.message = "加載失敗";
  ctx.app.emit("error", err);
  ctx.body = new SuccModel();
}

async function codeErr(ctx) {
  const {
    browserInfo,
    error: {
      stack: { line, column, url },
    },
  } = ctx.request.body;
  // decodeURIComponent 處理 register&login 的 % ←→ %26 轉換
  const fileName = decodeURIComponent(path.basename(url));
  let filePath = path.resolve(
    __dirname,
    `../../${ENV.isProd ? "assets" : "dev_assets"}`,
    "map",
    `${fileName}.map`
  );
  const rawSouceMap = fs.readFileSync(filePath, { encoding: "utf-8" });
  const consumer = await new SourceMapConsumer(rawSouceMap);
  const result = consumer.originalPositionFor({ filePath, line, column });
  consumer.destroy();
  let msg = {
    browserInfo,
    error: result,
  };
  ctx.app.emit("error", msg);
  ctx.body = new SuccModel();
}

module.exports = {
  loadErr,
  codeErr,
};
