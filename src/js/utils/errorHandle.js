import redir from "./redir";

window.onerror = (e) => {
  !process.env.isProd && console.log("window.onerror捕獲錯誤\nError:\n", e);
};
window.addEventListener("error", (e) => {
  !process.env.isProd &&
    console.log("window.addEventListener(error)捕獲錯誤\nError:\n", e);
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
      } else {
        location.reload();
      }
    } else {
      let error;
      try {
        error = JSON.parse(result.message);
        error.stack = result.stack;
      } catch (e) {
        error = result;
      }
      alert(error.message);
      if (process.env.isProd) {
        // 後端響應請求需要登入權限
        redir.check_login();
        // 需再作回報後端處理
      }
      console.error(error.stack);
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
