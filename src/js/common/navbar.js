/* 初始化 通知列表 功能 */
/* CSS    Module ------------------------------------------------------------------------------- */
import "@css/wedgets/navbar.scss";

/* Utils  Module ----------------------------------------------------------------------------- */
import { render } from "@js/utils";
import News from "./news";

/* CONSTANT --------------------------------------------------------------------------------- */
const API_LOGOUT = "/api/user/logout";

/* EXPORT MODULE ---------------------------------------------------------------------------- */
export default async function ({ me, active }, _axios) {
  if (ejs_data.login && ejs_data.active !== "blog-preview") {
    let news = new News(_axios);
    this.utils.news = news;
    let { me } = await news.getLoginData();
    this.data.me = me;
    _axios.autoLoadingBackdrop = true;
    document.addEventListener("initPage", async () => {
      !process.env.isProd && console.log("initPage handle ---> checkNewsMore");
      await news.checkNewsMore();
    });
  }

  //  頁面初始化期間，loadingBackdrop統一由G管理，故標示_axios不需要調用loadingBackdrop
  if (!me) {
    _renderLogoutNavBar(active);
    return;
  }
  /**
   * 此module由G.init調用，而G.init已開啟LoadingBackdrop
   * 故需關閉_axios 的LoadingBackdrop auto
   */
  // _axios.autoLoadingBackdrop = false;
  // let newsClass = new News(_axios);
  // let { me, news } = await newsClass.getLoginData();
  // _axios.autoLoadingBackdrop = true;
  _renderLoginNav(active);
  await import(
    /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
  );
  await import(
    /*webpackChunkName:'bootstrap-dropdown'*/ "bootstrap/js/dist/dropdown"
  );

  //  初始化News功能
  // news = newsClass.init();
  //  登出功能
  $("#logout").on("click", logout);
  // return { me, news };

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
