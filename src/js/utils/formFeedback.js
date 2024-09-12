/* CSS        ----------------------------------------------------------------------------- */
import "@css/utils/form_feedback.scss";

/* EXPORT     ----------------------------------------------------------------------------- */
export default {
  loading,
  validated,
  clear,
  reset,
};

//  input校驗中
function loading(el_input, msg = "") {
  $(el_input)
    // .next("div")
    .siblings("div")
    .first()
    .addClass("loading")
    .text(msg || "loading...");
  return undefined;
}

//  input的校驗結果
function validated(el_input, valid, msg = "") {
  $(el_input)
    .removeClass(valid ? "is-invalid" : "is-valid")
    .addClass(valid ? "is-valid" : "is-invalid")
    // .next("div")
    .siblings("div")
    .first()
    .removeClass("loading " + (valid ? "invalid-feedback" : "valid-feedback"))
    .addClass(valid ? "valid-feedback" : "invalid-feedback")
    .text(msg);
  return valid;
}

//  清空指定inp
function clear(el_input) {
  $(el_input)
    .removeClass("is-invalid is-valid")
    .siblings("div")
    .first()
    .removeClass("invalid-feedback valid-feedback loading")
    .text("");
  return undefined;
}

//  清空整個form
function reset(el_form) {
  el_form.reset();
  for (let inp of el_form) {
    if (inp.type === "submit" || inp.tagName !== "INPUT") {
      continue;
    }
    if (inp.type === "file") {
      $(inp).prop("files", undefined);
      $(inp).prop("value", "");
    }
    clear(inp);
  }
  return undefined;
}
