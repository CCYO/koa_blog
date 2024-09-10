/**
 * @description Loop Func
 */

/* UTILS      ----------------------------------------------------------------------------- */
import errorHandle from "../utils/errorHandle";

/* EXPORT     ----------------------------------------------------------------------------- */
export default class {
  // 間隔時間
  ms = 5 * 1000 * 60;
  // 過渡函數
  loading = undefined;
  // setTimeout 紀錄
  timeSet = undefined;
  // Array，可以在constructor設定，也可以藉由loop.start更新
  args = [];

  constructor(callback, config) {
    if (config) {
      this.name = config.name ? config.name : callback.name;
      this.ms = config.ms ? config.ms : this.ms;
      this.args = config.args ? config.args : this.args;
      this.loading = config.loading ? config.loading : this.loading;
    }
    this.callback = callback;
  }
  //  停止loop
  stop() {
    if (this.timeSet) {
      !process.env.isProd &&
        console.log(
          `loop stop ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- cancel`
        );
      this.timeSet = clearTimeout(this.timeSet);
    }
  }
  // 立刻執行一次
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
  //  開始loop(設定setTimeout)
  start() {
    if (this.timeSet) {
      return;
    }
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
            `loop auto ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- catch error, and call errorHandle`
          );
        this.stop();
        errorHandle(e);
      }
      return;
    }, this.ms);
    !process.env.isProd &&
      console.log(
        `loop start ----- \nsetTimeout\n【timer:${this.timeSet}】\n【CB:${this.name}】\n---------- ready`
      );
  }
}
