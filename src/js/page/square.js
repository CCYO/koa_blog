/* CSS        ----------------------------------------------------------------------------- */
import "@css/square.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* UTILS      ----------------------------------------------------------------------------- */
import { errorHandle } from "../utils";

/* COMPONENT   ---------------------------------------------------------------------------- */
import initPagination from "../component/pagination";

/* RUNTIME    ----------------------------------------------------------------------------- */
try {
  await G.initPage(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  //  初始化文章列表
  initPagination(G);
}
