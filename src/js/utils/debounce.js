import error_handle from "./errorHandle";
export default class {
  ms = 250;
  loading = undefined;
  error_handle = error_handle;
  timeSet = undefined;
  /* 防抖動的函數工廠 */
  constructor(callback, config) {
    if (!callback) {
      throw new Error("創建Debounce Ins必須提供callback參數");
    } else if (typeof callback !== "function") {
      throw new Error("創建Debounce Ins的callback參數必須是function");
    }
    if (config) {
      this.name = config.name ? config.name : callback.name;
      this.ms = config.ms ? config.ms : this.ms;
      this.loading = config.loading ? config.loading : this.loading;
      this.error_handle = config.error_handle
        ? config.error_handle
        : this.error_handle;
    }
    this.callback = callback;
    this.debounce = this.#debounce.bind(this);
  }

  //  setTimeout 標記
  async #debounce() {
    let args = arguments;
    return new Promise((resolve, reject) => {
      //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
      //  args 是傳給 fn 的參數
      if (this.timeSet) {
        !process.env.isProd &&
          console.log(
            `debounce/setTimeout【${this.timeSet}】 CB/${this.name} clearTimeout`
          );
        /* 取消上一次的 setTimeout */
        this.timeSet = clearTimeout(this.timeSet);
        resolve();
      } else if (this.loading) {
        //  例如fn若是EventHandle，則代表可藉由args[0]取得event
        this.loading(...args);
      }

      this.timeSet = setTimeout(async () => {
        try {
          //  延遲調用fn
          let result = await this.callback(...args);
          !process.env.isProd &&
            console.log(
              `debounce/setTimeout【${this.timeSet}】 CB/${this.name} call finish`
            );
          this.timeSet = undefined;
          resolve(result);
        } catch (e) {
          !process.env.isProd &&
            console.log(
              `debounce/setTimeout【${this.timeSet}】CB/${this.name} error`
            );
          this.timeSet = clearTimeout(this.timeSet);
          this.error_handle(e);
          reject();
        }
      }, this.ms);
      !process.env.isProd &&
        console.log(
          `debounce/setTimeout【${this.timeSet}】 CB/${this.name} ready`
        );
    });
  }
}
