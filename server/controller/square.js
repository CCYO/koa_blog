/* CONTROLLER ----------------------------------------------------------------------------- */
const C_Blog = require("./blog");

//  查詢 blog 分頁列表數據
async function findListForPagination(opts) {
  //  opts { user_id, offset, limit }
  //  data { public: { list, count }}
  return await C_Blog.findListAndCountOfSquare(opts);
}

module.exports = {
  findListForPagination,
};
