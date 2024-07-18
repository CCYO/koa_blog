/* Utils Module ----------------------------------------------------------------------------- */
import { errorHandle } from "@js/utils";
import G from "./G";

let res;
try {
  res = await new G().init();
} catch (error) {
  errorHandle(error);
}

export default res;
