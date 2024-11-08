/* NPM        ----------------------------------------------------------------------------- */
import xss from "xss";
/* VAR        ----------------------------------------------------------------------------- */
const _whiteList = {
  ...xss.whiteList,
  h1: ["style"],
  h2: ["style"],
  h3: ["style"],
  h4: ["style"],
  h5: ["style"],
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

/* EXPORT     ----------------------------------------------------------------------------- */
export default { _xss, trim, blog };

//  針對html格式內容設計
function _xss(html) {
  return xss(html, {
    whiteList: _whiteList,
    //  若ele的tag符合白名單，會進入此過濾函數
    onTagAttr(tag, attr, attrVal, isWhiteAtt) {
      if (!isWhiteAtt) {
        /**
         * 若attr不在白名單內
         * 無返回值的狀況，會再進入onIgnoreTag處理
         */
        return;
      } else if (!attrVal.length) {
        //  attrVal 無值
        return attr;
      } else {
        return `${attr}="${attrVal}"`;
      }
    },
    //  tag不符合白名單，進入此過濾函數
    onIgnoreTag(tag, htmlStr) {
      if (tag === "x-img") {
        return htmlStr;
      }
    },
  });
}

//  去除前後空格
function trim(data) {
  return _xss(data.trim());
}

//  未blog內文設計
function blog(data) {
  //  移除前後空格
  let curHtml = trim(data.trim());
  //  移除開頭、結尾的空格與空行
  let reg_start = /^((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*/g;
  let reg_end = /((<p><br><\/p>)|(<p>(\s|&nbsp;)*<\/p>))*$/g;
  curHtml = curHtml.replace(reg_start, "");
  curHtml = curHtml.replace(reg_end, "");
  return curHtml;
}
