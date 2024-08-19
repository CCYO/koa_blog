/* Utils Module ----------------------------------------------------------------------------- */
import { _Axios } from "@js/utils";
import Loading_backdrop from "./LoadingBackdrop";
import initNavbar from "./navbar";
import initEJSData from "./initEJSData";

export default class {
  utils = {};
  data = {};
  async init() {
    let loading_backdrop = new Loading_backdrop();
    let axios = new _Axios({ backdrop: loading_backdrop });
    this.utils = { loading_backdrop, axios };
    let { news, me } = await initNavbar(axios);
    let ejs_data = initEJSData();
    this.data = { ...ejs_data, me, news };
    if (me.id) {
      this.utils.news = news;
    }
    return this;
  }
  async main(fn) {
    this.utils.loading_backdrop.show({ blockPage: true });
    if (fn) {
      await fn();
    }
    await this.utils.loading_backdrop.hidden();
    if (this.data.me.id) {
      await this.utils.news.checkNewsMore();
    }
    if (!process.env.isProd) {
      window.G = this;
      console.log("page init finish!");
    }
  }
}
