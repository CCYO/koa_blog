/**
 * @description middleware of upload to GCS by Formidable
 */
const { log } = require("../../utils/log");
const C_GFB = require("../../controller/firebase");
const C_Img = require("../../controller/img");
const {
  SERVER: { GFB },
} = require("../../const");

/**
 * 上傳圖檔至GFB
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
async function blogImg(ctx, next) {
  //  找blogImg_id
  let { blog_id, hash, img_id, blogImg_id } = ctx.query;
  let res = {
    blog_id,
    hash,
    img_id,
    blogImg_id,
  };
  if (!blogImg_id) {
    //  查找img紀錄
    let img = await C_Img.find(hash);
    //  無 img 紀錄
    if (img.errno) {
      log("@GCS無圖檔，直接創建img且作BlogImg關聯");
      //  上傳 GFB
      let { data } = await C_GFB.addBlogImg(ctx);
      //  取得 url
      res.url = data[GFB.BLOG_REF];
    } else {
      res.url = img.data.url;
      res.img_id = img.data.id;
    }
  }
  ctx.request.body = res;
  await next();
}

async function userAvatar(ctx, next) {
  const { data } = await C_GFB.addUserAvatar(ctx);
  ctx.request.body = data;
  await next();
}

module.exports = {
  userAvatar,
  blogImg,
};
