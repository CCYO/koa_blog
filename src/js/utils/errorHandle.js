/**
 * @description 前端錯誤處理
 */

/* UTILS      ----------------------------------------------------------------------------- */
import redir from "./redir";

/* EXPORT     ----------------------------------------------------------------------------- */
export default function (error) {
  let msg = "發生未知錯誤，已回報伺服器，且頁面將重新整理";

  if (error.model) {
    // 來自axios
    if (!process.env.isProd) {
      msg = "伺服器錯誤，請確認console";
    }
  } else {
    // 非來自axios
    if (!process.env.isProd) {
      msg = "前端代碼錯誤，請確認console";
    }
    error._checked = true;
  }
  alert(msg);
  // 觸發unhandledrejection
  throw error;
}

window.addEventListener("unhandledrejection", function (event) {
  event.preventDefault();
  event.promise.catch((result) => {
    let msg = "window.addEventListener(unhandledrejection)捕獲錯誤事件\n";
    let { model, _checked } = result;

    if (_checked) {
      //  非來自axios
      // watchError主動引發，目的為了阻止後續代碼發生連鎖錯誤，故這裡無須再作多餘處理
      if (process.env.isProd) {
        location.reload();
      } else {
        console.error(`${msg}Event.reason:`, event.reason);
      }
    } else if (model) {
      //  來自axios Error
      if (!process.env.isProd) {
        console.error(`${msg}error.model:`, model);
      } else {
        location.reload();
      }
    } else {
      //  非來自axios，通常是CB內發生的問題
      let error;
      try {
        error = JSON.parse(result.message);
        error.stack = result.stack;
      } catch (e) {
        error = result;
      }
      console.error(`${msg}Event.reason:`, error.stack);
      if (process.env.isProd) {
        // 後端響應請求需要登入權限
        redir.check_login();
        // 需再作回報後端處理
      }
    }
  });
});

window.onerror = (e) => {
  !process.env.isProd && console.log("window.onerror捕獲錯誤\nError:\n", e);
};
window.addEventListener("error", (e) => {
  !process.env.isProd &&
    console.log("window.addEventListener(error)捕獲錯誤\nError:\n", e);
});
