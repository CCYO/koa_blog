/* CSS        ----------------------------------------------------------------------------- */
import "@css/albumList.scss";

/* COMMON     ----------------------------------------------------------------------------- */
import G from "../common";

/* COMPONENT   ---------------------------------------------------------------------------- */
import initPagination from "../component/pagination";

/* RUNTIME    ----------------------------------------------------------------------------- */
await G.initPage(initMain);

async function initMain() {
  //  初始化文章列表的分頁功能
  initPagination(G);
}
