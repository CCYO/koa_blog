/**
 * @description middleware of upload to GCS by Formidable
 */
const { log } = require("../../utils/log");
const C_GFB = require("../../controller/firebase");
const C_Img = require("../../controller/img");
const { GFB } = require("../../config");

/**
 * 上傳圖檔至GFB
 * @param { object } ctx
 * @returns { object } SuccessModel { data: { blogImg_id, id, url, name, hash }}
 */
async function blogImg(ctx, next) {
  //  找blogImg_id
  let { blog_id, hash, blogImg_id, name } = ctx.query;
  let url;
  let img_id;
  if (!blogImg_id) {
    //  查找img紀錄
    let img = await C_Img.find(hash);
    //  無 img 紀錄
    if (!img.data) {
      log("@GCS無圖檔，直接創建img且作BlogImg關聯");
      //  上傳 GFB
      let { data } = await C_GFB.addBlogImg(ctx);
      //  取得 url
      url = data[GFB.BLOG_REF];
    } else {
      url = img.data.url;
      img_id = img.data.id;
    }
    name = decodeURIComponent(name);
  }

  ctx.request.body = {
    blog_id: blog_id * 1,
    hash,
    url,
    img_id,
    name,
    blogImg_id,
  };
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
