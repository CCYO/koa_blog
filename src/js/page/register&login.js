/* CSS        ----------------------------------------------------------------------------- */
import "@css/register&login.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { _Ajv, init_lock, Debounce, formFeedback, redir } from "../utils";

/* NPM        ----------------------------------------------------------------------------- */
import Tab from "bootstrap/js/dist/tab";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* VAR        ----------------------------------------------------------------------------- */
const API = {
  REGISTER_SUCCESS: "/login",
  REGISTER: "/api/user/register",
  EMAIL_CODE: "/api/user/registerCode",
  LOGIN_SUCCESS: "/self",
  LOGIN: "/api/user",
};
/* RUNTIME    ----------------------------------------------------------------------------- */
const ajv = _Ajv(G.utils.axios);
G.utils.validate = {
  login: ajv._validate.login,
  getEmailCode: ajv._validate.getEmailCode,
  passwordAndAgain: ajv._validate.password_again,
  isEmailExist: ajv._validate.is_email_exist,
  register: ajv._validate.register,
};
G.utils.lock = {};
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
    event.G.afterRender({ fn, msg: "登入提醒" });

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
  /* 初始化 Login Form 功能 */
  function initLoginFn(form_id) {
    const form = document.querySelector(form_id);
    const inp_email = document.querySelector(
      `${form_id} input[name=${G.constant.NAME.EMAIL}]`
    );
    G.utils.lock.login = init_lock({ selector: form_id });
    //  為所有input註冊debounce化的inputEvent handler
    _add_form_debounce_inputEvent_handler(form, handle_input_login);
    //  為 form 註冊 submitEvent handler
    form.addEventListener("submit", handle_submit_login);
    /* 登入表單 submit Event handler */
    async function handle_submit_login(e) {
      e.preventDefault();
      e.target.disabled = true;
      let payload = G.utils.lock.login.getPayload();
      //  校驗 payload
      let validated_list = await G.utils.validate.login(payload);
      if (!validated_list.valid) {
        for (let { field_name, valid, message } of validated_list) {
          if (valid) {
            continue;
          }
          let input = document.querySelector(
            `${form_id} input[name=${field_name}]`
          );
          if (!input) {
            continue;
          }
          G.utils.lock.login.delete(field_name);
          formFeedback.validated(input, valid, message);
        }
        return;
      }

      /* 送出請求 */
      let { errno, msg } = await G.utils.axios.post(API.LOGIN, payload);

      if (!errno) {
        alert("登入成功");
        redir.from(API.LOGIN_SUCCESS);
        return;
      }
      ////  請求失敗
      alert(msg);
      //  重置 payload
      G.utils.lock.login.clear();
      await G.utils.lock.login.check_submit();
      formFeedback.reset(form);
      inp_email.focus();
    }

    /* 登入表單內容表格的 input Event handler */
    async function handle_input_login(e) {
      e.preventDefault();
      let target = e.target;
      let targetVal = target.value;
      let field_name = target.name;
      let payload = { [field_name]: targetVal };
      //  校驗 axios_payload
      let validated_list = await G.utils.validate.login(payload);
      if (validated_list.valid) {
        G.utils.lock.login.setKVpairs(payload);
        formFeedback.validated(target, true);
      } else {
        G.utils.lock.login.delete(field_name);
        for (let { field_name, valid, message } of validated_list) {
          if (valid) {
            continue;
          }
          let input = document.querySelector(
            `${form_id} input[name=${field_name}]`
          );
          if (!input) {
            continue;
          }
          G.utils.lock.login.delete(field_name);
          formFeedback.validated(input, valid, message);
        }
      }
      await G.utils.lock.login.check_submit();
      return;
    }
  }

  /* 初始化 Register Form 功能 */
  function initRegistFn(form_id) {
    let form = document.querySelector(form_id);
    let el_modal = document.querySelector(`#${G.constant.ID.MODAL_EMAIL_CODE}`);
    let inp_emailCode = document.querySelector(
      `input[name=${G.constant.NAME.EMAIL_CODE}]`
    );
    let $inp_emailCode = $(inp_emailCode);
    let $btn_emailCode = $(`#${G.constant.ID.GET_EMAIL_CODE}`);
    let $btn_check_emailCode = $(`#${G.constant.ID.CHECK_EMAIL_CODE}`);

    let inp_password = document.querySelector(
      `${form_id} [name=${G.constant.NAME.PASSWORD}]`
    );
    let inp_password_again = document.querySelector(
      `${form_id} [name=${G.constant.NAME.PASSWORD_AGAIN}]`
    );
    let $inp_password_again = $(inp_password_again);

    G.utils.lock.register = init_lock({
      selector: form_id,
      after_setKVpairs: [needPWD],
    });
    //  為所有input註冊debounce化的inputEvent handler
    _add_form_debounce_inputEvent_handler(form, handle_input_register);
    //  為 form 註冊 submitEvent handler
    form.addEventListener("submit", handle_checkForm);

    /* 信箱驗證前的表單數據處理 */
    async function handle_checkForm(e) {
      e.preventDefault();
      //  校驗
      let validated_list = await G.utils.validate.getEmailCode(
        G.utils.lock.register.getPayload()
      );
      // 校驗成功
      if (validated_list.valid) {
        // 顯示modal
        showModal();
        return;
      }
      // 校驗失敗
      for (let { field_name, vaild, message } of validated_list) {
        if (vaild) {
          continue;
        }
        let input = document.querySelector(
          `${form_id} input[name=${field_name}]`
        );
        if (!input) {
          continue;
        }
        G.utils.lock.register.delete(field_name);
        formFeedback.validated(input, vaild, message);
      }
      await G.utils.lock.register.check_submit();
      return;

      //  創建驗證舊密碼的modal
      async function showModal(e) {
        if (!G.utils?.bs5_modal) {
          //  生成BS5 Modal
          let { default: BS_Modal } = await import(
            /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
          );
          G.utils.bs5_modal = new BS_Modal(el_modal);
          $btn_emailCode.on("click", getEmailCode);
          $btn_check_emailCode.on("click", checkEmailCode);
          $inp_emailCode.on("keydown", validEmailCode1);
          $inp_emailCode.on("input", validEmailCode2);
        }
        G.utils.bs5_modal.show();

        async function validEmailCode2(e) {
          let input = e.target;
          let code = input.value;
          input.value = code.replace(/[^0123456789]/g, "");
          if (input.value.length > 5) {
            $btn_check_emailCode.prop("disabled", false);
          } else {
            $btn_check_emailCode.prop("disabled", true);
          }
        }

        async function validEmailCode1(e) {
          let cancel =
            /(KeyE)|(ArrowUp)|(ArrowRight)|(ArrowDown)|(ArrowLeft)|(NumpadDecimal)/.test(
              e.code
            );
          if (cancel) {
            e.preventDefault();
          }
          if (e.key === "Enter") {
            let disabled = $btn_check_emailCode.prop("disabled");
            !disabled && (await checkEmailCode());
          }
        }

        async function checkEmailCode(e) {
          let turnOff = $btn_check_emailCode.prop("disabled");
          if (turnOff) {
            return;
          }
          turnOff = true;
          formFeedback.loading(inp_emailCode);
          $btn_check_emailCode.prop("disabled", true);
          if (Date.now() >= G.data.emailCode.expire) {
            await getEmailCode(null, true);
            return;
          }

          let payload = G.utils.lock.register.getPayload();
          payload.code = inp_emailCode.value;
          let valid = await checkEmailCode(payload);
          async function checkEmailCode(payload) {
            let result_list = await G.utils.validate.register(payload);
            if (result_list.valid) {
              return true;
            }
            let hide = false;
            for (let { field_name, message, valid } of result_list) {
              if (valid) {
                continue;
              }
              let input = document.querySelector(
                `${G.constant.ID.REGISTER_FORM} input[name=${field_name}]`
              );
              if (field_name !== G.constant.NAME.EMAIL_CODE) {
                hide = true;
              } else {
                input = inp_emailCode;
              }
              G.utils.lock.register.delete(field_name);
              formFeedback.validated(input, false, valid ? "" : message);
            }
            if (hide) {
              G.utils.bs5_modal.hide();
              await G.utils.lock.register.check_submit();
            }
            return false;
          }
          if (!valid) {
            again();
            return;
          }
          let { errno, data, msg } = await G.utils.axios.post(
            API.REGISTER,
            payload
          );
          if (!errno) {
            alert("註冊成功,請嘗試登入");
            location.href = API.REGISTER_SUCCESS;
            return;
          }
          // 驗證碼已過期
          else if (data) {
            inp_emailCode.value = "";
            _lockEmailCode(data, msg);
          }
          // 驗證碼錯誤
          else {
            formFeedback.validated(inp_emailCode, false, msg);
          }
          again();

          function again() {
            turnOff = false;
            $btn_check_emailCode.prop("disabled", true);
            inp_emailCode.addEventListener(
              "input",
              (e) => formFeedback.clear(e.target),
              {
                once: true,
              }
            );
          }
        }

        async function getEmailCode(e, force = false) {
          let turnOff = $btn_emailCode.prop("disabled");
          if (turnOff) {
            return;
          }

          if (!force && G.data.emailCode) {
            let { TTL, REFRESH, expire } = G.data.emailCode;
            if (new Date(expire) - Date.now() > TTL - REFRESH) {
              return;
            }
          }
          let payload = {
            [G.constant.NAME.EMAIL]: G.utils.lock.register.get(
              G.constant.NAME.EMAIL
            ),
          };
          let { data } = await G.utils.axios.post(API.EMAIL_CODE, payload);
          let msg = force
            ? "驗證碼已過期,已重新寄發驗證碼至您的信箱,請再次嘗試"
            : null;
          _lockEmailCode(data, msg);
        }

        function _lockEmailCode(data, msg) {
          if (G.data.emailCode) {
            G.data.emailCode = { ...G.data.emailCode, ...data };
          } else {
            G.data.emailCode = data;
          }
          G.utils.lock.register.delete(G.constant.NAME.EMAIL_CODE);
          $inp_emailCode.prop("disabled", false).val("");
          $btn_emailCode.prop("disabled", true);
          formFeedback.validated(
            inp_emailCode,
            false,
            msg ? msg : "驗證碼已寄至您的信箱"
          );
          inp_emailCode.addEventListener(
            "input",
            () => formFeedback.clear(inp_emailCode),
            {
              once: true,
            }
          );
          inp_emailCode.focus();
          if (G.data.emailCode.timer) {
            clearTimeout(G.data.emailCode.timer);
          }
          reciprocal(data.REFRESH);

          function reciprocal(msec) {
            if (msec <= 0) {
              // 開放重發驗證碼
              $btn_emailCode.text("重新發送驗證碼").prop("disabled", false);
              return;
            }
            $btn_emailCode.text(`重新發送驗證碼(${msec / 1000})`);
            G.data.emailCode.timer = setTimeout(() => {
              reciprocal(msec - 1000);
            }, 1000);
          }
        }
      }
    }

    /* 註冊表單內容表格的 input Event handler */
    async function handle_input_register(e) {
      e.preventDefault();
      let target = e.target;
      let targetVal = target.value;
      const KEY = target.name;
      //  標記，是否呈現標單提醒
      target.validated = true;
      //  校驗
      let payload = { [KEY]: targetVal };
      if (KEY === G.constant.NAME.EMAIL) {
        await checkEmail(payload);
        return;
      } else if (KEY === G.constant.NAME.PASSWORD) {
        payload[G.constant.NAME.PASSWORD_AGAIN] = inp_password_again.value;
      } else {
        payload[G.constant.NAME.PASSWORD] = inp_password.value;
      }
      await checkPWD(payload);
      return;

      async function checkPWD(payload) {
        let result_list = await G.utils.validate.passwordAndAgain(payload);
        let result = result_list.reduce(
          (acc, item) => {
            if (item.valid) {
              acc.valid[item.field_name] = item.value;
            } else {
              acc.invalid.push(item);
            }
            return acc;
          },
          { valid: {}, invalid: [] }
        );
        if (Object.getOwnPropertyNames(result.valid).length) {
          G.utils.lock.register.setKVpairs(result.valid);
        }
        for (let { field_name, valid, message, value } of result.invalid) {
          if (KEY === G.constant.NAME.PASSWORD && KEY === field_name) {
            $inp_password_again.prop("disabled", true);
            inp_password_again.validated = false;
            formFeedback.clear(inp_password_again);
            inp_password_again.value = "";
            G.utils.lock.register.delete(G.constant.NAME.PASSWORD_AGAIN);
          }
          let input = document.querySelector(`[name=${field_name}]`);
          if (input.validated) {
            formFeedback.validated(input, valid, message);
          }
          G.utils.lock.register.delete({ [field_name]: value });
        }
        await G.utils.lock.register.check_submit();
      }
      async function checkEmail(payload) {
        let result_list = await G.utils.validate.isEmailExist(payload);
        let { valid, message } = result_list.find(
          ({ field_name }) => field_name === KEY
        );
        if (valid) {
          G.utils.lock.register.setKVpairs(payload, false);
        } else {
          formFeedback.validated(target, valid, message);
        }
        await G.utils.lock.register.check_submit();
      }
    }

    function needPWD(lock) {
      //  password 與 password_again 為依賴關係，必須做特別處理
      if (
        lock.has(G.constant.NAME.PASSWORD) &&
        !inp_password_again.value.length
      ) {
        $inp_password_again.prop("disabled", false);
        inp_password_again.validated = true;
        formFeedback.validated(inp_password_again, false, "請再次確認密碼");
      }
    }
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
      new Debounce(handle, {
        loading,
        target: input,
        eventType: "input",
      });
    }
  }
}
