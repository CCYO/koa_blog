const isProd = process.env.NODE_ENV === "production";

function dev_log(...msg) {
  if (isProd) {
    return;
  }
  console.log("【測試提醒】\n", ...msg);
}
function dev_alert(msg) {
  if (isProd) {
    return;
  }
  alert(msg);
}

export { dev_log, dev_alert };
