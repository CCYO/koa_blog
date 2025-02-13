/* CSS        ----------------------------------------------------------------------------- */
import "@css/setting.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { _Ajv, init_lock, Debounce, formFeedback, redir } from "../utils";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* NPM        ----------------------------------------------------------------------------- */
import SparkMD5 from "spark-md5";

/* VAR        ----------------------------------------------------------------------------- */
const API = {
  EMAIL_CODE: "/api/user/registerCode",
  CHECK_EMAIL_CODE: "/api/user/confirmEmailCode",
  CHECK_PASSWORD: "/api/user/confirmPassword",
  SETTING: "/api/user",
};
const EVENT_HANDLE_NAME = {
  UNCHECK_ORIGIN_PASSWORD: "uncheck_origin_password",
  UNCHECK_ORIGIN_EMAIL: "uncheck_origin_email",
};

/* RUNTIME    ----------------------------------------------------------------------------- */
//  離開頁面前，是否發出提醒
G.data.saveWarn = true;
G.utils.bs5_modal = {};
G.data.emailCode = undefined;
const ajv = _Ajv(G.utils.axios);
G.utils.validate = {
  setting: ajv._validate.setting,
  password: ajv._validate.password,
  passwordAndAgain: ajv._validate.password_again,
  emailCode: ajv._validate.emailCode,
};
await G.initPage(initMain);

async function initMain() {
  let inp_email = document.querySelector(`[name=${G.constant.NAME.EMAIL}]`);
  let $inp_email = $(inp_email);
  let $btn_showModal_emailCode = $(`#${G.constant.ID.SHOW_MODAL_EMAIL_CODE}`);
  let modal_check_emailCode = document.querySelector(
    `#${G.constant.ID.MODAL_REGISTER_CODE}`
  );
  let inp_emailCode = document.querySelector(
    `#${G.constant.ID.MODAL_REGISTER_CODE} input`
  );
  let $inp_emailCode = $(inp_emailCode);
  let $btn_check_emailCode = $(`#${G.constant.ID.CHECK_REGISTER_CODE}`);
  let inp_origin_password = document.querySelector(
    `[name=${G.constant.NAME.ORIGIN_PASSWORD}]`
  );
  let modal_check_origin_password = document.querySelector(
    `#${G.constant.ID.MODAL_ORIGIN_PASSWORD}`
  );
  let inp_newPassword = document.querySelector(
    `[name=${G.constant.NAME.NEW_PASSWORD}]`
  );
  let $inp_newPassword = $(inp_newPassword);
  let inp_password_again = document.querySelector(
    `[name=${G.constant.NAME.PASSWORD_AGAIN}]`
  );
  let $inp_password_again = $(inp_password_again);
  let btn_check_orgin_password = document.querySelector(
    `#${G.constant.ID.CHECK_ORIGIN_PASSWORD}`
  );
  let inp_avatar = document.querySelector("input[type=file]");
  let $inp_avatar = $(inp_avatar);
  let $img_avatar = $(`#${G.constant.ID.IMG_AVATAR}`);
  let jq_settingForm = $(`#${G.constant.ID.FORM}`);

  function check_submit(lock) {
    let keys = new Set(lock.keys());
    let disabled =
      !keys.size ||
      (keys.size === 1 && (keys.has("origin_password") || keys.has("email")));
    return disabled;
  }
  //  初始化 頁面各功能
  G.utils.lock = init_lock({
    selector: `#${G.constant.ID.FORM}`,
    other_check_submit: [check_submit],
  });
  //  debounce:表單input
  new Debounce(handle_input, {
    target: jq_settingForm.get(0),
    eventType: "input",
    loading: (e) => formFeedback.loading(e.target),
  });

  //  發送表單數據
  jq_settingForm.on("submit", handle_submit);

  // 取消修改，提醒有數據未儲存
  $(`#${G.constant.ID.CANCEL}`).on("click", cancelModify);

  // 離開頁面，提醒有數據未儲存
  window.addEventListener("beforeunload", leavePage);

  initEmail();
  initPwd();
  initAvatar();

  function initAvatar() {
    //  avatar change
    jq_settingForm.on("change", handle_change);
    //  avatar click
    $inp_avatar.on("click", handle_resetAvatar);

    //  重新選擇要上傳的頭像
    async function handle_resetAvatar(e) {
      if (!$inp_avatar.prop("files")[0]) {
        return;
      }
      if (confirm("要重新傳一顆頭嗎?")) {
        //  重設頭像表格
        G.utils.lock.delete("avatar_hash");
        G.utils.lock.delete("avatar_ext");
        $img_avatar.attr("src", G.data.me.avatar);
        $inp_avatar.val(null);
        await G.utils.lock.check_submit();
        formFeedback.clear(e.target);
      } else {
        e.preventDefault();
      }
    }
    //  avatar change
    async function handle_change(e) {
      e.preventDefault();
      if (e.target !== inp_avatar) {
        return;
      }
      if (G.utils.lock.has("avatar_hash") && !confirm("要重新傳一顆頭嗎?")) {
        return;
      }
      let files = $inp_avatar.prop("files");

      let { valid, message, hash, ext } = await _check_avatar(files);
      if (!valid) {
        //  清除input的數據
        $inp_avatar.prop("files", undefined);
        $inp_avatar.val(null);
        //  清除lock的avatar數據
        G.utils.lock.delete("avatar_hash");
        G.utils.lock.delete("avatar_ext");
        //  恢復舊avatar
        $img_avatar.attr("src", G.data.me.avatar);
        formFeedback.validated(e.target, valid, message);
        await G.utils.lock.check_submit();
        //  移除avatar的錯誤提醒
        $("body").one("click", () => formFeedback.clear(e.target));
        return;
      }
      //  計算src
      let src = await _src(files[0]);
      $img_avatar.attr("src", src);
      await G.utils.lock.setKVpairs({ avatar_hash: hash, avatar_ext: ext });
      await formFeedback.validated(e.target, valid);
      await G.utils.lock.check_submit();
      async function _check_avatar(files) {
        let ext = undefined;
        let hash = undefined;
        let valid = false;
        //  確認files數量
        if (files.length > 1) {
          //  移除files
          //  發出警告
          return {
            valid,
            message: "僅限上傳一張",
          };
        }
        let file = files[0];
        //  file.size 單位byte
        if (file.size > COMMON.AJV.SETTING.AVATAR.MAX_SIZE) {
          //  發出警告
          return {
            valid,
            message: `大頭貼容量限${
              COMMON.AJV.SETTING.AVATAR.MAX_SIZE / 1024 / 1024
            }Mb`,
          };
        }
        let pattern = `\\.(?<ext>${COMMON.AJV.IMG.EXT.map(
          (ext) => `(${ext})`
        ).join("|")})$`;
        let reg = new RegExp(pattern, "i");
        //  確認副檔名
        let regRes = reg.exec(file.name);
        ext = regRes ? regRes.groups.ext.toUpperCase() : undefined;
        if (!ext) {
          return {
            valid,
            message: `限${COMMON.AJV.IMG_EXT.join("或")}格式`,
          };
        }
        //  是否與當前 avatar 相同
        hash = await _hash(file);
        if (G.data.me.avatar_hash === hash) {
          return {
            valid,
            message: `與原頭像相同`,
          };
        }
        valid = true;

        return { valid, ext, hash };
      }
      //  計算預覽圖
      async function _src(file) {
        return await new Promise((resolve, reject) => {
          let fr = new FileReader();
          fr.addEventListener("load", (evt) => {
            if (fr.readyState === FileReader.DONE) {
              let base64Url = fr.result;
              resolve(base64Url);
            }
          });
          fr.addEventListener("error", (error) => {
            reject(error);
          });
          fr.readAsDataURL(file);
        });
      }
      //  計算 arrayBuffer
      async function _hash(file) {
        return await new Promise((resolve, reject) => {
          let fr = new FileReader();
          fr.addEventListener("load", (evt) => {
            if (fr.readyState === FileReader.DONE) {
              let arrayBuffer = fr.result;
              let hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
              resolve(hash);
            }
          });
          fr.addEventListener("error", (error) => {
            reject(error);
          });
          fr.readAsArrayBuffer(file);
        });
      }
    }
  }
  // 與password有關的功能
  function initPwd() {
    G.utils.lock.after_setKVpairs.push(needPasswordAgain);
    async function needPasswordAgain(lock, data) {
      //  password 與 password_again 為依賴關係，必須做特別處理
      if (!lock.has(G.constant.NAME.ORIGIN_PASSWORD)) {
        return;
      }
      if (!lock.has(G.constant.NAME.NEW_PASSWORD)) {
        inp_newPassword.validated = true;
        formFeedback.validated(inp_newPassword, false, "請填入新密碼");

        // if (
        //   lock.has(G.constant.NAME.NEW_PASSWORD) &&
        //   !inp_password_again.value.length
        // ) {
        //   inp_password_again.validated = true;
        //   $inp_password_again.prop("disabled", false);
        //   formFeedback.validated(inp_password_again, false, "必填");
        // }

        // if (
        //   lock.has(G.constant.NAME.NEW_PASSWORD)
        // ) {
      }
      if (!Object.keys(data).includes(G.constant.NAME.NEW_PASSWORD)) {
        return;
      }
      inp_password_again.validated = true;
      $inp_password_again.prop("disabled", false);
      let result_list = await G.utils.validate.passwordAndAgain(
        G.utils.lock.getPayload()
      );
      let { field_name, valid, message, value } = result_list.find(
        ({ field_name }) => field_name === G.constant.NAME.PASSWORD_AGAIN
      );
      if (valid) {
        await G.utils.lock.setKVpairs({ [field_name]: value });
      } else if (!value) {
        message = "請再次確認密碼是否相同";
      }
      G.utils.lock.delete(field_name);
      formFeedback.validated(inp_password_again, valid, valid ? "" : message);
      await G.utils.lock.check_submit();
      // inp_password_again.validated = true;
      // $inp_password_again.prop("disabled", false);
      // formFeedback.validated(inp_password_again, false, "必填");
    }
    $inp_newPassword.on(
      `input.${EVENT_HANDLE_NAME.UNCHECK_ORIGIN_PASSWORD}`,
      clear_value
    );
    function clear_value(e) {
      e.target.value = "";
    }
    //  顯示驗證舊密碼modal
    $inp_newPassword.on("focus", createPwdModal);
    //  modal顯示後
    modal_check_origin_password.addEventListener(
      "shown.bs.modal",
      //  顯示 modal 時，focus input
      () => {
        inp_origin_password.focus();
      }
    );
    //  modal隱藏後
    modal_check_origin_password.addEventListener(
      "hidden.bs.modal",
      //  隱藏 modal 時，focus input
      () => {
        formFeedback.clear(inp_origin_password);
        inp_origin_password.value = "";
      }
    );
    //  modal發生input
    modal_check_origin_password.addEventListener("input", (e) => {
      formFeedback.clear(e.target);
    });
    //  modal發生Enter
    modal_check_origin_password.addEventListener("keyup", (e) => {
      e.preventDefault();
      if (e.key.toUpperCase() !== "ENTER") {
        return;
      }
      btn_check_orgin_password.click();
    });
    //  新密碼與密碼二次輸入focus
    inp_newPassword.addEventListener("focus", handle_showModal);
    //  原密碼驗證
    btn_check_orgin_password.addEventListener("click", handle_originPassword);

    //  驗證原密碼
    async function handle_originPassword(e) {
      e.preventDefault();
      //  檢查登入狀態
      if (!redir.check_login(G)) {
        return;
      }
      const KEY = G.constant.NAME.ORIGIN_PASSWORD;
      let payload = { [KEY]: inp_origin_password.value };
      let result = await G.utils.validate.password(payload);
      let res = result.find(({ field_name }) => field_name === KEY);
      if (!res.valid) {
        G.utils.lock.delete(KEY);
        formFeedback.validated(inp_origin_password, false, res.message);
        return;
      }

      let { errno, msg } = await G.utils.axios.post(
        API.CHECK_PASSWORD,
        payload
      );
      if (errno) {
        formFeedback.validated(inp_origin_password, false, msg);
        return;
      }
      await G.utils.lock.setKVpairs(payload);
      alert("驗證成功，請輸入新密碼");
      G.utils.bs5_modal.pwd.hide();
      $inp_newPassword.off(`.${EVENT_HANDLE_NAME.UNCHECK_ORIGIN_PASSWORD}`);
      inp_newPassword.focus();
    }
    //  顯示 origin_password 的 modal
    function handle_showModal(e) {
      if (!G.utils.bs5_modal?.pwd) {
        return;
      }
      e.preventDefault();
      if (G.utils.lock.has(G.constant.NAME.ORIGIN_PASSWORD)) {
        ////  已經驗證過 origin_password，不須再顯示 Modal
        return false;
      }
      G.utils.bs5_modal.pwd.show();
    }
    //  創建驗證舊密碼的modal
    async function createPwdModal(e) {
      if (!G.utils.bs5_modal?.pwd) {
        //  生成BS5 Modal
        let { default: BS_Modal } = await import(
          /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
        );
        G.utils.bs5_modal.pwd = new BS_Modal(modal_check_origin_password);
        G.utils.bs5_modal.pwd.show();
      }
    }
  }
  // 與email有關的功能
  function initEmail() {
    let $btn_emailCode = $(`#${G.constant.ID.MAIL_REGISTER_CODE}`);

    G.utils.lock.after_setKVpairs.push(needEmailCode);
    G.utils.lock.after_check_submit.push(disable_show_modal);
    $btn_showModal_emailCode.on("click", createEmailModal);
    return;

    //  創建驗證舊信箱的modal
    async function createEmailModal(e) {
      if (G.utils.bs5_modal?.email) {
        G.utils.bs5_modal.email.show();
        return;
      }
      let first_getEmail = true;
      G.utils.lock.before_setKVpairs.push(resetEmailAgain);
      function resetEmailAgain(lock, dataObj) {
        if (
          dataObj.hasOwnProperty(G.constant.NAME.EMAIL) &&
          lock.has(G.constant.NAME.EMAIL_CODE)
        ) {
          if (confirm("若確認要重新設置信箱，等等請記得再做一次信箱驗證")) {
            lock.delete(G.constant.NAME.EMAIL_CODE);
          } else {
            $inp_email.val(lock.get(G.constant.NAME.EMAIL));
          }
        }
      }
      //  生成BS5 Modal
      let { default: BS_Modal } = await import(
        /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
      );
      G.utils.bs5_modal.email = new BS_Modal(modal_check_emailCode);
      $btn_emailCode.on("click", getEmailCode);
      $btn_check_emailCode.on("click", checkEmailCode);

      async function checkEmailCode(e) {
        let turnOff = $btn_check_emailCode.prop("disabled");
        if (turnOff) {
          return;
        }
        formFeedback.loading(inp_emailCode);
        $btn_check_emailCode.prop("disabled", (turnOff = true));
        if (Date.now() >= G.data.emailCode.expire) {
          await getEmailCode(null, true);
          return;
        }
        let payload = { [G.constant.NAME.EMAIL_CODE]: inp_emailCode.value };
        let result_list = await G.utils.validate.emailCode(payload);
        if (!result_list.valid) {
          for (let { field_name, valid, message } of result_list) {
            if (valid) {
              continue;
            }
            let input = document.querySelector(`input[name=${field_name}]`);
            if (!input) {
              continue;
            }
            // G.utils.lock.login.delete(field_name);
            formFeedback.validated(input, valid, message);
          }

          $btn_check_emailCode.prop("disabled", true);
          inp_emailCode.addEventListener(
            "input",
            (e) => formFeedback.clear(e.target),
            {
              once: true,
            }
          );
          turnOff = false;
          return;
        }
        payload[G.constant.NAME.EMAIL] = G.utils.lock.get(
          G.constant.NAME.EMAIL
        );
        let { errno, data, msg } = await G.utils.axios.post(
          API.CHECK_EMAIL_CODE,
          payload
        );
        if (!errno) {
          // 清除「重新寄送驗證碼」的倒數
          if (G.data.emailCode.timer) {
            clearTimeout(G.data.emailCode.timer);
            delete G.data.emailCode.timer;
          }
          // 存入數據
          // G.utils.lock.setKVpairs 會操作 formFeedback.validate(key, true),
          // 所以G.utils.lock.setKVpairs要在formFeedback.clear(inp_emailCode)之前
          await G.utils.lock.setKVpairs(payload);
          // 清空表格與提醒
          inp_emailCode.value = "";
          formFeedback.clear(inp_emailCode);
          // 可獲取驗證碼
          $btn_emailCode.text("取得驗證碼").prop("disabled", false);
          // 禁止認證驗證碼
          $btn_check_emailCode.prop("disabled", true);
          // 禁止寫入驗證碼
          $inp_emailCode.prop("disabled", true);
          // 信箱表格校驗正確
          formFeedback.validated($inp_email[0], true);
          // 隱藏modal
          G.utils.bs5_modal.email.hide();
          // 禁按驗證信箱紐
          $btn_showModal_emailCode.prop("disabled", true);
          await G.utils.lock.check_submit();
          alert("驗證成功");
          return;
        }
        // 驗證碼已過期
        else if (data) {
          inp_emailCode.value = "";
          _lockRegisterCode(data, msg);
        }
        // 驗證碼錯誤
        else {
          formFeedback.validated(inp_emailCode, false, msg);
        }
        $btn_check_emailCode.prop("disabled", true);
        turnOff = false;
        inp_emailCode.addEventListener(
          "input",
          (e) => formFeedback.clear(e.target),
          {
            once: true,
          }
        );
      }
      async function getEmailCode(e, force = false) {
        if (!force && G.data.emailCode) {
          let { TTL, REFRESH, expire } = G.data.emailCode;
          if (new Date(expire) - Date.now() > TTL - REFRESH) {
            return;
          }
        }
        let email = G.utils.lock.get(G.constant.NAME.EMAIL);
        let { data } = await G.utils.axios.post(API.EMAIL_CODE, { email });
        let msg = force
          ? "驗證碼已過期,已重新寄發驗證碼至您的信箱,請再次嘗試"
          : null;
        _lockRegisterCode(data, msg);
      }
      $inp_emailCode.on("keydown", validEmailCode1);
      $inp_emailCode.on("input", validEmailCode2);

      async function validEmailCode2(e) {
        let target = e.target;
        let payload = { [G.constant.NAME.EMAIL_CODE]: target.value };
        let [{ valid, message }] = await G.utils.validate.emailCode(payload);
        if (valid) {
          formFeedback.clear(target);
        } else {
          formFeedback.validated(target, valid, message);
        }
        $btn_check_emailCode.prop("disabled", !valid);
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

      function _lockRegisterCode(data, msg) {
        if (G.data.emailCode) {
          G.data.emailCode = { ...G.data.emailCode, ...data };
        } else {
          G.data.emailCode = data;
        }

        $inp_emailCode.prop("disabled", false).val("");
        $btn_emailCode.prop("disabled", true);
        formFeedback.validated(
          inp_emailCode,
          false,
          msg ? msg : "驗證碼已寄至您的信箱"
        );
        if (!first_getEmail) {
          inp_emailCode.addEventListener(
            "input",
            (e) => formFeedback.clear(e.target),
            {
              once: true,
            }
          );
        } else {
          first_getEmail = false;
        }
        inp_emailCode.focus();
        if (G.data.emailCode.timer) {
          clearTimeout(G.data.emailCode.timer);
          delete G.data.emailCode.timer;
        }
        reciprocal(data.REFRESH);

        function reciprocal(msec) {
          if (msec <= 0) {
            delete G.data.emailCode.timer;
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
    function disable_show_modal(lock) {
      $btn_showModal_emailCode.prop(
        "disabled",
        !lock.has(G.constant.NAME.EMAIL)
      );
    }
    function needEmailCode(lock) {
      if (
        lock.has(G.constant.NAME.EMAIL) &&
        !lock.has(G.constant.NAME.EMAIL_CODE)
      ) {
        $btn_showModal_emailCode.prop("disabled", false);
        formFeedback.validated(inp_email, false, "請進行信箱驗證");
      }
    }
  }
  // 離開頁面前的提醒功能
  async function leavePage(e) {
    if (G.data.saveWarn && (await G.utils.lock.check_submit())) {
      e.preventDefault();
      // 過去有些browser必須給予e.returnValue字符值，才能使beforeunload有效運作
      e.returnValue = "mark";
      // 必須具備RV，beforeunload才有效果
      return "1";
    }
  }
  // 取消更改的提醒
  async function cancelModify() {
    if (confirm("真的要放棄編輯?")) {
      if (
        (await G.utils.lock.check_submit()) &&
        confirm("放棄編輯前是否儲存?")
      ) {
        await handle_submit();
      }
      G.data.saveWarn = false;
      location.replace("/self");
    }
    return;
  }
  // 送出表單資料
  async function handle_submit(e) {
    e && e.preventDefault();
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    // 若需要修改信箱，要確認驗證碼是否超時
    if (
      G.utils.lock.has(G.constant.NAME.EMAIL) &&
      G.utils.lock.has(G.constant.NAME.EMAIL_CODE) &&
      Date.now() > G.data.emailCode.expire
    ) {
      // 清除驗證碼資料
      G.data.emailCode = undefined;
      G.utils.lock.delete("code");
      $btn_showModal_emailCode.prop("disabled", false);
      $inp_emailCode.prop("true");
      formFeedback.validated(inp_email, false, "驗證碼過期,請重新驗證");
      $btn_showModal_emailCode[0].addEventListener(
        "click",
        () => {
          formFeedback.clear(inp_email, inp_email.value);
        },
        { once: true }
      );
      await G.utils.lock.check_submit();
      return;
    }
    let api = API.SETTING;
    let payload = G.utils.lock.getPayload();
    let formData = new FormData();
    if (payload.hasOwnProperty("avatar_hash")) {
      api += `?avatar_hash=${payload.avatar_hash}&avatar_ext=${payload.avatar_ext}`;
      formData.append("avatar", $inp_avatar.prop("files")[0]);
      delete payload.avatar_hash;
      delete payload.avatar_ext;
    }
    if (
      payload.hasOwnProperty("origin_password") &&
      !payload.hasOwnProperty("password")
    ) {
      delete payload.origin_password;
    }
    for (let prop in payload) {
      //  整理要更新的請求數據
      let data = payload[prop];
      formData.append(prop, data);
    }
    let { errno, data, msg } = await G.utils.axios.patch(api, formData);
    if (!errno) {
      for (let prop in data) {
        G.data.me[prop] = data[prop];
        let el_input = document.querySelector(`[name=${prop}]`);
        if (!el_input || !data[prop]) {
          continue;
        }
        el_input.validated = false;
        el_input.placeholder = data[prop];
      }
      msg = "資料更新完成";
    }
    alert(msg);
    inp_origin_password.value = "";
    formFeedback.reset(jq_settingForm[0]);
    G.utils.lock.clear();
    await G.utils.lock.check_submit();
  }

  //  表單input handle
  async function handle_input(e) {
    let input = e.target;
    const KEY = input.name;
    if (input === inp_avatar) {
      return;
    }
    let inputVal = input.value;
    if (!input.validated) {
      //  el若未被標記過，則標記
      input.validated = true;
    }
    if (input.type === "number") {
      inputVal *= 1;
    }
    let result_list = await _validate({ [KEY]: inputVal });
    let { field_name, valid, keyword, message, value } = result_list.find(
      ({ field_name }) => field_name === KEY
    );
    if (valid) {
      await G.utils.lock.setKVpairs({ [field_name]: value });
      await G.utils.lock.check_submit();
      return;
    }
    // 校驗失敗
    G.utils.lock.delete(KEY);
    //  password 與 password_again 為依賴關係，必須做特別處理
    if (input === inp_newPassword && inp_password_again.validated) {
      // 清空提醒
      formFeedback.clear(inp_password_again);
      // 清空表格
      inp_password_again.value = "";
      // 取消提醒標記
      inp_password_again.validated = false;
      // 不可寫入
      $inp_password_again.prop("disabled", true);
      // 刪除資料
      G.utils.lock.delete("password_again");
    }
    // newPassword與password_again可填寫的狀況下，必須有值
    if (
      input.value.length > 0 ||
      input === inp_newPassword ||
      input === inp_password_again
    ) {
      formFeedback.validated(input, valid, message);
    }
    //  除了有依賴關係的資料外，setting表單的資料都是非必填的
    else {
      formFeedback.clear(input);
    }
    await G.utils.lock.check_submit();
    //  驗證setting
    async function _validate(inputEvent_data) {
      //  除了當前最新的kv，因為origin_password、password、password_again是依賴關係，需要依情況額外添加需驗證的資料
      let payload = G.utils.lock.getPayload();
      let newData = { ...payload, ...inputEvent_data };
      if (newData.hasOwnProperty("password")) {
        newData.password_again = inp_password_again.value;
      }
      newData._old = G.data.me;
      if (newData.hasOwnProperty("origin_password")) {
        newData._old.password = newData.origin_password;
      }

      let result = await G.utils.validate.setting(newData);
      return result.filter(({ field_name }) => {
        let exclude = ["_old", "avatar_hash", "avatar_ext"];
        return !exclude.some((item) => item === field_name);
      });
    }
  }
}
