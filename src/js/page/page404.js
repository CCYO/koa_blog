/* CSS        ----------------------------------------------------------------------------- */
import "@css/page404.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { errorHandle } from "../utils";

/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  document.addEventListener("initPage", redir);

  function redir() {
    let target = document.referrer;
    let someOrigin = target && new URL(target).origin === location.origin;
    //  404 || 通知已過期 || 需要登入權限 || 其他
    let alertMsg = G.data.errModel?.msg;

    if (someOrigin && !/\/permission/.test(target)) {
      // 是否來自同域
      alertMsg += ",五秒後將自動回到上一頁";
    } else {
      target = "/square";
      alertMsg += ",五秒後將自動跳往廣場頁";
    }

    alert(alertMsg);
    process.env.isProd && setTimeout(() => location.replace(target), 5000);
  }
}
