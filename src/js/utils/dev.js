function dev_log(...msg) {
  !process.env.isProd && console.log("【測試提醒】\n", ...msg);
}
function dev_alert(msg) {
  !process.env.isProd && alert(`【測試提醒】\n${msg}`);
}

export { dev_log, dev_alert };
