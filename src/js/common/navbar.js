/**
 * NAVBAR & NEWS
 */

/* CSS        ----------------------------------------------------------------------------- */
import "@css/wedgets/navbar.scss";

/* UTILS      ----------------------------------------------------------------------------- */
import { render } from "../utils";
import News from "./news";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* VAR        ----------------------------------------------------------------------------- */
const API_LOGOUT = "/api/user/logout";
// 不需要news數據的頁面
const noNewsPage = [
  //  不允許登入權限的頁面
  COMMON.PAGE.REGISTER_LOGIN.ACTIVE.REGISTER,
  COMMON.PAGE.REGISTER_LOGIN.ACTIVE.LOGIN,
  // 不需要news數據
  COMMON.PAGE.BLOG.ACTIVE.PREVIEW,
  // NGINX 回應的錯誤頁面
  COMMON.PAGE.ERR_PAGE.ACTIVE.NGINX,
];

/* EXPORT     ----------------------------------------------------------------------------- */
export default async function (active, _axios) {
  let loginData;
  let news;
  if (!noNewsPage.some((item) => item === active)) {
    news = new News(_axios);
    loginData = await news.getLoginData();
  }
  // 未登入狀態
  if (!loginData) {
    _renderLogoutNavBar(active);
    return undefined;
  }
  // 登入狀態
  _renderLoginNav(active);
  //  初始化News功能
  news = await news.init(loginData);
  document.addEventListener("initPage", async () => {
    !process.env.isProd && console.log("initPage handle ---> 初始化news功能");
    window._initFns.push(await news.checkNewsMore());
  });
  //  登出功能
  $("#logout").on("click", logout);
  // 僅返回me
  return {
    me: loginData.me,
    news,
  };
  // return loginData.me;

  async function logout() {
    if (!confirm("真的要登出?")) {
      alert("對嘛，再待一下嘛");
      return;
    }
    let { data } = await _axios.get(API_LOGOUT);
    alert(data);
    location.href = "/login";
    return;
  }

  //  渲染 登出狀態 navbar template
  function _renderLogoutNavBar(active) {
    //  未登入
    $("#noNeedCollapse-list").html(render.navbar.logout_uncollapseList(active));
    //  navbar始終展開
    $(".navbar").removeClass("navbar-expand-sm").addClass("navbar-expand");
    //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
    $(".nav").removeClass("order-0 order-md-0").addClass("order-1");
    //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
    $(".offcanvas").removeClass("order-1 order-md-1").addClass("order-0");
    $(".navbar-toggler, .offcanvas").remove();
  }

  //  渲染 登入狀態的 navbar template
  function _renderLoginNav(active) {
    //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
    $("#needCollapse-list").html(render.navbar.login_collapseList(active));
    //  #noNeedCollapse-list 內放入 NEWS
    $("#noNeedCollapse-list").html(render.navbar.login_uncollapseList(active));
    return true;
  }
}
