import G from "./G";

/* Utils Module ----------------------------------------------------------------------------- */
import { errorHandle } from "../utils";

/* Runtime ---------------------------------------------------------------------------------- */
let res;
try {
  res = await new G().init();
} catch (error) {
  errorHandle(error);
}

export default res;
