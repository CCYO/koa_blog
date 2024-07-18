/* CSS Module ------------------------------------------------------------------------------- */
import "@css/album.scss";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { Debounce, _Ajv, errorHandle, _xss, formFeedback } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  const $$ajv = new _Ajv(G.utils.axios);
  G.page = "album";
  G.constant = FRONTEND.ALBUM;
  G.utils.validate = {
    img_alt: $$ajv._validate.img_alt,
  };
  await G.main(initMain);
} catch (e) {
  errorHandle(e);
}

async function initMain() {
  //  生成BS5 Modal
  let bs5_modal = new bootstrap.Modal(`#${G.constant.ID.MODAL}`);
  const el_modal = $(`#${G.constant.ID.MODAL}`).get(0);
  const jq_modal = $(`#${G.constant.ID.MODAL}`).eq(0);
  const jq_input_alt = jq_modal.find("input").eq(0);
  const el_input_alt = jq_input_alt.get(0);
  const jq_submit = jq_modal.find(".modal-footer > button:last-child").eq(0);

  G.utils.lock = initLock();
  let { debounce: handle_debounce_input } = new Debounce(handle_input, {
    loading() {
      formFeedback.loading(el_input_alt);
    },
  });
  //  校驗blog數據，且決定submit可否點擊

  $(".card button").on("click", handle_cueModale);
  //  modal 顯示前的 handle
  el_modal.addEventListener("show.bs.modal", handle_showModal);
  //  modal 顯示時的 handle
  el_modal.addEventListener("shown.bs.modal", handle_shownModal);
  el_modal.addEventListener("input", handle_debounce_input);
  /* 點擊更新鈕的handle */
  jq_submit.on("click", handle_updateImgAlt);

  //  handle 更新 imgAlt
  async function handle_updateImgAlt() {
    let payload = G.utils.lock.getPayload();
    await G.utils.axios.patch("/api/album", payload);
    /* 同步頁面數據 */
    let { alt_id, alt } = payload;
    G.data.map_imgs.get(alt_id).alt = alt;
    const jq_card = $(
      `.card[data-${G.constant.DATASET.KEY.ALT_ID}=${alt_id}]`
    ).eq(0);
    jq_card.find(".card-text").text(alt);
    jq_card.find("img").attr("alt", alt);
    ////  重置 modal
    jq_input_alt.val();
    jq_modal.data(G.constant.DATASET.KEY.ALT_ID, "");
    formFeedback.clear(el_input_alt);
    G.utils.lock.clear();
    bs5_modal.hide();
    alert("更新完成");
  }
  async function handle_input() {
    const KEY = "alt";
    const alt = _xss.trim(jq_input_alt.val());
    const alt_id = jq_modal.data(G.constant.DATASET.KEY.ALT_ID) * 1;
    const payload = { alt_id, alt, blog_id: G.data.blog.id };

    let result = await validate(payload);

    if (!result.invalid) {
      G.utils.lock.setKVpairs(payload);
      formFeedback.validated(el_input_alt, true);
      // G.utils.lock.check_submit();
    } else {
      let { keyword, message } = result.find(
        ({ field_name }) => field_name === KEY
      );
      if (keyword.length !== 1) {
        throw new Error(JSON.stringify(result));
      } else if (keyword[0] !== "_notRepeat") {
        formFeedback.validated(el_input_alt, false, message);
        // G.utils.lock.reset();
        // G.utils.lock.check_submit();
      } else {
        formFeedback.clear(el_input_alt);

        // G.utils.lock.check_submit();
      }
      G.utils.lock.clear();
      // await lock.validate();
    }
    G.utils.lock.check_submit();
    return;
  }
  /* modal 顯示時的 handle */
  function handle_shownModal(e) {
    //  自動聚焦在input
    el_input_alt.focus();
  }
  /* modal 顯示前的 handle */
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
  }
  //  顯示 modal 的 handle
  function handle_cueModale(e) {
    //  顯示 modal，並將 此照片容器(.card) 作為 e.relatedTarget 傳給 modal show.bs.modal 的 handle
    bs5_modal.show($(e.target).parents(".card"));
    //  show BS5 Modal，並將$card作為e.relatedTarget傳給modal
  }

  async function validate(newData) {
    let result = await G.utils.validate.img_alt({
      _old: { alt: G.data.map_imgs.get(newData.alt_id).alt },
      ...newData,
    });
    //  過濾掉 _old
    result = result.filter(({ field_name }) => field_name !== "_old");
    result.invalid = result.some(({ valid }) => !valid);
    return result;
  }

  function initLock() {
    return new (class lock extends Map {
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
    })();
  }
}
