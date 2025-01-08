/* COMMON     ----------------------------------------------------------------------------- */
import Loop from "./loop";
import { render } from "../utils";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  #API_LOGOUT = "/api/user/logout";
  #API_NEWS = `/api/news`;
  // 是否第一次調用
  #first = true;
  // 是否自動調用
  #auto = false;
  // 上一次請求，是否以獲取後端所有unconfirm
  #checkNews = false;
  ws_cb = undefined;
  db = _count();
  #id_list = Object.defineProperties(
    {},
    {
      idolFans: { value: [], enumerable: true },
      articleReader: { value: [], enumerable: true },
      msgReceiver: { value: [], enumerable: true },
      total: {
        get() {
          return (
            this.idolFans.length +
            this.articleReader.length +
            this.msgReceiver.length
          );
        },
      },
      clear: {
        value() {
          for (let prop in this) {
            this[prop].length = 0;
          }
        },
      },
      update: {
        value(list) {
          for (let { type, id } of list) {
            let prop;
            switch (type) {
              case COMMON.NEWS.TYPE.IDOL_FANS:
                prop = "idolFans";
                break;
              case COMMON.NEWS.TYPE.ARTICLE_READER:
                prop = "articleReader";
                break;
              case COMMON.NEWS.TYPE.MSG_RECEIVER:
                prop = "msgReceiver";
                break;
            }
            this[prop].push(id);
          }
        },
      },
    }
  );

  htmlStr = new HtmlStr();
  Render = Render;
  constructor(axios) {
    this.axios = axios;
    Object.defineProperty(this, "axios", {
      value: axios,
      enumerable: false,
      writable: false,
      configurable: false,
    });
    Object.defineProperty(this, "status", {
      get() {
        if (this.#first) {
          !process.env.isProd && console.log("news ---> 首次");
          return { status: COMMON.NEWS.STATUS.FIRST };
          // } else if (this.#checkNews) {
        } else if (this.#auto && this.#checkNews) {
          !process.env.isProd && console.log("news ---> 自動|check");
          return {
            status: COMMON.NEWS.STATUS.CHECK,
          };
        } else if (!this.#auto) {
          // 到這邊的原因
          // 1)自動，!this.$checkNews
          // 2)手動，!this.$checkNews
          // 3)手動，this.$checkNews但ws.code(1)開啟readMore
          !process.env.isProd &&
            console.log(`news ---> ${this.#auto ? "自動" : "手動"}|獲取通知`);
          return {
            status: COMMON.NEWS.STATUS.AGAIN,
            excepts: { ...this.#id_list },
          };
        }
      },
    });
  }
  async init({ me, news: newsData }) {
    await import(
      /*webpackChunkName:'bootstrap-offcanvas'*/ "bootstrap/js/dist/offcanvas"
    );
    let { default: BS_dropdown } = await import(
      /*webpackChunkName:'bootstrap-dropdown'*/ "bootstrap/js/dist/dropdown"
    );
    this.BS_dropdown = BS_dropdown;
    let renderClass = (this.renderClass = new this.Render(this));
    this.checkNewsMore = renderClass.checkNewsMore.bind(renderClass);
    this.loop = renderClass.loop;
    this.#first = false;
    this.update(newsData);
    if (WebSocket) {
      let ins_news = this;
      let ws_api =
        location.protocol === "https:"
          ? `wss://${location.host}/ws`
          : `ws://${location.host}/ws`;
      let ws = (this.ws = new WebSocket(ws_api));
      //開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
      ws.onopen = () => {
        this.user_id = me.id;
        !process.env.isProd &&
          console.log(`ws 【user:${me.id}】 open connection`);
      };

      //關閉後執行的動作，指定一個 function 會在連結中斷後執行
      ws.onclose = async (event) => {
        !process.env.isProd &&
          console.log(`ws close \ncode:${event.code}\nreason:${event.reason}`);
        if (event.code >= COMMON.WS.CLOSE.EMPLOYER_ID.CODE) {
          if (!document.hidden) {
            logout(event.reason);
          } else {
            ins_news.ws_cb = () => {
              ins_news.ws_cb = undefined;
              logout(event.reason);
            };
          }
        }
        async function logout(reason) {
          await ins_news.axios.get(ins_news.#API_LOGOUT);
          alert(reason);
          location.href = "/login";
          return;
        }
      };

      ws.onmessage = async function (event) {
        switch (Number(event.data)) {
          case COMMON.WS.HAS_UNCONFIRM:
            await getNews();
            break;
          case COMMON.WS.HAS_CONFIRM:
            ins_news.db.confirm += 1;
            ins_news.renderClass.showReadMore();
        }
        async function getNews() {
          ins_news.ws_cb = async () => {
            await ins_news.loop.now();
            ins_news.ws_cb = undefined;
            ins_news.loop.start();
          };

          if (!document.hidden) {
            await ins_news.ws_cb();
          }
        }
      };
    }
    return this;
  }
  update({ list, num, hasNews }) {
    if (hasNews) {
      this.clear();
    }
    for (let isConfirm in list) {
      //  更新 $news.newsList
      this.#id_list.update(list[isConfirm]);
      //  更新htmlStr
      this.htmlStr.update(list, isConfirm);
    }
    this.db.confirm = num.confirm;
    this.db.unconfirm = num.unconfirm;
  }
  clear() {
    this.htmlStr.clear();
    this.#id_list.clear();
    this.#newsDropdownClear();
  }
  #newsDropdownClear() {
    //  清空頁面已渲染的通知條目
    $(`li[id$=-news-title]`).hide();
    //  清空新聞列表
    $(".news-item").remove();
    //  清空新聞列表分隔線
    $("[data-my-hr]").remove();
    //  收起下拉選單
    this.renderClass.bs_dropdown.hide();
  }
  //  請求 news
  async getLoginData(auto = false) {
    /* 響應的數據 { 
        errno, 
        data: {
            news : {
                newsList: {
                    unconfirm: [
                        { type, id, timestamp, confirm, fans: ... }, ...
                        { type, id, timestamp, confirm, blog: ... }, ...
                        { type, id, timestamp, confirm, comment: ... }, ...
                    ],
                   confirm: [...]
               },
               num: { unconfirm, confirm, total },
               hasNews: boo
           },
           me: ...
       }
    */
    // 自動調用前，從前一次與後端取得的資料若已確認後端沒有新通知了，auto設為false
    this.#auto = auto;
    if (auto) {
      // 若已經獲取後端所有unconfirm，此次請求僅再次確認後端是否有unconfirm
      if (!this.ws_cb) {
        this.axios.autoLoadingBackdrop = false;
      }
      this.#checkNews =
        this.db.unconfirm -
          this.htmlStr.rendered.unconfirm -
          this.htmlStr.unRender.unconfirm <=
        0;
    }

    let { errno, data } = await this.axios.post(this.#API_NEWS, this.status);
    this.axios.autoLoadingBackdrop = true;
    this.#checkNews = false;
    if (!errno) {
      !this.#first && this.update(data.news);
      return data;
    } else {
      return undefined;
    }
  }
  //  confirm news
  confirmNews = async (event) => {
    event.preventDefault();
    let eventTarget = event.target;
    let $eventTarget = $(event.target);
    let tag = eventTarget.tagName.toUpperCase();
    let api = $eventTarget.attr("href");
    if (tag !== "A" || !/^\/api/.test(api)) {
      return false;
    }
    let response = await this.axios.get(api);
    let url;
    if (response.errno) {
      url = `/permission/${response.errno}`;
    } else {
      url = response.data.url;
    }
    location.href = url;
  };
}
//  操作news的具體顯示
class HtmlStr {
  confirm = "";
  unconfirm = "";
  rendered = _count();
  unRender = _count();

  constructor() {
    //   dayjs.locale("zh-tw");
    //   dayjs.extend(relativeTime);
    Object.defineProperties(this, {
      confirm: { configurable: false },
      unconfirm: { configurable: false },
      rendered: { enumerable: false, configurable: false },
      unRender: { enumerable: false, configurable: false },
    });
  }
  //  清空(更新num.htmlStr)
  clear() {
    for (let isConfirm in this) {
      this[isConfirm] = "";
      this.rendered[isConfirm] = 0;
      this.unRender[isConfirm] = 0;
    }
  }
  //  渲染(更新 num.htmlStr、num.dropdown)
  render() {
    for (let isConfirm in this) {
      if (!this[isConfirm].length) {
        continue;
      }
      let htmlStr = this[isConfirm];
      //  通知列表title
      let $title = $(`#${isConfirm}-news-title`);
      //  通知列表item的hr
      let hr = $(`[data-my-hr=${isConfirm}-news-hr]`);
      if ($title.is(":hidden")) {
        ////  處理htmlStr[isConfirm]初次渲染
        $title.after(htmlStr).removeAttr("style");
      } else {
        ////  處理htmlStr[isConfirm]非初次渲染
        hr.last().after(htmlStr);
      }
      this[isConfirm] = "";
      //  更新 dropdown item num
      this.rendered[isConfirm] += this.unRender[isConfirm];
      //  更新 htmlStr num
      this.unRender[isConfirm] = 0;
      //  high light 剛渲染的 unconfirm news
      setTimeout(() => {
        $(".news-item").removeAttr("style");
        setTimeout(() => {
          $(".news-item").removeClass("transition-bg");
        }, 3000);
      }, 0);
    }
  }
  //  更新htmlStr、num.htmlStr
  update(newsList, isConfirm) {
    ////  若news有數據，進行更新
    this[isConfirm] += this.#template(newsList[isConfirm]);
    this.unRender[isConfirm] += newsList[isConfirm].length;
  }
  //  生成 htmlStr
  #template(list) {
    return list.reduce((htmlStr, item) => {
      // let { confirm, id, fans, timestamp } = item;
      let { type, confirm } = item;
      // item.timestamp = dayjs(
      //   item.timestamp,
      //   FRONTEND.NAVBAR.NEWS.TIME_FORMAT
      // ).fromNow();
      switch (type) {
        case 1:
          htmlStr += render.navbar.fansIdol(item);
          break;
        case 2:
          htmlStr += render.navbar.articleReader(item);
          break;
        case 3:
          htmlStr += render.navbar.msgReceiver(item);
      }
      let hr = confirm
        ? `<li data-my-hr="confirm-news-hr">`
        : `<li data-my-hr="unconfirm-news-hr">`;
      hr += `<hr class="dropdown-divider"></li>`;
      return (htmlStr += hr);
    }, "");
  }
}
//  有關下拉選單的handle
class Render {
  // 下拉表單是否展開
  #show = false;
  first = true;
  count = 0;
  //  單位ms, 5 min
  LOAD_NEWS = 1000 * 5 * 60;
  //  更多通知BTN
  $readMore = $("#readMore");
  //  沒有更多通知BTN
  $noNews = $("#noNews");
  //  新通知數
  $newsCount = $(".news-count");
  $new_newsCount = $(".new-news-count");
  //  下拉選單按鈕
  $newsDropdown = $("#newsDropdown");
  $newsList = $(`#newsList`);

  constructor(newsClass) {
    this.newsClass = newsClass;
    this.getLoginData = newsClass.getLoginData.bind(newsClass);

    // 創建下拉選單
    this.bs_dropdown = new newsClass.BS_dropdown(this.$newsDropdown[0]);
    //  讓readMore自動循環的類
    let loop = (this.loop = new Loop(this.readMore.bind(this), {
      ms: this.LOAD_NEWS,
    }));

    document.addEventListener("initPage", () => {
      !process.env.isProd && console.log("initPage handle ---> loop.start");
      if (!document.hidden) {
        //  啟動 readMore 自動循環
        loop.start();
      }
    });

    // 頁面不被使用時，停止自動獲取news數據
    document.addEventListener("visibilitychange", async (e) => {
      if (document.hidden) {
        loop.stop();
      } else if (this.newsClass.ws_cb) {
        await this.newsClass.ws_cb();
      } else if (!this.#show) {
        loop.start();
      }
    });
    //  為 BS5 下拉選單元件 註冊 hide.bs.dropdown handler(選單展開時回調)
    this.$newsDropdown[0].addEventListener("show.bs.dropdown", () => {
      this.#show = true;
      ////  暫停 readMore自動循環，使用箭頭函數是因為 loop.stop 內部有 this，必須確保this指向loop
      loop.stop();
    });
    //  為 BS5 下拉選單元件 註冊 hide.bs.dropdown handler(選單收起時回調)
    this.$newsDropdown[0].addEventListener("hide.bs.dropdown", () => {
      this.#show = false;
      ////  開始 readMore自動循環，使用箭頭函數是因為 loop.start 內部有 this，必須確保this指向loop
      loop.start();
    });
    //  綁定「通知鈕」click handle → 顯示通知筆數
    this.$newsDropdown.on("click", () => this.renderHtmlStr());
    //  綁定「讀取更多鈕」click handle → 獲取更多通知數據、同時更新公開數據與渲染葉面
    this.$readMore.on("click", loop.now.bind(loop, true));
    this.$newsList.on("click", this.newsClass.confirmNews);
  }
  async _countFadeIn(first) {
    let { db, htmlStr } = this.newsClass;
    let newCount = first
      ? db.unconfirm - htmlStr.rendered.unconfirm
      : db.unconfirm;
    if (
      newCount === 0 ||
      (first && htmlStr.unRender.total > COMMON.NEWS.LIMIT)
    ) {
      this.$newsCount.text(newCount ? newCount : "");
    } else {
      let unconfirm_count = Number(this.$newsCount.text());
      if (unconfirm_count && unconfirm_count === newCount) {
        this.count = newCount;
        return;
      }
      let button = this.$newsCount.parent()[0];
      let style = window.getComputedStyle(button);
      let x = `${parseInt(button.getBoundingClientRect().x)}px + ${
        style.borderLeftWidth
      } + ${style.marginLeft}`;
      let y = `${parseInt(button.getBoundingClientRect().y)}px + ${
        style.borderTopWidth
      } + ${style.marginTop}`;
      button.getBoundingClientRect().y +
        Number(style.paddingTop.split("px")[0]) +
        Number(style.marginTop.split("px")[0]);
      let start = {
        x: `${window.innerWidth / 2}px`,
        y: `${window.innerHeight / 2}px`,
      };
      let end = {
        x,
        y,
      };
      let translate = {
        x: `${start.x} - (${end.x})`,
        y: `${start.y} - (${end.y})`,
      };
      this.$new_newsCount.css({
        top: `calc(${translate.y})`,
        left: `calc(${translate.x})`,
        opacity: 0,
      });
      await new Promise((resolve) => {
        this.$new_newsCount.text(newCount).show(0).removeAttr("style");
        setTimeout(resolve, 1000);
      });
      this.$new_newsCount.text("");
      this.$newsCount.text(newCount);
    }
    this.count = newCount;
  }
  async _renderFadeIn() {
    let { htmlStr, db } = this.newsClass;
    let scroll =
      htmlStr.rendered.total && htmlStr.unRender.unconfirm <= COMMON.NEWS.LIMIT;
    htmlStr.render();
    if (scroll) {
      $(".dropdown-menu").scrollTop(99999);
    }
    let newCount = db.unconfirm - htmlStr.rendered.unconfirm;
    this.$newsCount.text(newCount);
    await new Promise((resolve) => {
      let num = this.count - newCount;
      this.count = newCount;
      if (!newCount) {
        this.$newsCount.css({ opacity: 0 });
      }
      if (num) {
        this.$new_newsCount.text(num).show(0).css({ top: "7rem", opacity: 0 });
      }
      setTimeout(() => {
        if (!newCount) {
          this.$newsCount.text("").removeAttr("style");
        }
        this.$new_newsCount.text("").removeAttr("style");
        resolve();
      }, 1000);
    });
  }
  showReadMore() {
    let { db, htmlStr } = this.newsClass;
    //  未渲染的 news count
    let more = db.total - htmlStr.rendered.total > 0;
    //  顯示/隱藏「讀取更多」
    if (more) {
      this.$readMore.show(0);
      this.$noNews.hide(0);
    } else {
      this.$readMore.hide(0);
      this.$noNews.show(0);
    }
  }
  async checkNewsMore(insert = false, hasNews = false) {
    let $btn = this.$readMore.children("button").eq(0);
    if ($btn.is(":visible")) {
      $btn.css({ opacity: "0.5" }).prop("disabled", true);
    }
    await _showNewsCount.call(this, hasNews, insert);

    if ($btn.is(":visible")) {
      $btn.removeAttr("style").prop("disabled", false);
    }
    //  顯示/隱藏「讀取更多」
    this.showReadMore();

    async function _showNewsCount(hasNews, insert) {
      if (this.first) {
        await this._countFadeIn(this.first);
        this.first = false;
      } else if (hasNews) {
        this.count = 0;
        await this._countFadeIn(this.first);
      }
      if (insert) {
        await this._renderFadeIn();
      }
    }
  }
  async renderHtmlStr(hasNews = false) {
    let insert = this.newsClass.htmlStr.unRender.total > 0;
    await this.checkNewsMore(insert, hasNews);
  }
  async readMore(byClick = false) {
    //  當前已收到的通知數據，提供給後端過濾
    let {
      news: { hasNews },
    } = await this.getLoginData(!byClick);
    if (byClick) {
      this.renderHtmlStr(hasNews);
    } else {
      //  show/hide about news 提醒
      this.checkNewsMore(byClick, hasNews);
    }
  }
}
function _count() {
  return Object.defineProperties(
    {},
    {
      confirm: { value: 0, writable: true },
      unconfirm: { value: 0, writable: true },
      total: {
        get() {
          return this.confirm + this.unconfirm;
        },
      },
    }
  );
}
