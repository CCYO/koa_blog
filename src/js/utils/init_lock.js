import formFeedback from "./formFeedback";

//  驗證是否可submit
// lock基本上,是針對數據的操作,額外對樣式的操作,
// 僅限存於使用setKVpairs存入數據時,會直接使用formFeed將該input顯示為valid樣式
export default function (config) {
  class Payload extends Map {
    constructor(config) {
      super();
      let {
        selector,
        before_setKVpairs,
        after_setKVpairs,
        other_check_submit,
        after_check_submit,
      } = config;
      this.$form = $(selector);
      this.jq_submit = this.$form.find("[type=submit]").eq(0);
      if (!this.jq_submit.length) {
        throw new Error(`${selector}沒有submit元素`);
      }
      this.selector = selector;
      this.required_list = [
        ...this.$form.find("input[required]").map((ind, inp) => inp.name),
      ];
      // 通常使用情況為，再次更動「已確定」且「存在依賴關係」表格數據
      this.before_setKVpairs = before_setKVpairs ? before_setKVpairs : [];
      // 通常使用情況為，提醒使用者接著填寫「存在依賴關係」表格數據
      this.after_setKVpairs = after_setKVpairs ? after_setKVpairs : [];
      // 添加「form內有無is-invalid」以外的判斷，item的RV為Boolean，true表示valid，false表示invalid
      this.other_check_submit = other_check_submit ? other_check_submit : [];
      // 針對「form之內,除了主要submit以外，其他需要切換disabled」的互動元素做判斷
      this.after_check_submit = after_check_submit ? after_check_submit : [];
    }

    async setKVpairs(dataObj) {
      if (this.before_setKVpairs.length) {
        let promises = this.before_setKVpairs.map((fn) => fn(this, dataObj));
        await Promise.all(promises);
      }
      //  將kv資料存入
      const entries = Object.entries(dataObj);
      if (entries.length) {
        for (let [key, value] of entries) {
          this.set(key, value);
          let input = document.querySelector(
            `${this.selector} input[name=${key}]`
          );
          input && formFeedback.validated(input, true);
        }
      }
      if (this.after_setKVpairs.length) {
        let promise = this.after_setKVpairs.map((fn) => fn(this, dataObj));
        await Promise.all(promise);
      }
    }
    getPayload() {
      let res = {};
      for (let [key, value] of [...this]) {
        res[key] = value;
      }
      return res;
    }
    async check_submit() {
      let disabled =
        this.$form.find(".is-invalid").length > 0 ||
        this.required_list.some((required) => !this.has(required));
      if (!disabled && this.other_check_submit.length) {
        disabled = this.other_check_submit
          //fn的RV為Boo，true代表disabled
          .map((fn) => fn(this))
          .some((boo) => boo);
      }
      this.jq_submit.prop("disabled", disabled);
      if (this.after_check_submit.length) {
        let promises = this.after_check_submit.map((fn) => fn(this));
        await Promise.all(promises);
      }
      return !disabled;
    }
  }
  return new Payload(config);
}
