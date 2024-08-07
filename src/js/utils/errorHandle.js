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
  event.promise.catch((result) => {
    let msg = "window.addEventListener(unhandledrejection)捕獲錯誤事件\n";
    let { model, _checked } = result;
    if (_checked) {
      // watchError主動引發，目的為了阻止後續代碼發生連鎖錯誤，故這裡無須再作多餘處理
      if (process.env.isProd) {
        location.reload();
      } else {
        console.error(`${msg}Event.reason:`, event.reason);
      }
    } else if (model) {
      if (!process.env.isProd) {
        console.error(`error.model:`, model);
      } else if (model.errno === FRONTEND._AXIOS.ERR_RES.NO_LOGIN.errno) {
        // 後端響應請求需要登入權限
        redir.check_login();
      } else {
        location.reload();
      }
    } else if (!process.env.isProd) {
      // 以下為前端的unhandledrejection(通常發生在異步事件CB內)
      alert("前端代碼錯誤，請確認console");
      console.error(`${msg}Event.reason:`, event.reason);
    } else {
      // 以下為前端的unhandledrejection(通常發生在異步事件CB內)
      alert("發生未知錯誤，頁面將重新整理");
      location.reload();
      // 需再作回報後端處理
    }
  });
});

function watchError(error) {
  let msg = "發生未知錯誤，已回報伺服器，且頁面將重新整理";
  if (!process.env.isProd) {
    if (error.model) {
      // 後端錯誤
      msg = "伺服器錯誤，請確認console";
    } else {
      // 前端錯誤
      error._checked = true;
      msg = "前端代碼錯誤，請確認console";
    }
  }
  alert(msg);
  throw error;
}

export default watchError;
