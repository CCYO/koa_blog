/* CSS Module ------------------------------------------------------------------------------- */
import "@css/albumList.scss";

/* Config Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";

/* Utils Module ----------------------------------------------------------------------------- */
import G from "../common";
import initPagination from "../component/pagination";
import { render, errorHandle } from "../utils";

/* Runtime ---------------------------------------------------------------------------------- */
try {
  G.page = "albumList";
  G.constant = FRONTEND.ALBUM_LIST;
  G.utils.render = render;
  await G.main(initMain);
} catch (error) {
  errorHandle(error);
}

async function initMain() {
  //  初始化文章列表的分頁功能
  initPagination(G);
}
