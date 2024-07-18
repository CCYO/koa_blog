/* CSS Module ------------------------------------------------------------------------------- */
import "@css/page404.scss";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { errorHandle } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  G.page = "page404";
  await G.main(initMain);
  G.utils.alert();
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  G.utils.alert = _alert;
  function _alert() {
    let target;
    //  404 || 通知已過期 || 其他已預設的非預期結果
    let alertMsg = G.data.errModel.msg;
    let noReferrer = !document.referrer;
    let notLoginPage = !/\/login/.test(document.referrer);
    let notSomeOrigin =
      !noReferrer && !/34\.80\.51\.244:8080/.test(document.referrer);
    if (noReferrer || notLoginPage || notSomeOrigin) {
      target = "/square";
      alertMsg += ",五秒後將自動跳往廣場頁";
    } else if (notLoginPage) {
      target = document.referrer;
      alertMsg += ",五秒後將自動回到上一頁";
    }
    alert(alertMsg);
    location.replace(target);
  }
}
