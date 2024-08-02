import { dev_log } from "./dev";
import redir from "./redir";
import FRONTEND from "@config/frontend_esm";

window.onerror = (e) => {
  dev_log("window.onerror捕獲錯誤\nError:\n", e);
};
window.addEventListener("error", (e) => {
  dev_log("window.addEventListener(error)捕獲錯誤\nError:\n", e);
});
window.addEventListener("unhandledrejection", function (event) {
  event.preventDefault();
  dev_log("window.addEventListener(unhandledrejection)捕獲錯誤\nError:\n", e);
  event.promise.catch((result) => {
    let { errno, _checked } = result;
    if (_checked) {
      // watchError主動引發，目的為了阻止後續代碼發生連鎖錯誤
      dev_log(`watchError主動引發`);
    } else if (errno === FRONTEND._AXIOS.ERR_RES.NO_LOGIN.errno) {
      // 後端響應請求需要登入權限
      redir.check_login();
    } else {
      // 前端的unhandledrejection(通常發生在異步事件CB內)
      if (process.env.isProd) {
        alert("發生未知錯誤，頁面將重新整理");
      } else {
        alert("前端代碼錯誤，請確認console");
        console.error(result);
        // 需再作回報後端處理
      }
    }
  });
});

function watchError(error) {
  error._checked = true;
  let msg = "發生未知錯誤，頁面將重新整理";
  if (!process.env.isProd) {
    if (error.model) {
      // 後端錯誤
      msg = "伺服器錯誤，請確認console";
    } else {
      // 前端錯誤
      msg = "前端代碼錯誤，請確認console";
      console.error(error);
      // 需再作回報後端處理
    }
  }
  alert(msg);
  process.env.isProd && location.reload();
  throw error;
}

export default watchError;
