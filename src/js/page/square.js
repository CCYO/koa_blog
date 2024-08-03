/* CSS Module ------------------------------------------------------------------------------- */
import "@css/square.scss";
/* Const Module ----------------------------------------------------------------------------- */
import FRONTEND from "@config/frontend_esm";
/* Utils Module ----------------------------------------------------------------------------- */
import G from "../wedgets";
import { errorHandle, render, initPagination } from "../utils";
/* runtime ---------------------------------------------------------------------------------- */
try {
  G.page = "square";
  G.constant = FRONTEND.SQUARE;
  G.utils.render = render;
  await G.main(initMain);
} catch (error) {
  errorHandle(error);
}

function initMain() {
  //  初始化文章列表的分頁功能
  initPagination(G);
}
