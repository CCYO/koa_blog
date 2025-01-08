/**
 * @description 頁面初始化，集中管理需要的數據與功能
 */

/* COMMON     ----------------------------------------------------------------------------- */
import errorHandle from "./errorHandle";
import _Axios from "./_axios";
import Loading_backdrop from "./LoadingBackdrop";
import initNavbar from "./navbar";
import initEJSData from "./initEJSData";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";
/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  data;
  constant;
  utils;
  event;
  async init() {
    this.data = initEJSData();
    let { page, active } = this.data;
    this.constant = COMMON.SELECTOR[page];
    let loading_backdrop = new Loading_backdrop();
    let _axios = new _Axios({
      backdrop: loading_backdrop,
      active,
    });
    /**
     * G.init期間，LoadingBackdrop已開啟，故關閉_axios 的LoadingBackdrop auto
     */
    _axios.autoLoadingBackdrop = false;
    let login = await initNavbar(active, _axios);
    _axios.autoLoadingBackdrop = true;
    this.utils = {
      loading_backdrop,
      axios: _axios,
    };
    if (login) {
      this.utils.news = login.news;
      this.data.me = login.me;
    } else {
      this.data.me = undefined;
    }
    this.event = {
      // 頁面初始化完成事件
      initPage: new CustomEvent("initPage"),
      logout: new CustomEvent("logout"),
    };

    return this;
  }
  async initPage(initMain) {
    initMain && (await initMain());
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
