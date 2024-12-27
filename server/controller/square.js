/* CONFIG     ----------------------------------------------------------------------------- */
const { ERR_RES, PAGINATION } = require("../config");

/* CONTROLLER ----------------------------------------------------------------------------- */
const C_Blog = require("./blog");

/* UTILS      ----------------------------------------------------------------------------- */
const { ErrModel } = require("../utils/model");

//  查詢 blog 分頁列表數據
async function findListForPagination(opts) {
  //  opts { user_id, offset, limit, PAGINATION}
  //  data { public: { list, count }}
  if (
    PAGINATION.SQUARE.BLOG_COUNT !== opts.PAGINATION.BLOG_COUNT ||
    PAGINATION.SQUARE.PAGE_COUNT !== opts.PAGINATION.PAGE_COUNT
  ) {
    return new ErrModel(ERR_RES.SERVER.RESPONSE.PAGINATION_UPDATE);
  }
  return await C_Blog.findListAndCountOfSquare(opts);
}

module.exports = {
  findListForPagination,
};
