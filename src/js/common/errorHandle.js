/**
 * @description 前端錯誤處理
 */

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* NPM     ----------------------------------------------------------------------------- */
import axios from "axios";
import TraceKit from "tracekit";
import dayjs from "dayjs";

/* UTILS      ----------------------------------------------------------------------------- */
import redir from "../utils/redir";

/* VAR      ----------------------------------------------------------------------------- */
const isProd = process.env.isProd;
let pre_msg = "";

/* EXPORT     ----------------------------------------------------------------------------- */
function _log(result, fromBackend = false) {
  if (isProd) {
    let from = fromBackend ? "伺服器" : "";
    alert(`${from}發生未知錯誤，頁面將自動重整`);
  } else {
    let from = fromBackend ? "後" : "前";
    alert(`【${from}端錯誤】 ${pre_msg}`);
    console.error(`【${from}端錯誤】 ${pre_msg}\n`, result);
  }
  pre_msg = "";
  if (fromBackend || !isProd) {
    return;
  }
  // 前端錯誤需要回報給伺服器
  try {
    TraceKit.report(result);
  } catch (error) {
    // 取消TraceKit.report的報錯聲明
    if (error === result) {
      return true;
    }
  }
}

window.addEventListener("unhandledrejection", function (event) {
  pre_msg += 'BY window.addEventLister("unhandledrejection")';
  event.preventDefault();
  event.promise.catch((result) => {
    // ?webpack sourcemap似乎沒辦法對result映射，所以這裡採用event.reason
    const errno = result.errno;

    // 後端（NodeJS或NGINX）提供的錯誤響應
    if (
      errno === COMMON.ERR_RES.VIEW.SERVER_ERROR.errno ||
      errno === COMMON.ERR_RES.VIEW.NOT_FOUND.errno ||
      errno === COMMON.ERR_RES.VIEW.TIME_OUT.errno
    ) {
      _log(result, true);
      if (isProd) {
        location.reload();
      }
    }
    //  axios HTTP CODE 200，但需要額外處理的數據（ex:登入權限過期）
    else if (errno) {
      if (isProd) {
        // 後端響應請求需要登入權限
        redir.check_login();
      } else {
        _log(result, true);
      }
    }
    //  前端引發的錯誤
    else {
      _log(result);
      if (isProd) {
        location.reload();
      }
    }
  });
});

window.addEventListener("error", (event) => {
  pre_msg += ' BY window.addEventLister("error")';
  _log(event.error);
});
window.onerror = function () {
  !isProd &&
    console.log(
      "catch Error BY addEventListener('error'), 這裡阻止繼續冒泡, 交由window.統一處理."
    );
  return true;
};
// 取消因為window拋錯而自動觸發TraceKit.report.subscribe的行為
TraceKit.collectWindowErrors = false;
// 由TraceKit.report(event)主動調用
TraceKit.report.subscribe(async (error) => {
  const { message, stack } = error;
  const payload = {
    error: {
      message,
      stack: {
        column: stack[0].column,
        line: stack[0].line,
        func: stack[0].func,
        url: stack[0].url,
      },
    },
    browserInfo: {
      time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), // 移動端
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream, // IOS 不支援window.MSStream
      isAndroid:
        /Android/.test(navigator.userAgent) &&
        !/Windows Phone/.test(navigator.userAgent),
      userAgent: navigator.userAgent,
    },
  };

  !isProd && console.log("將錯誤交由TraceKit處理，並回報給伺服器\n", payload);

  await axios.post("/api/report/error", payload);
});
