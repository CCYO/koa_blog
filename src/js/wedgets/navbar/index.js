/* CSS Module ------------------------------------------------------------------------------- */
import "@css/wedgets/navbar.scss";
/* Utils Module ----------------------------------------------------------------------------- */
import News from "./news";
import { render as ejs_render } from "@js/utils";

/* CONSTANT --------------------------------------------------------------------------------- */
// const REG = {
//   ACTIVE_PATHNAME: /^\/(?<pathname>\w+)\/?(?<albumList>list\?)?/,
// };
const API_LOGOUT = "/api/user/logout";
/* EXPORT MODULE ---------------------------------------------------------------------------- */
/* 初始化 通知列表 功能 */
export default async function ({ login, active }, axios) {
  //  頁面初始化期間，loadingBackdrop統一由G管理，故標示axios不需要調用loadingBackdrop
  if (!login) {
    _renderLogoutNavBar(active);
    return false;
  }
  axios.autoLoadingBackdrop = false;
  let newsClass = new News(axios);
  let { me, news } = await newsClass.getLoginData();
  axios.autoLoadingBackdrop = true;
  _renderLoginNav(active);
  await import(
    /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
  );
  await import(
    /*webpackChunkName:'bootstrap-dropdown'*/ "bootstrap/js/dist/dropdown"
  );

  //  初始化News功能
  news = newsClass.init();
  //  登出功能
  $("#logout").on("click", logout);
  return { me, news };

  async function logout() {
    if (!confirm("真的要登出?")) {
      alert("對嘛，再待一下嘛");
      return;
    }
    let { data } = await axios.get(API_LOGOUT);
    alert(data);
    location.href = "/login";
    return;
  }

  //  渲染 登出狀態 navbar template
  function _renderLogoutNavBar(active) {
    //  未登入
    $("#noNeedCollapse-list").html(
      ejs_render.navbar.logout_uncollapseList(active)
    );
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
    $("#needCollapse-list").html(ejs_render.navbar.login_collapseList(active));
    //  #noNeedCollapse-list 內放入 NEWS
    $("#noNeedCollapse-list").html(
      ejs_render.navbar.login_uncollapseList(active)
    );
    return true;
  }
}
