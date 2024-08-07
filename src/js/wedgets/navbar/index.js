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

      // await import(
      //   /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
      // );
      let el_offcanvas = document.querySelector(`.offcanvas`);
      let btn_offcanvas = document.querySelector(".navbar-toggler");
      let bs_offcanvas;
      btn_offcanvas.addEventListener("click", async () => {
        if (!bs_offcanvas) {
          let { default: Offcanvas } = await import(
            /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
          );
          bs_offcanvas = new Offcanvas(el_offcanvas);
          console.log("動態引入bs_offcanvas且創建完成");
        }
        bs_offcanvas.show();
      });
      el_offcanvas.addEventListener("shown.bs.offcanvas", (e) => {
        el_offcanvas.focus();
      });

      let bs_dropdown;
      let el_dropdownBtn = document.querySelector("[data-bs-toggle=dropdown]");
      console.log("el_dropdownBtn=> ", el_dropdownBtn);
      el_dropdownBtn.addEventListener("click", async () => {
        if (!bs_dropdown) {
          let { default: Dropdown } = await import(
            /*webpackChunkName:'bootstrap-dropdown'*/ "bootstrap/js/dist/dropdown"
          );
          bs_dropdown = new Dropdown(el_dropdownBtn);
          // bs_dropdown = new Dropdown(document.querySelector("#newsList"));
          console.log("動態載入bs5_dropdown");
        }
        bs_dropdown.show();
      });
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
      if (albumList) {
        href += `/${albumList}`;
      }
      $(`.nav-link[href^="/${href}"]`).addClass("active");
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
    }
    //  渲染 登入狀態的 navbar template
    function renderLoginNav() {
      //  #needCollapse-list 之外放入 個人資訊/文章相簿/設置/LOGOUT
      $("#needCollapse-list").html(ejs_render.navbar.collapseList());
      //  #noNeedCollapse-list 內放入 NEWS
      $("#noNeedCollapse-list").html(ejs_render.navbar.uncollapseList());
      return true;
    }
  }
}
