import "@css/utils/form_feedback.scss";

function loading(el_input, msg = "") {
  //  input 讀取中
  $(el_input)
    // .next("div")
    .siblings("div")
    .first()
    .addClass("loading")
    .text(msg || "loading...");
  return undefined;
}
function validated(el_input, valid, msg = "") {
  //  input 有效 || 無效
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
//  清空inp
function clear(el_input) {
  $(el_input)
    .removeClass("is-invalid is-valid")
    // .next("div")
    .siblings("div")
    .first()
    .removeClass("invalid-feedback valid-feedback loading")
    .text("");
  return undefined;
}

//  清空form
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

export default {
  loading,
  validated,
  clear,
  reset,
};
