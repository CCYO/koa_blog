/* CLASS      ----------------------------------------------------------------------------- */
import _Ajv from "./_ajv";
import Debounce from "./debounce";

/* OBJ        ----------------------------------------------------------------------------- */
// import render from "./render";
import _xss from "./_xss";
import formFeedback from "./formFeedback";
import redir from "./redir";
let async_render;
if (process.env.isProd) {
  async_render = async () => {
    let module = await import("./render/index");
    return module.default;
  };
} else {
  async_render = async () => {
    let module = await import("./render/dev_index");
    return module.default;
  };
}
/* FUC        ----------------------------------------------------------------------------- */
import errorHandle from "./errorHandle";

/* EXPORT     ----------------------------------------------------------------------------- */
export { _Ajv, Debounce, async_render, _xss, formFeedback, redir, errorHandle };
