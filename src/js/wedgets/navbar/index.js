/* CSS Module ------------------------------------------------------------------------------- */
import "@css/wedgets/navbar.scss";
/* Utils Module ----------------------------------------------------------------------------- */
import News from "./news";
import { render as ejs_render } from "@js/utils";

/* CONSTANT --------------------------------------------------------------------------------- */
const REG = {
  ACTIVE_PATHNAME: /^\/(?<pathname>\w+)\/?(?<albumList>list\?)?/,
};
const API_LOGOUT = "/api/user/logout";
/* EXPORT MODULE ---------------------------------------------------------------------------- */
/* 初始化 通知列表 功能 */
export default async function (axios) {
  if (!axios) {
    throw new Error("沒提供axios給initNavbar");
  }
  //  頁面初始化期間，loadingBackdrop統一由G管理，故標示axios不需要調用loadingBackdrop
  axios.autoLoadingBackdrop = false;
  let newsClass = new News(axios);
  let loginData = await newsClass.getLoginData();
  axios.autoLoadingBackdrop = true;
  let isLogin = !!loginData.me.id;
  await render(isLogin);
  if (isLogin) {
    //  初始化News功能
    loginData.news = newsClass.init();
    //  登出功能
    $("#logout").on("click", logout);
  }
  return loginData;

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
  //  render navbar
  async function render(isLogin) {
    if (!isLogin) {
      renderLogoutNavBar();
    } else {
      renderLoginNav();
      await import(
        /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
      );
      await import(
        /*webpackChunkName:'bootstrap-dropdown'*/ "bootstrap/js/dist/dropdown"
      );
    }

    //  根據 path，顯示當前 active NavItem
    activeNavItem();
    return;

    //  渲染 NavItem Active
    function activeNavItem() {
      let { pathname, albumList } = REG.ACTIVE_PATHNAME.exec(
        location.pathname
      ).groups;
      let href = pathname;
      // if (
      //   ["square", "other", "blog", "permission"].some(
      //     (page) => page === pathname
      //   )
      // ) {
      //   $(`[href="/${pathname}"]`).addClass("active");
      //   $(`[data-my-tab="#login"]`).attr("href", "/login");
      //   $(`[data-my-tab="#register"]`).attr("href", "/register");
      // } else if (albumList) {
      if (albumList) {
        href += `/${albumList}`;
      }
      // let $active = $(`.nav-link[href^="/${href}"]`);
      // if (!$active.length) {
      //   $active = $(`[data-my-tab="#${pathname}"]`).parent();
      // }
      // $active.addClass("active");
    }
    //  渲染 登出狀態 navbar template
    function renderLogoutNavBar() {
      //  未登入
      //  navbar始終展開
      $(".navbar").removeClass("navbar-expand-sm").addClass("navbar-expand");
      //  基本nav始終排後面（未登入狀態僅會有 登入/註冊）
      $(".nav").removeClass("order-0 order-md-0").addClass("order-1");
      //  摺疊nav始終盤排前頭（未登入狀態僅會有Home）
      $(".offcanvas").removeClass("order-1 order-md-1").addClass("order-0");
      $(".navbar-toggler, .offcanvas").remove();
      $();
    }
    //  渲染 登入狀態的 navbar template
    function renderLoginNav() {
      //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
      $("#needCollapse-list").html(ejs_render.navbar.collapseList());
      //  #noNeedCollapse-list 內放入 NEWS
      // $("#noNeedCollapse-list").html(ejs_render.navbar.uncollapseList());
      return true;
    }
  }
}
