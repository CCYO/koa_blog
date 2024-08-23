/* Utils Module ----------------------------------------------------------------------------- */
import _Axios from "./_axios";
import Loading_backdrop from "./LoadingBackdrop";
import initNavbar from "./navbar";
import initEJSData from "./initEJSData";

export default class {
  utils = {};
  data = {};
  async init() {
    this.event = {
      initPage: new CustomEvent("initPage"),
    };
    this.data = initEJSData();

    let loading_backdrop = new Loading_backdrop();
    let axios = new _Axios({ backdrop: loading_backdrop, G: this });
    this.utils = {
      loading_backdrop,
      axios,
    };

    let loginData = await initNavbar(this.data, axios);
    if (loginData) {
      let { me, news } = loginData;
      this.utils.news = news;
      this.data.me = me;
    }

    return this;
  }
  async main(fn) {
    this.utils.loading_backdrop.show({ blockPage: true });
    if (fn) {
      await fn();
    }
    await this.utils.loading_backdrop.hidden();
    if (this.data.login) {
      await this.utils.news.checkNewsMore();
    }
    await new Promise((resolve) => {
      setTimeout(() => {
        document.dispatchEvent(this.event.initPage);
        if (!process.env.isProd) {
          window.G = this;
          console.log("initPage Event dispatch");
        }
        resolve();
      }, 0);
    });
  }
}
