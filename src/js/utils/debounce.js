/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  //  防抖動的間距時間
  ms = 250;
  //  防抖動的過度函數
  loading = undefined;
  //  實際要防抖動的CB
  callback = undefined;
  //  保存實例debounce
  debounce = undefined;
  timeSet = undefined;
  //  紀錄當次debounce的Promise resolv
  resolve = undefined;
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
      this.target = config.target ? config.target : undefined;
      this.eventType = config.eventType ? config.eventType : undefined;
    }
    this.callback = callback;
    this.debounce = this.#debounce.bind(this);
    if (this.target && this.eventType) {
      this.target.addEventListener(this.eventType, this.debounce);
    }
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
        // 及時保存當前數據
        let _args = args;
        let _timeSet = this.timeSet;
        try {
          !process.env.isProd &&
            console.log(
              `debounce ----- \nsetTimeout\n【timer:${_timeSet}】\n【CB:${this.name}】\n---------- runing`
            );
          //  延遲調用fn
          let result = await this.callback(..._args);
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
              `debounce ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- catch error`
            );
          clearTimeout(_timeSet);
          reject(e);
        }
      }, this.ms);

      // 每次生成setTimeout時，針對將此次setTimeout封裝的Promise，
      // 都要記下該次的Promise resolve，以便此次setTimeout被clearTimeout時一併調用
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
        `debounce ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- cancel`
      );
    // 取消最近一次 setTimeout
    this.timeSet = clearTimeout(timeSet);
    // 取消最近一次 setTimeout
    this.resolve(null);
  }
}
