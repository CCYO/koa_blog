/**
 * @description  initEJS解析後，其中HTML的<img>為自定義的<x-img>，這裡負責數據轉回<img>
 */

/* EXPORT     ----------------------------------------------------------------------------- */
export default function parseHtmlStr_XImgToImg(G) {
  let htmlStr = G.data.blog.html;
  let reg = G.constant.REG.X_IMG_PARSE_TO_IMG;
  let imgLoad_list = [];
  let regRes;

  //  存放 reg 匹配後 的 img src 數據
  while ((regRes = reg.exec(htmlStr))) {
    let { alt_id, style } = regRes.groups;
    //  MAP: alt_id → { alt, blogImg: {id, name}, img: {id, hash, url}}
    let {
      alt,
      img: { url },
    } = G.data.blog.map_imgs.get(alt_id * 1);
    let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}"`;
    let replaceStr = style ? `${imgEle} style="${style}"/>` : `${imgEle}/>`;
    //  替換匹配的<img>數據
    htmlStr = htmlStr.replace(regRes[0], replaceStr);
    //  蒐集img onload
    imgLoad_list.push(_imgLoad);

    // 確認單個img是否完成讀取
    function _imgLoad() {
      return new Promise((resolve) => {
        let img = document.querySelector(`[src="${url}?alt_id=${alt_id}"]`);
        if (img.complete) {
          !process.env.isProd &&
            console.log(`blogImgAlt/${alt_id} ---> already complete`);
          return complete();
        }
        img.onload = () => complete();
        function complete() {
          !process.env.isProd &&
            console.log(`blogImgAlt/${alt_id} ---> onload finish`);
          return resolve();
        }
      });
    }
  }
  // 確認全部img是否完成讀取
  let checkImgLoad = () =>
    Promise.all(imgLoad_list.map((imgLoad) => imgLoad())).catch((e) => {
      console.log(e);
    });
  return { htmlStr, checkImgLoad };
}
