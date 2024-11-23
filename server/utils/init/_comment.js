const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const { deepCopy } = require("./_deepCopy");
const {
  COMMENT: { TIME_FORMAT },
} = require("../../const");

//  適合前端渲染comment的嵌套格式
function toNest(list) {
  let copyList = _initList(list);
  let nest = _toNest(copyList);
  //  sort tree
  let tree = nest.tree.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });
  return {
    list: copyList,
    tree,
  };
}

//  時間序列化
function initTime(item) {
  if (item.deletedAt) {
    // item.time = date.format(item.deletedAt, TIME_FORMAT);
    item.time = dayjs.utc(item.deletedAt).utcOffset(8).format(TIME_FORMAT);
  } else {
    // item.time = date.format(item.createdAt, TIME_FORMAT);
    item.time = dayjs.utc(item.createdAt).utcOffset(8).format(TIME_FORMAT);
  }
  return item;
}

module.exports = {
  initTime,
  toNest,
};

function _initList(list) {
  //  nest
  let nest = _toNest(list);
  //  取出狀態為deleted、且其子孫reply也全是deleted狀態的comment
  let needRemove = _getListOfNeedRemove(nest.list);
  //  移除
  for (let id of needRemove) {
    let index = nest.list.findIndex((item) => item.id === id);
    nest.list.splice(index, 1);
  }
  //  initTime
  return nest.list.map(initTime);
}

function _getListOfNeedRemove(list) {
  let save = new Set();
  let remove = new Set();
  for (let item of list) {
    if (!item.deletedAt) {
      save.add(item.id);
      continue;
    }
    if (!item.reply.length) {
      remove.add(item.id);
      continue;
    }
    if (_someoneNotDeleted(item.reply, save)) {
      save.add(item.id);
    } else {
      remove.add(item.id);
    }
  }
  return [...remove];

  function _someoneNotDeleted(list, save) {
    return list.some((item) => {
      if (save.has(item.id) || !item.deletedAt) {
        save.add(item.id);
        return true;
      }
      if (item.reply.length) {
        return _someoneNotDeleted(item.reply, save);
      }
    });
  }
}

function _toNest(list) {
  //  存放 nest 結果的數據
  let tree = [];
  let copyList = deepCopy(list);
  for (let item of copyList) {
    //  每個 comment 都新增 reply 屬性，用來 nest commentChildren
    item.reply = [];
    //  屬於 commentParent || 只有一條 comment 數據
    if (!item.pid || copyList.length === 1) {
      //  存入 nest 結果
      tree.push(item);
    } else {
      //  執行 nest
      nest(tree, item);
    }
  }
  return {
    list: copyList,
    tree,
  };

  //  nest
  function nest(list, item) {
    //  迭代處理 存放在 nest 結果的數據，
    for (let { id, reply } of list) {
      //  要處理的數據pid === 當前迭代數據的id
      if (item.pid === id) {
        //  將要處理的數據，存放進當前迭代數據的reply
        reply.push(item);
        break;
        //  若當前迭代數據的reply內仍有數據，則向內執行 nest
      } else if (reply.length) {
        nest(reply, item);
      }
    }
  }
}
