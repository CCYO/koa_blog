import { dev_alert, dev_log } from "./dev";
import redir from "./redir";
import FRONTEND from "@config/frontend_esm";

const isProd = process.env.NODE_ENV === "production";

window.onerror = (e) => {
  dev_log("window.onerror, Error => \n", e, "---------- ----------");
};
window.addEventListener("error", (e) => {
  dev_log(
    "window.addEventListener(error), Error => \n",
    e,
    "---------- ----------"
  );
});
window.addEventListener("unhandledrejection", function (event) {
  event.promise.catch((result) => {
    dev_alert("capture unhandleRejected event, look console");
    let { errno } = result;
    if (errno === undefined) {
      event.preventDefault();
      dev_log(
        "capture unhandleRejected \n Event: \n ",
        event,
        "---------- ----------"
      );
      return;
    }
    dev_log(
      `handle unhandledrejection \n resModel: \n `,
      result,
      "---------- ----------"
    );
    if (result.errno === FRONTEND._AXIOS.ERR_RES.NO_LOGIN.errno) {
      redir.check_login();
    }
  });
});

function watchError(error) {
  switch (error.model === undefined) {
    case true:
      // 後端錯誤
      dev_log(error.model);
      break;
    case false:
      // 前端錯誤
      dev_log(error);
    // 需再作回報後端處理
  }
  switch (isProd) {
    case true:
      alert("發生未知錯誤,頁面將重新整理");
      location.reload();
      break;
    case false:
      alert("發生未知錯誤,請確認console");
  }
}

export default watchError;
