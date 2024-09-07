/* CSS Module ------------------------------------------------------------------------------- */
import "@css/wedgets/loadingBackdrop";

/* EXPORT MODULE ---------------------------------------------------------------------------- */
export default class {
  ID = "loadingBackdrop";
  //  可互動的元素selector
  targetSelector = `input, a, button, *[tabindex]:not(#${this.ID})`;
  blockClassName = "noClick";
  backdropClassName = "stopInteraction";
  editors = [];
  el_backdrop = undefined;
  $backdrop = undefined;

  constructor() {
    this.el_backdrop = document.querySelector(`#${this.ID}`);
    this.$backdrop = $(this.el_backdrop);
    //  文字節點與行內樣式，讓css生效
    this.$backdrop.find("h1").text("");
    [...this.$backdrop.find("*")].forEach((el) => {
      $(el).removeAttr("style");
    });
    $("body, main, nav, footer").removeAttr("style");
    $("form button[type=submit]").removeAttr("disabled");
    $("form button[type=submit]").prop("disabled", true);
    this.$backdrop.removeAttr("style");
    !process.env.isProd && console.log("loadingBackdrop ---> init");
    //  使backdrop的focus自動blur
    this.el_backdrop.addEventListener("focus", function (e) {
      e.preventDefault();
      !process.env.isProd && console.log("focus ---> el_backdrop");
      this.blur();
    });
  }
  //  隱藏
  async hidden() {
    this.#turnOnInteraction();
    await new Promise((resolve) => {
      this.$backdrop.fadeOut(() => {
        return resolve();
      });
    });
    $("body").removeClass("wait");
    !process.env.isProd && console.log("loadingBackdrop ---> hidden");
  }
  //  顯示
  show(config) {
    const {
      //  畫面是否顯示頁面遮罩
      blockPage = false,
      //  要新添加的wangEditor list
      editors = [],
    } = config;
    if (editors.length) {
      this.insertEditors(editors);
    }
    $("body").addClass("wait");
    this.#turnOffInteraction();
    if (!blockPage) {
      this.$backdrop.css("opacity", 0);
    }
    this.$backdrop.fadeIn();
    !process.env.isProd && console.log("LoadingBackdrop ---> show");
  }
  //  存入this.editors
  insertEditors(editors) {
    this.editors = this.editors.concat(editors);
  }
  //  開放頁面交互元素的互動功能
  #turnOnInteraction() {
    $(this.targetSelector)
      .removeClass(this.blockClassName)
      .off(`.${this.backdropClassName}`);
    //  取消editor不可操作的狀態
    for (let editor of this.editors) {
      editor.enable();
    }
  }
  //  關閉頁面交互元素的互動功能
  #turnOffInteraction() {
    for (let editor of this.editors) {
      //  關閉所有editor作用
      editor.disable();
    }
    /**
     * 綁定focus handle 當blockList發生focus，統一將focus轉移至 backdrop
     * （用上jq語法糖，賦予綁定事件一個指定名稱，作為取消綁定的標記）
     */
    $(this.targetSelector)
      .addClass(this.blockClassName)
      .on(`focus.${this.backdropClassName}`, (e) => this.#focusBackdrop(e));
  }
  //  讓頁面中所有的focus都轉移到backdrop
  #focusBackdrop(e) {
    e.preventDefault();
    //  聚焦到 backdrop
    this.el_backdrop.focus();
  }
}
