/**
 * @description 頁面初始化，集中管理需要的數據與功能
 */

/* COMMON     ----------------------------------------------------------------------------- */
import _Axios from "./_axios";
import Loading_backdrop from "./LoadingBackdrop";
import initNavbar from "./navbar";
import initEJSData from "./initEJSData";
import "./pagination";
import "./errorHandle";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

window._initFns = [];

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  data;
  constant;
  utils;
  event;
  async init() {
    // 初始化ejs以HTML存放的數據
    this.data = initEJSData();
    // 給JS使用的常數
    let { page, active } = this.data;
    this.constant = COMMON.SELECTOR[page];
    // 讀取遮罩
    let loading_backdrop = new Loading_backdrop();
    // 自訂義的axios，針對響應封裝了一些處理
    let _axios = new _Axios({
      // 可以控制是否啟用讀取遮罩
      backdrop: loading_backdrop,
      // 提供響應處理的參數
      active,
    });
    // 調用G.init之前，LoadingBackdrop已利用CSS保持顯示狀態，故手動關閉「_axios自動LoadingBackdrop的功能」
    _axios.autoLoadingBackdrop = false;
    // 初始化navbar的樣式與功能，返回結果代表是否為登入狀態
    let login = await initNavbar(active, _axios);
    // 故手動開啟「_axios自動LoadingBackdrop的功能」
    _axios.autoLoadingBackdrop = true;
    this.utils = {
      loading_backdrop,
      axios: _axios,
    };
    if (!login) {
      this.data.me = undefined;
      this.utils.news = undefined;
    } else {
      this.data.me = login.me;
      this.utils.news = login.news;
    }

    // let initPage = new CustomEvent("initPage")
    this.event = {
      // 頁面初始化完成事件
      initPage: this.#createInitPageEvent("initPage"),
      logout: new CustomEvent("logout"),
    };

    return this;
  }
  async initPage(initMain) {
    initMain && (await initMain());
    await this.utils.loading_backdrop.hidden();
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    if (!process.env.isProd) {
      window.G = this;
      console.log("initPage Event ---> dispatch");
    }
    document.dispatchEvent(this.event.initPage);
    await this.event.initPage.finish(this);
  }

  #createInitPageEvent(eventName) {
    let _G = this;
    return new (class _CustomEvent extends CustomEvent {
      #initFns = [];
      constructor() {
        super(eventName);
      }
      addFn(item) {
        this.#initFns.push(item);
      }
      async finish(G) {
        let promiseList = this.#initFns.map((item) => {
          if (item.passG) {
            return item.fn(G);
          } else {
            return item.fn();
          }
        });
        await Promise.all(promiseList);
        !process.env.isProd && console.log("initPage handle ---> OVER");
      }
    })();
  }
}
