import errorHandle from "../utils/errorHandle";

export default class {
  ms = 5 * 1000 * 60;
  timeSet = undefined;
  loading = undefined;
  args = [];
  error_handle = errorHandle;
  /* 防抖動的函數工廠 */
  constructor(callback, config) {
    if (!callback) {
      throw new Error("創建Loop Ins必須提供callback參數");
    } else if (typeof callback !== "function") {
      throw new Error("創建Loop Ins的callback參數必須是function");
    }
    if (config) {
      this.name = config.name ? config.name : callback.name;
      this.ms = config.ms ? config.ms : this.ms;
      this.args = config.args ? config.args : this.args;
      this.loading = config.loading ? config.loading : this.loading;
      this.error_handle = config.error_handle
        ? config.error_handle
        : this.error_handle;
    }
    this.callback = callback;
  }

  stop() {
    if (this.timeSet) {
      !process.env.isProd &&
        console.log(
          `loop stop ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- cancel`
        );
      this.timeSet = clearTimeout(this.timeSet);
    }
  }
  async now() {
    this.stop();
    !process.env.isProd &&
      console.log(
        `loop now ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- start`
      );
    let res = await this.callback.call(this, ...arguments);
    !process.env.isProd &&
      console.log(
        `loop now ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- finish`
      );
    return res;
  }
  //  setTimeout 標記
  start() {
    //  創建call時，已將this綁定在實例上，故call若作為eventHandle使用，調用時的this也是指向實例
    //  args 是傳給 fn 的參數
    if (arguments.length) {
      this.args = [...arguments];
    }
    if (this.loading) {
      //  例如fn若是EventHandle，則代表可藉由args[0]取得event
      this.loading(...this.args);
    }
    this.timeSet = setTimeout(async () => {
      try {
        await this.callback(...this.args);
        //  清除timeSet，讓下一次loading順利調用
        !process.env.isProd &&
          console.log(
            `loop auto ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- finish`
          );
        this.timeSet = undefined;
        this.start(...this.args);
      } catch (e) {
        !process.env.isProd &&
          console.log(
            `loop auto ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- catch error, and call error_handle`
          );
        this.stop();
        this.error_handle(e);
      }
      return;
    }, this.ms);
    !process.env.isProd &&
      console.log(
        `loop start ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- ready`
      );
  }
}
