/* CSS        ----------------------------------------------------------------------------- */
import "@css/page404.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { errorHandle } from "../utils";

/* Config     ----------------------------------------------------------------------------- */
// import { ERR_PAGE } from "@config/frontend_esm";
import FRONTEND from "@config/frontend_esm";
/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  showErrorCode();
  // 網址自動跳轉
  document.addEventListener("initPage", redir);

  function redir() {
    let target = document.referrer;
    // 由同域轉至此錯誤頁面
    let someOrigin = target && new URL(target).origin === location.origin;
    // 循環錯誤
    let loopError = /\/permission/.test(target);
    // 報錯來自NGINX
    let errorFromNginx = /\/html\/50\d\.html/.test(location.href);
    //  404 || 通知已過期 || 需要登入權限 || 其他
    let alertMsg = G.data.errModel?.msg;
    if (errorFromNginx) {
      alertMsg += ",搶修中...\n請於一段時間後再重新嘗試。";
    } else if (!someOrigin || loopError) {
      target = "/square";
      alertMsg += ",五秒後將自動跳往廣場頁。";
    } else {
      alertMsg += ",五秒後將自動回到上一頁。";
    }
    alert(alertMsg);
    process.env.isProd &&
      !errorFromNginx &&
      setTimeout(() => location.replace(target), 5000);
  }
  function showErrorCode() {
    let { code, msg } = new Map(Object.entries(FRONTEND.ERR_PAGE.ERRNO)).get(
      G.data.errModel.errno.toString()
    );
    $("#code").text(code);
    $("#msg").text(msg);
  }
}
