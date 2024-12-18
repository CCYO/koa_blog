/**
 * @description 文章列表的分頁功能
 */

/* CSS        ----------------------------------------------------------------------------- */
import "@css/component/pagination";

/* UTILS      ----------------------------------------------------------------------------- */
import { render } from "../utils";

/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* EXPORT     ----------------------------------------------------------------------------- */
export default function (G) {
  const pageConst = G.constant;
  pageConst.PAGINATION = G.data.pagination;
  const template_blogList = render[G.data.page].blogList;
  let author_id = undefined;
  let pageData = undefined;
  let API_PAGINATION;
  switch (G.data.page) {
    case COMMON.PAGE.USER.PAGE_NAME:
      author_id = G.data.currentUser.id;
      pageData = G.data.blogs;
      API_PAGINATION = "/api/blog/list";
      break;
    case COMMON.PAGE.ALBUM_LIST.PAGE_NAME:
      author_id = G.data.me.id;
      pageData = G.data.album;
      API_PAGINATION = "/api/album/list";
      break;
    case COMMON.PAGE.SQUARE.PAGE_NAME:
      pageData = G.data.blog;
      API_PAGINATION = "/api/square/list";
      break;
  }
  let $div_blogList = $(`[data-${pageConst.DATASET.KEY.BLOG_STATUS}]`);
  //  Closure Var
  let $$pagination_list = {
    //  [status]: {
    //    currentPage 當前頁碼
    //    totalPage 總頁數
    //    currentPagination 當前分頁碼
    //    totalPagination 總分頁數
    //  }
  };

  //  初始化 Closure Var
  for (let status in pageData) {
    if (!pageData[status].count) {
      continue;
    }

    let targetBlogData = ($$pagination_list[status] = {});
    //  初始頁碼index從1開始
    targetBlogData.currentPage = 1;
    targetBlogData.totalPage = Math.ceil(
      pageData[status].count / pageConst.PAGINATION.BLOG_COUNT
    );
    //  初始分頁index從1開始
    targetBlogData.currentPagination = 1;
    targetBlogData.totalPagination = Math.ceil(
      targetBlogData.totalPage / pageConst.PAGINATION.PAGE_COUNT
    );
  }
  //  處理頁碼的tab
  $(pageConst.SELECTOR.PAGE_NUM_LINK).each((index, link) => {
    let $link = $(link);
    //  頁碼的容器
    let $container = $link.parents(
      `[data-${pageConst.DATASET.KEY.BLOG_STATUS}]`
    );
    //  文章狀態
    let $$status = $container.data(pageConst.DATASET.KEY.BLOG_STATUS);
    //  分頁資料
    let $$pagination = $$pagination_list[$$status];
    //  目標頁碼
    let $$targetPage = $link.data(pageConst.DATASET.KEY.PAGE_TURN) * 1;
    //  頁碼tab
    link.$tab = $link.parent("li");
    let $$pane_selector = `[data-${pageConst.DATASET.KEY.PAGE_NUM}=${$$targetPage}]`;
    //  頁碼pane
    link.$pane = $container.find($$pane_selector);
    //  下個分頁 tab
    let $tab_pagination_turn_next = $container.find(
      `[data-${pageConst.DATASET.KEY.PAGE_TURN}=${pageConst.DATASET.VALUE.NEXT_PAGINATION}]`
    );
    //  上個分頁 tab
    let $tab_pagination_turn_previous = $container.find(
      `[data-${pageConst.DATASET.KEY.PAGE_TURN}=${pageConst.DATASET.VALUE.PREVIOUS_PAGINATION}]`
    );
    //  下一頁 tab
    let $tab_page_turn_next = $container.find(
      `[data-${pageConst.DATASET.KEY.PAGE_TURN}=${pageConst.DATASET.VALUE.NEXT_PAGE}]`
    );
    //  上一頁 tab
    let $tab_page_turn_previous = $container.find(
      `[data-${pageConst.DATASET.KEY.PAGE_TURN}=${pageConst.DATASET.VALUE.PREVIOUS_PAGE}]`
    );
    //  定義 當前頁碼tab的功能
    link.tab = async function (preLink, paramsObj) {
      //  取出 目標頁、目標分頁、當前分頁
      let { targetPage, targetPagination, currentPagination } = paramsObj;
      //  讀取過渡
      $container.find(".pageLoading").removeAttr("style");
      //  確認目標頁 pane 是否存在
      if (!link.$pane.length) {
        let show =
          $$status === pageConst.DATASET.VALUE.BLOG_STATUS_PUBLIC
            ? true
            : false;
        //  發出請求，取得blogList數據
        let {
          data: {
            [$$status]: { blogs },
          },
        } = await G.utils.axios.post(API_PAGINATION, {
          author_id,
          limit: pageConst.PAGINATION.BLOG_COUNT,
          //  前端分頁index從1開始，後端分頁index從0開始，所以要-1
          offset: (targetPage - 1) * pageConst.PAGINATION.BLOG_COUNT,
          show,
        });
        //  生成html
        let html = template_blogList({
          blogs,
          page: targetPage,
          pagination: pageConst.PAGINATION,
          isPublic: show,
          isSelf: G.data.active === "self",
        });
        //  將生成的html放入
        $container
          .find(`[data-${pageConst.DATASET.KEY.PAGE_NUM}]`)
          .last()
          .after(html);
        //  賦予目標頁碼 pane 內容
        link.$pane = $container.find($$pane_selector);
      }
      /* 同步Closure數據 */
      $$pagination.currentPage = targetPage;
      if (currentPagination && targetPagination) {
        ////  若參數含有 當前分頁、目標分頁，代表分頁數有變化
        $$pagination.currentPagination = targetPagination;
        //  隱藏當前分頁
        $container
          .find(
            `[data-${pageConst.DATASET.KEY.PAGINATION_NUM}=${currentPagination}]`
          )
          .hide();
        //  顯示目標分頁
        $container
          .find(
            `[data-${pageConst.DATASET.KEY.PAGINATION_NUM}=${targetPagination}]`
          )
          .show();
        //  下一個目標分頁tab 顯示/隱藏
        $tab_pagination_turn_next.toggleClass(
          "pe-none",
          targetPagination === $$pagination.totalPagination
        );
        //  上一個目標分頁tab 顯示/隱藏
        $tab_pagination_turn_previous.toggleClass(
          "pe-none",
          targetPagination === 1
        );
      }
      //  下一頁tab 顯示/隱藏
      $tab_page_turn_next.toggleClass(
        "pe-none",
        targetPage === $$pagination.totalPage
      );
      //  上一頁tab 顯示/隱藏
      $tab_page_turn_previous.toggleClass("pe-none", targetPage === 1);
      //  移除前一個頁碼tab active效果
      preLink.$tab.removeClass("active");
      //  添加目標頁碼tab active效果
      link.$tab.addClass("active");
      //  隱藏前一個頁碼pane
      preLink.$pane.css({ display: "none" });
      await Promise.all([
        //  顯示目標頁碼pane
        new Promise((resolve) =>
          //  顯示當前頁碼pane
          link.$pane.fadeIn(resolve)
        ),
        //  讀取過渡結束
        new Promise((resolve) =>
          $container.find(".pageLoading").fadeOut(700, resolve)
        ),
      ]);
    };
  });
  //  為div註冊clickEvent handler
  $div_blogList.on("click", turnPage);
  async function turnPage(e) {
    //  取得翻頁tab
    let $tab = $(e.target);
    if ($tab.attr("href") === "#") {
      e.preventDefault();
    }
    //  翻頁的方式
    let mode = $tab.data(pageConst.DATASET.KEY.PAGE_TURN);
    if (!mode) {
      return;
    }
    //  文章列表元素
    let $container = $(e.currentTarget);
    //  文章列狀態
    const status = $container.data(pageConst.DATASET.KEY.BLOG_STATUS);
    //  取得當前頁碼、當前分頁碼
    let { currentPage, currentPagination } = $$pagination_list[status];
    //  未有任何改變前，目標頁碼即為當前頁碼
    let targetPage = currentPage;
    //  未有任何改變前，目標頁碼即為當前分頁碼
    let targetPagination = currentPagination;
    if (
      mode === pageConst.DATASET.VALUE.NEXT_PAGINATION ||
      mode === pageConst.DATASET.VALUE.PREVIOUS_PAGINATION
    ) {
      ////  以跳分頁作為翻頁的方式
      //  計算目標分頁碼
      targetPagination =
        mode === pageConst.DATASET.VALUE.PREVIOUS_PAGINATION
          ? --targetPagination
          : ++targetPagination;
      //  計算目標頁碼
      targetPage = (targetPagination - 1) * pageConst.PAGINATION.PAGE_COUNT + 1;
    } else if (
      ////  以上下頁作為翻頁的方式
      mode === pageConst.DATASET.VALUE.NEXT_PAGE ||
      mode === pageConst.DATASET.VALUE.PREVIOUS_PAGE
    ) {
      //  計算目標頁碼
      targetPage =
        mode === pageConst.DATASET.VALUE.NEXT_PAGE
          ? currentPage + 1
          : currentPage - 1;
      //  計算目標分頁碼
      targetPagination = Math.ceil(
        targetPage / pageConst.PAGINATION.PAGE_COUNT
      );
    } else {
      ////  以點選頁碼作為翻頁的方式
      //  計算目標頁碼
      targetPage = mode * 1;
    }
    //  發出請求所攜帶的數據酬載
    let payload = {};
    if (targetPagination !== currentPagination) {
      ////  若目標分頁若有更動，酬載要紀錄目標分頁、當前分頁
      payload = {
        targetPagination,
        currentPagination,
      };
    }
    //  當前頁碼link
    let current_page_link = $container
      .find(`[data-${pageConst.DATASET.KEY.PAGE_TURN}='${currentPage}']`)
      .get(0);
    //  目標頁碼link
    let target_page_link = $container
      .find(`[data-${pageConst.DATASET.KEY.PAGE_TURN}='${targetPage}']`)
      .get(0);
    //  調用目標頁碼link的tab功能
    await target_page_link.tab(current_page_link, {
      targetPage,
      ...payload,
    });
    $tab.get(0).blur();
  }
}
