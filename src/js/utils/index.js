/* CLASS      ----------------------------------------------------------------------------- */
import _Ajv from "./_Ajv";
import Debounce from "./debounce";

/* OBJ        ----------------------------------------------------------------------------- */
import _xss from "./_xss";
import formFeedback from "./formFeedback";
import redir from "./redir";

/* FUC        ----------------------------------------------------------------------------- */
import errorHandle from "./errorHandle";
const async_render = async () => {
  let module = await import(
    process.env.isProd ? "./render/index" : "./render/dev_index"
  );
  return module.default;
};

/* EXPORT     ----------------------------------------------------------------------------- */
export { _Ajv, Debounce, async_render, _xss, formFeedback, redir, errorHandle };
