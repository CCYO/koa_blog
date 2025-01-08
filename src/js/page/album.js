/* CSS        ----------------------------------------------------------------------------- */
import "@css/album.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { _Ajv, Debounce, _xss, formFeedback, redir } from "../utils";

/* VAR         ---------------------------------------------------------------------------- */
const API = {
  UPDATE_ALBUM: "/api/album",
};

/* RUNTIME    ----------------------------------------------------------------------------- */
const $$ajv = _Ajv(G.utils.axios);
G.utils.validate = {
  img_alt: $$ajv._validate.img_alt,
};
G.utils._xss = _xss;
await G.initPage(initMain);

async function initMain() {
  const el_modal = $(`#${G.constant.ID.MODAL}`).get(0);
  const jq_modal = $(`#${G.constant.ID.MODAL}`).eq(0);
  const jq_input_alt = jq_modal.find("input").eq(0);
  const el_input_alt = jq_input_alt.get(0);
  const jq_submit = jq_modal.find(".modal-footer > button:last-child").eq(0);
  G.utils.bs5_modal = undefined;
  G.utils.lock = init_lock();
  let { debounce: handle_debounce_input } = new Debounce(handle_input, {
    loading() {
      formFeedback.loading(el_input_alt);
    },
  });
  ////  為修改imgAlt的modal，綁定各種handle
  //  顯示
  $(".card button").on("click", handle_cueModale);
  //  顯示前
  el_modal.addEventListener("show.bs.modal", handle_showModal);
  //  顯示後
  el_modal.addEventListener("shown.bs.modal", handle_shownModal);
  //  圖片名稱input
  el_modal.addEventListener("input", handle_debounce_input);
  //  Enter觸發
  el_modal.addEventListener("keyup", (e) => {
    e.preventDefault();
    if (e.key.toUpperCase() === "ENTER") {
      jq_submit.get(0).click();
    }
  });
  //  點擊更新鈕
  jq_submit.on("click", handle_updateImgAlt);

  //  更新imgAlt
  async function handle_updateImgAlt() {
    if (!redir.check_login(G)) {
      return;
    }
    let payload = G.utils.lock.getPayload();
    await G.utils.axios.patch(API.UPDATE_ALBUM, payload);
    /* 同步頁面數據 */
    let { alt_id, alt } = payload;
    G.data.map_imgs.get(alt_id).alt = alt;
    const jq_card = $(
      `.card[data-${G.constant.DATASET.KEY.ALT_ID}=${alt_id}]`
    ).eq(0);
    jq_card.find(".card-body > p").text(alt);
    jq_card.find(".card-body > p").attr("title", alt);
    jq_card.find("div:first-child").attr("title", alt);
    ////  重置 modal
    jq_input_alt.val();
    jq_modal.data(G.constant.DATASET.KEY.ALT_ID, "");
    formFeedback.clear(el_input_alt);
    G.utils.lock.clear();
    G.utils.bs5_modal.hide();
    alert("更新完成");
  }

  // modal內部修改imgAlt的input handle
  async function handle_input() {
    const KEY = "alt";
    const alt = G.utils._xss.trim(jq_input_alt.val());
    const alt_id = jq_modal.data(G.constant.DATASET.KEY.ALT_ID) * 1;
    const payload = { alt_id, alt, blog_id: G.data.blog.id };

    let result = await G.utils.validate.img_alt({
      _old: { alt: G.data.map_imgs.get(alt_id).alt },
      ...payload,
    });

    if (result.valid) {
      G.utils.lock.setKVpairs(payload);
      formFeedback.validated(el_input_alt, true);
    } else {
      let { message } = result.find(({ field_name }) => field_name === KEY);
      formFeedback.validated(el_input_alt, false, message);
      G.utils.lock.clear();
    }
    G.utils.lock.check_submit();
    return;
  }

  // modal顯示後
  function handle_shownModal(e) {
    //  自動聚焦在input
    el_input_alt.focus();
  }

  //  modal顯示前
  function handle_showModal(e) {
    //  由 bs5_modal.show(relatedTarget) 傳遞而來
    let jq_card = e.relatedTarget;
    let alt_id = jq_card.data(G.constant.DATASET.KEY.ALT_ID) * 1;
    //  取得 modal 物件上標記的值(注意，kv是標記在obj上，而非DOM)
    let alt_id_modal = jq_modal.data(G.constant.DATASET.KEY.ALT_ID) * 1;
    if (alt_id_modal === alt_id) {
      return;
    }
    formFeedback.clear(el_input_alt);
    jq_modal.data(G.constant.DATASET.KEY.ALT_ID, alt_id);
    //  取得img數據
    const { alt } = G.data.map_imgs.get(alt_id);
    //  使 modal 的 input 呈現當前照片名稱
    jq_input_alt.val(alt);
    el_input_alt.placeholder = alt ? alt : "";
  }

  //  顯示modal
  async function handle_cueModale(e) {
    if (!G.utils.bs5_modal) {
      //  生成BS5 Modal
      let { default: BS_Modal } = await import(
        /*webpackChunkName:'bootstrap-modal'*/ "bootstrap/js/dist/modal"
      );
      G.utils.bs5_modal = new BS_Modal(el_modal);
    }
    //  顯示 modal，並將 此照片容器(.card) 作為 e.relatedTarget 傳給 modal show.bs.modal 的 handle
    G.utils.bs5_modal.show($(e.target).parents(".card"));
    //  show BS5 Modal，並將$card作為e.relatedTarget傳給modal
  }

  //  校驗model可否submit
  function init_lock() {
    class Lock extends Map {
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
        jq_submit.prop("disabled", !this.size);
      }
      reset() {
        this.clear();
        formFeedback.clear(el_input_alt);
      }
    }
    return new Lock();
  }
}
