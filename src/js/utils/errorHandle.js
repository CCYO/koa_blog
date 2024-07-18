import { dev_alert, dev_log } from "./dev";
import redir from "./redir";
import FRONTEND from "@config/frontend_esm";

const isProd = process.env.NODE_ENV === "production";

window.onerror = (e) => {
  dev_log("window.onerror capture error => ", e);
};
window.addEventListener("error", (e) => {
  dev_log("window.addEventListener(error) capture error =>", e);
});
window.addEventListener("unhandledrejection", function (event) {
  event.promise.catch((result) => {
    if (
      result.hasOwnProperty("errno") &&
      result.errno === FRONTEND._AXIOS.ERR_RES.NO_LOGIN.errno
    ) {
      dev_alert(`handle unhandledrejection ${result.msg}`);
      redir.check_login();
      return;
    }
    dev_log("capture unhandleRejected event => ", event);
    dev_log("capture unhandleRejected event => ", event.reason.stack);
    dev_alert("capture unhandleRejected event, look console");
    //  code:回傳錯誤報告到後端...
    //  阻止冒泡
    event.preventDefault();
  });
});

function watchError(error) {
  let message = `${error.model ? "後端" : "前端"}發生未知錯誤，頁面${
    isProd ? "是否" : "不會"
  }重新整裡`;
  if (isProd && window.confirm(message)) {
    location.reload();
  } else if (error.model) {
    alert(message);
    let { serverError, model } = error;
    dev_log("【後端】代碼錯誤-------start-↓↓↓↓");
    dev_log(`model:\n `, model);
    dev_log(`serverError:\n ${serverError.stack}`);
    dev_log("後端代碼錯誤-------end---↑↑↑↑");
  } else {
    dev_log("【前端】代碼錯誤-------start-↓↓↓↓");
    dev_log("error => ", error);
    dev_log("前端代碼錯誤-------end---↑↑↑↑");
  }
  return;
}

export default watchError;
