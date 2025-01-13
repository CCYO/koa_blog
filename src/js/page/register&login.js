/* CSS        ----------------------------------------------------------------------------- */
import "@css/register&login.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { _Ajv, Debounce, formFeedback, redir } from "../utils";

/* NPM        ----------------------------------------------------------------------------- */
import Tab from "bootstrap/js/dist/tab";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* VAR        ----------------------------------------------------------------------------- */
const API = {
  REGISTER_SUCCESS: "/login",
  REGISTER: "/api/user/register",
  LOGIN_SUCCESS: "/self",
  LOGIN: "/api/user",
};
/* RUNTIME    ----------------------------------------------------------------------------- */
const ajv = _Ajv(G.utils.axios);
G.utils.validate = {
  login: ajv._validate.login,
  register: ajv._validate.register,
  passwordAndAgain: ajv._validate.password_again,
  isEmailExist: ajv._validate.is_email_exist,
};
await G.initPage(initMain);

function initMain() {
  //  初始化 NavTab
  initNavTab();
  //  初始化 Register Form 功能
  initRegistFn(`#${G.constant.ID.REGISTER_FORM}`);
  //  初始化 Login Form 功能
  initLoginFn(`#${G.constant.ID.LOGIN_FORM}`);

  //  提示需登入權限
  document.addEventListener("initPage", (event) => {
    !process.env.isProd && console.log("initPage handle ---> 登入提醒");
    event.addFn({ fn });

    function fn() {
      let params = new URL(location.href).searchParams;
      if (params.has(COMMON.UTILS.REDIR_FROM)) {
        alert("需要登入才能使用頁面功能");
      }
    }
  });

  // 初始化 NavTab
  function initNavTab() {
    let navTab_login = document.querySelector(`[data-my-tab="#login"]`);
    let navTab_register = document.querySelector(`[data-my-tab="#register"]`);
    let $navTab_login = $(navTab_login);
    let $navTab_register = $(navTab_register);
    let card_tab_login = document.querySelector(
      `[data-bs-target="#login-card"]`
    );
    let card_tab_register = document.querySelector(
      `[data-bs-target="#register-card"]`
    );
    let bs_tab_login = new Tab(card_tab_login);
    let bs_tab_register = new Tab(card_tab_register);
    navTab_register.addEventListener("click", (e) => {
      bs_tab_register.show();
    });
    navTab_login.addEventListener("click", (e) => {
      bs_tab_login.show();
    });
    card_tab_register.addEventListener("show.bs.tab", (e) => {
      $navTab_register.parent().addClass("active");
      $navTab_login.parent().removeClass("active");
    });
    card_tab_login.addEventListener("show.bs.tab", (e) => {
      $navTab_login.parent().addClass("active");
      $navTab_register.parent().removeClass("active");
    });
  }
  /* 初始化 Register Form 功能 */
  function initLoginFn(form_id) {
    const form = document.querySelector(form_id);
    let axios_payload = {};
    //  依據 input 數據，自動判斷 form 可否開放 submit 功能
    let lock = _gen_form_lock(form);
    //  為所有input註冊debounce化的inputEvent handler
    _add_form_debounce_inputEvent_handler(form, handle_input_login);
    //  為 form 註冊 submitEvent handler
    form.addEventListener("submit", handle_submit_login);
    /* 登入表單 submit Event handler */
    async function handle_submit_login(e) {
      e.preventDefault();
      e.target.disabled = true;
      let alert_message = G.constant.MESSAGE.LOGIN_FAIL;
      //  校驗 payload
      let validated_list = await G.utils.validate.login(axios_payload);
      //  當前進度是否順利
      let status = validated_list.valid;
      if (validated_list.valid) {
        /* 送出請求 */
        let { errno, msg } = await G.utils.axios.post(API.LOGIN, axios_payload);
        status = !errno;
        alert_message = msg;
      }
      if (!status) {
        ////  校驗失敗or請求失敗
        alert(alert_message);
        //  重置 payload
        axios_payload = {};
        //  重置 lock
        lock.reset();
        e.target.disabled = false;
      } else {
        ////  請求成功
        alert(G.constant.MESSAGE.LOGIN_SUCCESS);
        redir.from(API.LOGIN_SUCCESS);
      }
      return;
    }

    /* 登入表單內容表格的 input Event handler */
    async function handle_input_login(e) {
      e.preventDefault();
      //  標記，是否呈現標單提醒
      e.target.show_feedback = true;
      //  更新 axios_payload
      for (let { type, name, value } of form) {
        if (type === "submit") {
          continue;
        }
        axios_payload[name] = value;
      }
      //  校驗 axios_payload
      let validated_list = await G.utils.validate.login(axios_payload);
      //  更新 lock
      lock.update(validated_list);
      return;
    }
  }

  /* 初始化 Register Form 功能 */
  function initRegistFn(form_id) {
    const form = document.querySelector(form_id);
    let axios_payload = {};
    //  依據 input 數據，自動判斷 form 可否開放 submit 功能
    let lock = _gen_form_lock(form);
    //  為所有input註冊debounce化的inputEvent handler
    _add_form_debounce_inputEvent_handler(form, handle_input_register);
    //  為 form 註冊 submitEvent handler
    form.addEventListener("submit", handle_submit_register);

    /* 註冊表單 submit Event handler */
    async function handle_submit_register(e) {
      e.preventDefault();
      let alert_message = G.constant.MESSAGE.REGISTER_SUCCESS;
      //  校驗 axios_payload
      let validated_list = await G.utils.validate.register(axios_payload);
      //  axios_payload 是否有效
      //  當前進度狀態是否順利
      let status = validated_list.valid;
      if (validated_list.valid) {
        ////  校驗成功
        let { errno } = await G.utils.axios.post(API.REGISTER, axios_payload);
        //  更新進度狀態
        status = !errno;
        //  更新提醒內容
        alert_message = !status
          ? G.constant.MESSAGE.REGISTER_FAIL
          : alert_message;
      }
      if (status) {
        ////  請求成功
        alert(alert_message);
        location.href = API.REGISTER_SUCCESS;
      } else {
        ////  校驗失敗or請求失敗
        //  重置 payload
        axios_payload = {};
        //  重置 lock
        lock.reset();
        alert(alert_message);
      }
      return status;
    }

    /* 註冊表單內容表格的 input Event handler */
    async function handle_input_register(e) {
      e.preventDefault();
      //  REGISTER
      let target = e.target;
      let target_name = target.name;
      //  標記，是否呈現標單提醒
      target.show_feedback = true;
      //  取得當前fieldset內的表單數據
      let $input_list = $(e.target).parents("fieldset").find("input");
      let payload = {};
      for (let { name, value } of $input_list) {
        payload[name] = value;
      }
      //  更新 axios_payload
      axios_payload = { ...axios_payload, ...payload };
      //  校驗
      let validated_list;
      if (target_name === G.constant.NAME.EMAIL) {
        validated_list = await G.utils.validate.isEmailExist(payload);
      } else {
        validated_list = await G.utils.validate.passwordAndAgain(payload);
      }
      //  更新 lock
      lock.update(validated_list);
      return;
    }
  }

  // 處理校驗錯誤
  function _gen_form_lock(form) {
    //  管理form可否submit
    class Lock {
      constructor(form) {
        let $form = $(form);
        this.form = form;
        let $input_list = $form.find("input");
        this.input_list = [];
        this.not_required = [];
        for (let input of $input_list) {
          this.input_list.push(input);
          if (!input.required) {
            this.not_required.push(input.name);
          }
        }
        this.lock = new Set();
        //  lock.size === 0 則解鎖
        this.$submit = $form.find("[type=submit]").eq(0);
        //  submit的jq_ele
        this.reset();
      }
      add(inputName) {
        this.lock.add(inputName);
        this.checkSubmit();
      }
      delete(inputName) {
        this.lock.delete(inputName);
        this.checkSubmit();
      }
      checkSubmit() {
        this.$submit.prop("disabled", this.lock.size);
      }
      reset() {
        //  除了submit_ele以外的input
        for (let input of this.input_list) {
          const { name, type } = input;
          input.show_feedback = false;
          if (!this.not_required.some((field_name) => field_name === name)) {
            this.lock.add(name);
          }
        }
        formFeedback.reset(this.form);
        this.checkSubmit();
      }
      update(validated_list) {
        for (let { valid, field_name, message } of validated_list) {
          let input = $(form).find(`input[name=${field_name}]`).get(0);
          //  ↓ 未曾驗證過，那就不需要顯示提醒
          if (!input.show_feedback) {
            continue;
          }
          //  處理驗證成功的lock數據以及表格提醒
          if (valid) {
            this.lock.delete(field_name);
            formFeedback.validated(input, true);
          } else {
            this.lock.add(field_name);
            formFeedback.validated(input, false, message);
          }
        }
        this.checkSubmit();
        return;
      }
    }
    return new Lock(form);
    /* 藉由validateErrors，判斷form可否submit，並於input顯示校驗錯誤 */
  }

  //  將 input 的 inputEvent handler 進行 debounce 化，並註冊在所有 input 上
  function _add_form_debounce_inputEvent_handler(form, handle) {
    for (let input of form) {
      if (input.tagName !== "INPUT") {
        continue;
      }
      function loading() {
        formFeedback.loading(input);
        $(form).eq(0).prop("disabled", true);
      }
      const { debounce } = new Debounce(handle, {
        loading,
      });
      input.addEventListener("input", debounce);
    }
  }
}
