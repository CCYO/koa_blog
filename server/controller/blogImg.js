const BlogImg = require("../server/blogImg");
const Opts = require("../utils/seq_options");
const { MyErr, ErrModel, SuccModel } = require("../utils/model");
const { ERR_RES } = require("../const");

async function add({ blog_id, img_id }) {
  let data = await BlogImg.create(
    Opts.BLOG_IMG.CREATE.one({ blog_id, img_id })
  );
  return new SuccModel({ data });
}
async function countBlogImgAlt(blogImg_id) {
  let count = await BlogImg.countBlogImgAlt(blogImg_id);
  if (!count) {
    return new ErrModel(ERR_RES.BLOG_IMG.READ.NO_BLOG_IMG_ALT);
  }
  return new SuccModel({ data: count });
}
async function removeList(id_list) {
  let row = await BlogImg.destoryList(Opts.BLOG_IMG.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.BLOG_IMG.REMOVE.ROW);
  }
  return new SuccModel({ data: row });
}

module.exports = {
  removeList,
  countBlogImgAlt,
  add,
};
