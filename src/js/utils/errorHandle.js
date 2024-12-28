/**
 * @description 前端錯誤處理
 */

import { COMMON } from "../../config";

/* UTILS      ----------------------------------------------------------------------------- */
import redir from "./redir";

/* EXPORT     ----------------------------------------------------------------------------- */
export default function (error) {
  // 錯誤是否來自前端code
  error.from_frondend = error.errno === undefined ? true : false;
  // 觸發unhandledrejection
  throw error;
}

window.addEventListener("unhandledrejection", function (event) {
  event.preventDefault();
  event.promise.catch((result) => {
    // webpack sourcemap似乎沒辦法對result映射，所以這裡採用event.reason
    const reason = event.reason;
    let msg = "window.addEventListener(unhandledrejection)捕獲錯誤事件";
    let { errno, from_frondend } = result;
    /**
     * _check 與 model 都是由 export 模塊取到的，會在第一二個判斷處理
     * 其他因為JS代碼中CB所發生的reject，則在最後一個判斷處理
     */
    if (from_frondend) {
      // 由 export default 主動引發，目的是為了阻止前端code引發錯誤後仍繼續執行，導致後續代碼發生連鎖錯誤
      if (process.env.isProd) {
        alert(`發生未知錯誤，頁面將自動重整`);
        location.reload();
      } else {
        alert(`前端發生錯誤，並由${msg},請參考console.error`);
        console.error(`${msg}\n具體報錯位置:\n`, reason);
      }
    } else if (
      errno === COMMON.ERR_RES.VIEW.SERVER_ERROR.errno ||
      errno === COMMON.ERR_RES.VIEW.NOT_FOUND.errno ||
      errno === COMMON.ERR_RES.VIEW.TIME_OUT.errno
    ) {
      if (process.env.isProd) {
        alert(`伺服器發生未知錯誤，頁面將自動重整`);
        location.reload();
      } else {
        alert(`後端發生錯誤，並由${msg},請參考console.error`);
        console.error(`${msg}\nreason:\n`, reason);
      }
    } else if (errno) {
      //  axios請求取得HTTP CODE 200響應，但需要額外處理的數據（ex:登入權限過期）
      if (process.env.isProd) {
        // 後端響應請求需要登入權限
        process.env.isProd && redir.check_login();
      } else {
        alert(`axios獲取伺服器發出的響應警示，並由${msg},請參考console.warn`);
        // reason { errno, msg, code }
        console.warn(msg, reason);
      }
    } else {
      //  處理前端CB引發的錯誤
      if (process.env.isProd) {
        alert("發生未知錯誤，頁面將自動重整");
        // 需再作回報後端處理
        location.reload();
      } else {
        alert(`【端代碼發生錯誤，並由${msg},請參考console.error`);
        console.error(`${msg}\n具體報錯位置:\n`, reason);
      }
    }
  });
});
