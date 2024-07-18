/* CSS Module ------------------------------------------------------------------------------- */
import "@css/albumList.scss";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { errorHandle, render, initPagination } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
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
