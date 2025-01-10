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
function _report(result, fromBackend = false) {
  // prod mode 使用alert提示使用者「頁面將重整」
  if (isProd) {
    let from = fromBackend ? "伺服器" : "";
    alert(`${from}發生未知錯誤，頁面將自動重整`);
  }
  // dev mode 使用alert提示使用者「觀察console.log」
  else {
    let from = fromBackend ? "後" : "前";
    alert(`【${from}端錯誤】 ${pre_msg}`);
    console.error(`【${from}端錯誤】 ${pre_msg}\n`, result);
  }
  // 將提醒內容重新清空
  pre_msg = "";
  // if (!isProd || fromBackend) {
  //   return;
  // }
  if (fromBackend) {
    return;
  }
  // 將前端錯誤回報給伺服器
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
    const errno = result.errno;
    // 後端（NodeJS或NGINX）提供的錯誤響應
    if (
      errno === COMMON.ERR_RES.VIEW.SERVER_ERROR.errno ||
      errno === COMMON.ERR_RES.VIEW.NOT_FOUND.errno ||
      errno === COMMON.ERR_RES.VIEW.TIME_OUT.errno
    ) {
      _report(result, true);
      // API 請求給予「伺服器錯誤」的響應，主動重整頁面
      if (isProd) {
        location.reload();
      }
    }
    //  axios HTTP CODE 200，但需要額外處理的數據（ex:登入權限過期）
    else if (errno) {
      // API 請求給予「使用者權限問題」的響應
      // prod mode 導向登入頁面
      if (isProd) {
        redir.check_login();
      }
      // dev mode 提示錯誤
      else {
        _report(result, true);
      }
    }
    //  前端引發的錯誤
    else {
      _report(result);
    }
  });
});

window.addEventListener("error", (event) => {
  pre_msg += ' BY window.addEventLister("error")';
  _report(event.error);
});
window.onerror = function () {
  !isProd &&
    console.log(
      "catch Error BY addEventListener('error'), 這裡阻止繼續冒泡, 交由window.統一處理."
    );
  return true;
};
// 取消「TraceKit.report.subscribe會因為window拋錯，自動觸發的行為」
TraceKit.collectWindowErrors = false;
// 由TraceKit.report(error)主動調用
TraceKit.report.subscribe((error) => {
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
      // format 參考 https://day.js.org/docs/zh-CN/display/format
      time: dayjs().format("YYYY-MM-DD HH:mm:ss ZZ"),
      isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent), // 移動端
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream, // IOS 不支援window.MSStream
      isAndroid:
        /Android/.test(navigator.userAgent) &&
        !/Windows Phone/.test(navigator.userAgent),
      userAgent: navigator.userAgent,
    },
  };
  if (!isProd) {
    console.log("將錯誤交由TraceKit處理，並回報給伺服器\n", payload);
    return;
  }
  axios
    .post("/api/report/error", payload)
    .then(() => location.reload())
    .catch((error) => {
      // 若還有失敗狀況，後端早已經生成錯誤報告，
      // 此處引發前端觸發window.addEventLister("unhandledrejection")，引導至調用 location.reload()
      Promise.reject(error.response.data);
    });
});
