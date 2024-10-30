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
    // webpack sourcemap似乎沒辦法對result映射，必須使用event.reason
    const reason = event.reason;
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
        alert(`${msg}請參考console.error`);
        console.error(`${msg}Event.reason:\n`, reason);
      }
    } else if (model) {
      //  來自axios Error
      if (!process.env.isProd) {
        alert(`${msg}請參考console.error`);
        console.error(`${msg}error.model:\n`, model);
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
        if (!process.env.isProd) {
          let model = JSON.parse(result.message);
          console.error(`${msg}model:\n`, model, `\nEvent.reason:\n`, reason);
          alert(`${msg}請參考console.error`);
        } else {
          // 後端響應請求需要登入權限
          process.env.isProd && redir.check_login();
        }
      } catch (e) {
        //  處理2)
        if (!process.env.isProd) {
          console.error(`${msg}\nEvent.reason:\n`, reason);
          alert(`${msg}請參考console.error`);
        } else {
          alert("發生未知錯誤，頁面將自動重整");
          // 需再作回報後端處理
          location.reload();
        }
      }
    }
  });
});
