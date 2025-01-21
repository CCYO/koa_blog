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
    event.G.afterRender({ fn: warn, msg: "頁面轉址" });
  });

  function warn() {
    let target = document.referrer;
    // 由同域轉至此錯誤頁面
    let someOrigin = !!target && new URL(target).origin === location.origin;
    // 循環錯誤
    let loopError =
      target &&
      (/\/permission/.test(target) || /\/public\/html\/.+?\.html/.test(target));
    // 報錯來自NGINX
    let errorFromNginx = /\/public\/html\/.+?\.html/.test(location.href);
    let redir = true;
    //  404 || 通知已過期 || 需要登入權限 || 其他
    let alertMsg = G.data.errModel?.msg;
    if (errorFromNginx && G.data.errModel?.code !== 404) {
      alertMsg += ",搶修中...\n請於一段時間後再重新嘗試。";
      redir = false;
    } else if (someOrigin && !loopError) {
      alertMsg += ",五秒後將自動回到上一頁。";
    } else {
      target = "/square";
      alertMsg += ",五秒後將自動跳往廣場頁。";
    }
    alert(alertMsg);
    process.env.isProd &&
      redir &&
      setTimeout(() => {
        location.replace(target);
      }, 5000);
  }
  function showErrorCode() {
    let { code, msg } = G.data.errModel;
    $("#code").text(code);
    $("#msg").text(msg);
  }
}
