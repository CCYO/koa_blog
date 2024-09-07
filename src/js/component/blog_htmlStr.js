/* 將 <x-img> 數據轉回 <img> */
export default function parseHtmlStr_XImgToImg(G) {
  //  複製一份htmlStr
  let imgLoad_list = [];
  let htmlStr = G.data.blog.html;
  let reg = G.constant.REG.X_IMG_PARSE_TO_IMG;
  let res;

  //  存放 reg 匹配後 的 img src 數據
  while ((res = reg.exec(htmlStr))) {
    let { alt_id, style } = res.groups;
    //  MAP: alt_id → { alt, blogImg: {id, name}, img: {id, hash, url}}
    let {
      alt,
      img: { url },
    } = G.data.blog.map_imgs.get(alt_id * 1);
    let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}"`;
    let replaceStr = style ? `${imgEle} style="${style}"/>` : `${imgEle}/>`;
    function imgLoad() {
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
    imgLoad_list.push(imgLoad);
    //  修改 _html 內對應的 img相關字符
    htmlStr = htmlStr.replace(res[0], replaceStr);
  }
  let checkImgLoad = () =>
    Promise.all(imgLoad_list.map((imgLoad) => imgLoad())).catch((e) => {
      console.log(e);
    });
  return { htmlStr, checkImgLoad };
}
