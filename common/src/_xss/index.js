import { filterXSS, whiteList } from "xss";

const _whiteList = {
  ...whiteList,
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  h5: ["style"],
  ol: ["style"],
  ul: ["style"],
  li: ["style"],
  p: ["style"],
  span: ["style"],
  div: ["data-w-e-type", "data-w-e-is-void"],
  input: ["type"],
  img: ["src", "alt", "style", "data-href"],
  iframe: [
    "src",
    "title",
    "width",
    "height",
    "title",
    "frameborder",
    "allow",
    "allowfullscreen",
  ],
};

function filter(html) {
  return filterXSS(html, {
    //  這定能放過的 attr
    whiteList: _whiteList,
    //  通過在白名單上後的attr filter
    onTagAttr(tag, attr, attrVal, isWhiteAtt) {
      let res = "";
      if (!isWhiteAtt) {
        //  若attr不在白名單內
        //  無返回值的狀況，會再進入onIgnoreTag處理
        return;
      } else if (attrVal.length) {
        res = `${attr}="${attrVal}"`;
      } else if (attr !== "style") {
        res = attr;
      }
      return res;
    },
    //  不符合白名單，會進入此過濾函數
    onIgnoreTag(tag, html) {
      if (tag === "x-img") {
        return html;
      }
    },
  });
}

//  去除前後空格
function trim(data) {
  return filter(data.trim());
}

//  去除blog內文多於空格與換行
function blog(data) {
  //  移除前後空格
  let curHtml = trim(data);
  //  移除開頭、結尾的空格與空行
  let reg_start = /^((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*/g;
  let reg_end = /((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*$/g;
  curHtml = curHtml.replace(reg_start, "");
  curHtml = curHtml.replace(reg_end, "");
  return curHtml;
}

export default { filter, trim, blog };
