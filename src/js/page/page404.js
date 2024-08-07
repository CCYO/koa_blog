/* CSS Module ------------------------------------------------------------------------------- */
import "@css/page404.scss";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { errorHandle } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  G.page = "page404";
  await G.main(initMain);
} catch (error) {
  errorHandle(error);
}

function initMain() {
  let reg = new RegExp(location.host.replace(/\./g, "\\."), "g");
  let target = document.referrer;
  //  404 || 通知已過期 || 需要登入權限 || 其他
  let alertMsg = G.data.errModel.msg;

  if (
    target &&
    reg.test(target) &&
    !/\/permission/.test(target) &&
    !/\/serverError/.test(target)
  ) {
    // 是否來自同域
    alertMsg += ",五秒後將自動回到上一頁";
  } else {
    target = "/square";
    alertMsg += ",五秒後將自動跳往廣場頁";
  }

  alert(alertMsg);
  process.env.isProd && setTimeout(() => location.replace(target), 5000);
}
