/* CSS        ----------------------------------------------------------------------------- */
import "@css/page404.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* RUNTIME    ----------------------------------------------------------------------------- */
await G.initPage(initMain);

async function initMain() {
  showErrorCode();
  // 網址自動跳轉
  document.addEventListener("initPage", (event) => {
    !process.env.isProd && console.log("initPage handle ---> 頁面轉址");
    event.addFn({ fn: redir });
  });

  function redir() {
    let target = document.referrer;
    // 由同域轉至此錯誤頁面
    let someOrigin = target && new URL(target).origin === location.origin;
    // 循環錯誤
    let loopError = /\/permission/.test(target);
    // 報錯來自NGINX
    let errorFromNginx = /\/public\/html\/.+?\.html/.test(location.href);
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

    window._initFns.push(Promise.resolve());
  }
  function showErrorCode() {
    let { code, msg } = G.data.errModel;
    $("#code").text(code);
    $("#msg").text(msg);
  }
}
