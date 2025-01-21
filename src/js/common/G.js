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

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  data;
  constant;
  utils;
  event;
  #afterRenderFns;
  async init() {
    // 初始化ejs以HTML存放的數據
    this.data = initEJSData();
    // 給JS使用的常數
    let { page, active } = this.data;
    this.constant = COMMON.SELECTOR[page];
    // 讀取遮罩，創建後為顯示遮罩的狀態
    let loading_backdrop = new Loading_backdrop();
    // 自訂義的axios，針對響應封裝了一些處理
    let _axios = new _Axios({
      // 可以控制是否啟用讀取遮罩
      backdrop: loading_backdrop,
      // 提供響應處理的參數
      active,
    });
    this.utils = {
      loading_backdrop,
      axios: _axios,
    };
    // 初始化navbar的樣式與功能，返回結果代表是否為登入狀態
    let login = await initNavbar(active, _axios);
    if (!login) {
      this.data.me = undefined;
      this.utils.news = undefined;
    } else {
      this.data.me = login.me;
      this.utils.news = login.news;
    }

    this.event = {
      // 頁面初始化完成事件
      initPage: this.#createInitPageEvent("initPage"),
    };

    return this;
  }
  async initPage(initMain) {
    initMain && (await initMain());
    !process.env.isProd && console.log("G initMain ---> OVER");
    await this.utils.loading_backdrop.hidden();
    await this.over();
  }

  async over() {
    document.dispatchEvent(this.event.initPage);
    await Promise.all(this.#afterRenderFns);
    if (!process.env.isProd) {
      window.G = this;
      !process.env.isProd && console.log("頁面初始化完成");
    }
  }

  afterRender({ fn, passG, msg }) {
    !process.env.isProd && console.log(`G After Render ---> ${msg}`);
    this.#afterRenderFns.push(passG ? fn(this) : fn());
  }
  #createInitPageEvent(eventName) {
    const G = this;
    return new (class _CustomEvent extends CustomEvent {
      #initFns = [];
      constructor() {
        super(eventName);
        this.G = G;
        this.G.#afterRenderFns = [];
      }
    })();
  }
}
