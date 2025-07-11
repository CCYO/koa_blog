/**
 * @description  initEJS解析後，其中HTML的<img>為自定義的<x-img>，這裡負責數據轉回<img>
 */

const REG_X_IMG_PARSE_TO_IMG =
  /<x-img.+?data-alt-id=("|')(?<alt_id>\d+?)\1.+?(data-style=("|')(?<style>.*?)\4)?.*?\/>/g;
// new RegExp(
//   "<x-img.+?data-alt-id='(?<alt_id>\\d+?)'.+?(data-style='(?<style>.*?)')?.*?\\/>",
//   "g"
// );

/* EXPORT     ----------------------------------------------------------------------------- */
export default function parseHtmlStr_XImgToImg(G) {
  let htmlStr = G.data.blog.html;
  let reg = REG_X_IMG_PARSE_TO_IMG;
  let imgLoad_list = [];
  let regRes;

  //  存放 reg 匹配後 的 img src 數據
  while ((regRes = reg.exec(htmlStr))) {
    let { alt_id, style } = regRes.groups;
    //  MAP: alt_id => { alt, blogImg: { id }, img: {id, hash, url}}
    let {
      alt,
      img: { url },
    } = G.data.blog.map_imgs.get(alt_id * 1);
    let imgEle = `<img src="${url}?alt_id=${alt_id}" alt="${alt}" title="${alt}"`;
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
        img.onload = () => {
          console.log("進入onload");
          return complete();
        };
        img.onerror = () => {
          console.log("進入onerror");
          return noComplete();
        };
        function noComplete() {
          !process.env.isProd &&
            console.log(`blogImgAlt/${alt_id} ---> onerror`);
          return resolve();
        }
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
