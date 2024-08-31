/* COMMON     ----------------------------------------------------------------------------- */
import _Axios from "./_axios";
import Loading_backdrop from "./LoadingBackdrop";
import News from "./news";
import initNavbar from "./navbar";
import initEJSData from "./initEJSData";

/* CONFIG     ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  utils = {};
  data = {};
  event = {};
  async init() {
    let event_initPage = new CustomEvent("initPage");
    let ejs_data = initEJSData();
    let loading_backdrop = new Loading_backdrop();
    let _axios = new _Axios({ backdrop: loading_backdrop, G: this });
    /**
     * G.init期間，LoadingBackdrop已開啟，故關閉_axios 的LoadingBackdrop auto
     */
    _axios.autoLoadingBackdrop = false;
    await initNavbar(ejs_data, _axios);
    if (ejs_data.login && ejs_data.active !== "blog-preview") {
      let news = new News(_axios);
      this.utils.news = news;
      let { me } = await news.getLoginData();
      this.data.me = me;
      _axios.autoLoadingBackdrop = true;
      document.addEventListener("initPage", async () => {
        !process.env.isProd &&
          console.log("initPage handle ---> checkNewsMore");
        await news.checkNewsMore();
      });
    }
    this.data = { ...this.data, ...ejs_data };
    this.utils = {
      loading_backdrop,
      axios: _axios,
    };
    this.event = {
      initPage: event_initPage,
    };
    this.constant = FRONTEND[ejs_data.page];
    return this;
  }
  async initPage(fn) {
    fn && (await fn());
    await this.utils.loading_backdrop.hidden();
    await new Promise((resolve) => {
      setTimeout(() => {
        if (!process.env.isProd) {
          window.G = this;
          console.log("initPage Event ---> dispatch");
          console.log("===============【PAGE INIT FINISH】=================");
        }
        document.dispatchEvent(this.event.initPage);
        resolve();
      }, 0);
    });
  }
}
