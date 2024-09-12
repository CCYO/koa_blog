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
    //  紀錄當前Promise resolv
    this.resolve = undefined;
  }

  //  setTimeout 標記
  async #debounce() {
    let args = arguments;
    return new Promise((resolve, reject) => {
      //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
      //  args 是傳給 fn 的參數
      if (this.timeSet) {
        this._clearTimeout(this.timeSet);
      } else if (this.loading) {
        //  例如fn若是EventHandle，則代表可藉由args[0]取得event
        this.loading(...args);
      }

      this.timeSet = setTimeout(async () => {
        let _timeSet = this.timeSet;
        try {
          !process.env.isProd &&
            console.log(
              `debounce ----- \nsetTimeout\n【timer:${_timeSet}】\n【CB:${this.name}】\n---------- runing`
            );
          //  延遲調用fn
          let result = await this.callback(...args);
          if (this.timeSet === _timeSet) {
            !process.env.isProd &&
              console.log(
                `debounce ----- \nsetTimeout\n【timer:${_timeSet}】\n【CB:${this.name}】\n---------- finish`
              );
            this.timeSet = undefined;
            resolve(result);
          } else {
            !process.env.isProd &&
              console.log(
                `debounce ----- \nsetTimeout\n【timer:${_timeSet}】\n【CB:${this.name}】\n---------- finish, but already cancel`
              );
          }
          return;
        } catch (e) {
          !process.env.isProd &&
            console.log(
              `debounce ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- catch error, and call error_handle`
            );
          this._clearTimeout(_timeSet);
          this.error_handle(e);
          reject();
        }
      }, this.ms);

      this.resolve = (result) => {
        let _resolve = resolve;
        _resolve(result);
        this.resolve = undefined;
      };

      !process.env.isProd &&
        console.log(
          `debounce ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- ready`
        );
    });
  }

  _clearTimeout(timeSet) {
    !process.env.isProd &&
      console.log(
        `debounce ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- cancel, still resolve`
      );
    // 取消上一次的 setTimeout
    this.timeSet = clearTimeout(timeSet);
    this.resolve(null);
  }
}
