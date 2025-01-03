/* CSS        ----------------------------------------------------------------------------- */
import "@css/setting.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { _Ajv, Debounce, formFeedback, redir, errorHandle } from "../utils";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* NPM        ----------------------------------------------------------------------------- */
import SparkMD5 from "spark-md5";

/* VAR        ----------------------------------------------------------------------------- */
const API = {
  CHECK_PASSWORD: "/api/user/confirmPassword",
  SETTING: "/api/user",
};
const EVENT_HANDLE_NAME = {
  UNCHECK_ORIGIN_PASSWORD: "uncheck_origin_password",
};

/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  //  離開頁面前，是否發出提醒
  G.data.saveWarn = true;
  G.utils.bs5_modal = undefined;
  const $$ajv = _Ajv(G.utils.axios);
  G.utils.validate = {
    setting: $$ajv._validate.setting,
    avartar: $$ajv._validate.avatar,
    password: $$ajv._validate.password,
  };
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  let el_origin_password = document.querySelector(
    `[name=${G.constant.NAME.ORIGIN_PASSWORD}]`
  );
  let el_password_again = $(`[name=password_again]`).get(0);
  let el_check_origin_password_model = document.querySelector(
    `#${G.constant.ID.MODAL_ORIGIN_PASSWORD}`
  );
  let $avatar = $("#avatar");
  let $avatar_previes = $("#avatar-img");
  let $newPasswordList = $("[name=password], [name=password_again]");
  let $newPassword = $("[name=password]");
  let $checkOrginPassword = $("#checkOrginPassword");
  let jq_settingForm = $("#setting");
  //  初始化 頁面各功能
  G.utils.lock = initLock();
  //  debounce:表單input
  let { debounce: handle_debounce_input } = new Debounce(handle_input, {
    loading: (e) => formFeedback.loading(e.target),
  });

  $newPassword.on(
    `input.${EVENT_HANDLE_NAME.UNCHECK_ORIGIN_PASSWORD}`,
    clear_value
  );
  function clear_value(e) {
    e.target.value = "";
  }
  //  顯示驗證舊密碼modal
  $newPassword.on("focus", createModal);
  //  modal顯示後
  el_check_origin_password_model.addEventListener(
    "shown.bs.modal",
    //  顯示 modal 時，focus input
    () => {
      el_origin_password.focus();
    }
  );
  //  modal隱藏後
  el_check_origin_password_model.addEventListener(
    "hidden.bs.modal",
    //  隱藏 modal 時，focus input
    () => {
      formFeedback.clear(el_origin_password);
      el_origin_password.value = "";
    }
  );
  //  modal發生input
  el_check_origin_password_model.addEventListener("input", (e) => {
    formFeedback.clear(e.target);
  });
  //  modal發生Enter
  el_check_origin_password_model.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.key.toUpperCase() !== "ENTER") {
      return;
    }
    $checkOrginPassword.get(0).click();
  });
  //  新密碼與密碼二次輸入focus
  $newPasswordList.on("focus", handle_showModel);
  //  原密碼驗證
  $checkOrginPassword.on("click", handle_originPassword);
  //  表單input
  jq_settingForm.on("input", handle_debounce_input);
  //  avatar change
  jq_settingForm.on("change", handle_change);
  //  avatar click
  $avatar.on("click", handle_resetAvatar);
  //  發送表單數據
  jq_settingForm.on("submit", handle_submit);
  // 離開頁面，提醒有數據未儲存
  window.addEventListener("beforeunload", (e) => {
    if (G.data.saveWarn && G.utils.lock.check_submit()) {
      e.preventDefault();
      // 過去有些browser必須給予e.returnValue字符值，才能使beforeunload有效運作
      e.returnValue = "mark";
      // 必須具備RV，beforeunload才有效果
      return "1";
    }
  });
  // 取消修改，提醒有數據未儲存
  $("#leave").on("click", cancelModify);

  async function cancelModify() {
    if (confirm("真的要放棄編輯?")) {
      if (G.utils.lock.check_submit() && confirm("放棄編輯前是否儲存?")) {
        await handle_submit();
      }
      G.data.saveWarn = false;
      location.replace("/self");
    }
    return;
  }

  async function handle_submit(e) {
    e && e.preventDefault();
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    let api = API.SETTING;
    let payload = G.utils.lock.getPayload();
    let formData = new FormData();
    if (payload.hasOwnProperty("avatar_hash")) {
      api += `?avatar_hash=${payload.avatar_hash}&avatar_ext=${payload.avatar_ext}`;
      formData.append("avatar", $avatar.prop("files")[0]);
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
      // G.utils.lock.check_submit();
      msg = "資料更新完成";
    }
    alert(msg);
    el_origin_password.value = "";
    formFeedback.reset(jq_settingForm[0]);
    G.utils.lock.clear();
    G.utils.lock.check_submit();
  }
  //  重新選擇要上傳的頭像
  function handle_resetAvatar(e) {
    if (!$avatar.prop("files")[0]) {
      return;
    }
    if (confirm("要重新傳一顆頭嗎?")) {
      //  重設頭像表格
      G.utils.lock.delete("avatar_hash");
      G.utils.lock.delete("avatar_ext");
      $avatar_previes.attr("src", G.data.me.avatar);
      $avatar.val(null);
      G.utils.lock.check_submit();
      formFeedback.clear(e.target);
    } else {
      e.preventDefault();
    }
  }
  //  avatar change
  async function handle_change(e) {
    e.preventDefault();
    if (e.target.name !== "avatar") {
      return;
    }
    if (G.utils.lock.has("avatar_hash") && !confirm("要重新傳一顆頭嗎?")) {
      return;
    }
    let files = $avatar.prop("files");

    let { valid, message, hash, ext } = await _check_avatar(files);
    if (!valid) {
      //  清除input的數據
      $avatar.prop("files", undefined);
      $avatar.val(null);
      //  清除lock的avatar數據
      G.utils.lock.delete("avatar_hash");
      G.utils.lock.delete("avatar_ext");
      //  恢復舊avatar
      $avatar_previes.attr("src", G.data.me.avatar);
      G.utils.lock.check_submit();
      formFeedback.validated(e.target, valid, message);
      //  移除avatar的錯誤提醒
      $("body").one("click", () => formFeedback.clear(e.target));
      return;
    }
    G.utils.lock.setKVpairs({ avatar_hash: hash, avatar_ext: ext });
    formFeedback.validated(e.target, valid);
    //  計算src
    let src = await _src(files[0]);
    $avatar_previes.attr("src", src);
    G.utils.lock.check_submit();
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
  //  驗證原密碼
  async function handle_originPassword(e) {
    e.preventDefault();
    //  檢查登入狀態
    if (!redir.check_login(G)) {
      return;
    }
    const KEY = "origin_password";
    let payload = { [KEY]: el_origin_password.value };
    let result = await G.utils.validate.password(payload);
    let res = result.find(({ field_name }) => field_name === KEY);
    if (!res.valid) {
      G.utils.lock.delete(KEY);
      formFeedback.validated(el_origin_password, false, res.message);
      return;
    }

    let { errno, msg } = await G.utils.axios.post(API.CHECK_PASSWORD, payload);
    if (errno) {
      formFeedback.validated(el_origin_password, false, msg);
      return;
    }
    G.utils.lock.setKVpairs(payload);
    alert("驗證成功，請輸入新密碼");
    G.utils.bs5_modal.hide();
    $newPassword.off(`.${EVENT_HANDLE_NAME.UNCHECK_ORIGIN_PASSWORD}`);
    $newPassword.get(0).focus();
  }
  //  顯示 origin_password 的 model
  function handle_showModel(e) {
    if (!G.utils.bs5_modal) {
      return;
    }
    const KEY = "origin_password";
    e.preventDefault();
    if (G.utils.lock.get(KEY)) {
      ////  已經驗證過 origin_password，不須再顯示 Model
      return false;
    }
    G.utils.bs5_modal.show();
  }
  //  創建驗證舊密碼的modal
  async function createModal(e) {
    if (!G.utils.bs5_modal) {
      //  生成BS5 Modal
      let { default: BS_Modal } = await import(
        /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
      );
      G.utils.bs5_modal = new BS_Modal(el_check_origin_password_model);
      G.utils.bs5_modal.show();
    }
  }
  //  表單input
  async function handle_input(e) {
    let input = e.target;
    const KEY = input.name;
    if (KEY === "avatar") {
      return;
    }
    let value = input.value;
    if (!input.validated) {
      //  el若未被標記過，則標記
      input.validated = true;
    }
    if (KEY === "age") {
      value *= 1;
    }
    let inputEvent_data = { [KEY]: value };
    let result = await _validate(inputEvent_data);

    for (let { field_name, valid, keyword, message, value } of result) {
      let el = document.querySelector(`[name=${field_name}]`);
      if (!el.validated) {
        continue;
      }
      if (valid) {
        if (field_name === "password" && !el_password_again.value) {
          ////  password 與 password_again 為關聯關係，必須做特別處理
          el_password_again.validated = true;
          $(el_password_again).prop("disabled", false);
          formFeedback.validated(el_password_again, false, "必填");
        }
        if (KEY === field_name) {
          G.utils.lock.setKVpairs({ [field_name]: value });
        }
        formFeedback.validated(el, valid);
        G.utils.lock.check_submit();
      } else {
        G.utils.lock.delete(KEY);
        if (field_name === "password" && el_password_again.validated) {
          ////  password 與 password_again 為關聯關係，必須做特別處理
          el_password_again.validated = false;
          $(el_password_again).prop("disabled", true);
          G.utils.lock.delete("password_again");
          el_password_again.value = "";
          formFeedback.clear(el_password_again);
        }
        let txt_count = $(`[name=${field_name}]`).val().length;
        if (txt_count < 1 && field_name !== "password_again") {
          ////  輸入框被刪除到無內容時
          formFeedback.clear(el);
        } else {
          formFeedback.validated(el, valid, message);
        }
      }
      G.utils.lock.check_submit();
    }

    ////  驗證setting
    async function _validate(inputEvent_data) {
      ////  除了當前最新的kv，因為origin_password、password、password_again是關聯關係，需要依情況額外添加需驗證的資料
      let payload = G.utils.lock.getPayload();
      let newData = { ...payload, ...inputEvent_data };
      if (newData.hasOwnProperty("password")) {
        newData.password_again = el_password_again.value;
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
  //  驗證是否可submit
  function initLock() {
    class Payload extends Map {
      #selector_form = "#setting";
      constructor() {
        super();
        this.jq_form = $(this.#selector_form);
        this.jq_submit = this.jq_form.find("[type=submit]").eq(0);
        if (!this.jq_submit.length) {
          throw new Error(`${this.#selector_form}沒有submit元素`);
        }
      }
      setKVpairs(dataObj) {
        //  將kv資料存入
        const entries = Object.entries(dataObj);
        if (entries.length) {
          for (let [key, value] of entries) {
            this.set(key, value);
          }
        }
      }
      getPayload() {
        let res = {};
        for (let [key, value] of [...this]) {
          res[key] = value;
        }
        return res;
      }
      check_submit() {
        let keys = new Set(this.keys());
        let disabled =
          !keys.size || (keys.size === 1 && keys.has("origin_password"));
        if (!disabled) {
          disabled = this.jq_form.find(".is-invalid").length > 0;
        }
        this.jq_submit.prop("disabled", disabled);
        return !disabled;
      }
    }
    return new Payload();
  }
}
