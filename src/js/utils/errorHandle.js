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
  console.log(event.reason);
  event.promise.catch((result) => {
    let msg = "window.addEventListener(unhandledrejection)捕獲錯誤事件\n";
    let { model, _checked } = result;
    /**
     * _check 與 model 都是由 export 模塊取到的，會在第一二個判斷處理
     * 其他因為JS代碼中CB所發生的reject，則在最後一個判斷處理
     */
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
      /**
       * 1)取得axios 200響應，但卻是需要以錯誤來處理的數據
       * 2)CB內的unhandle reject導致
       */
      try {
        //  處理1)
        let model = JSON.parse(result.message);
        let stack = result.stack;
        console.error(`${msg}model:`, model, `\nstack: ${stack}`);
        // 後端響應請求需要登入權限
        process.env.isProd && redir.check_login();
        return;
      } catch (e) {
        //  處理2)
        console.error(`${msg}result:`, result);
        if (process.env.isProd) {
          msg = "發生未知錯誤，頁面將自動重整";
          // 需再作回報後端處理
          location.reload();
        }
        alert(msg);
      }
    }
  });
});
