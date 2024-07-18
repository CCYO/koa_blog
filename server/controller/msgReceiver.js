const MsgReceiver = require("../server/msgReceiver");
const Opts = require("../utils/seq_options");
const { MyErr, SuccModel } = require("../utils/model");
const { ERR_RES } = require("../config");

async function setList(newDatas) {
  let data = await MsgReceiver.bulkCreate(
    Opts.MSG_RECEIVER.CREATE.bulk(newDatas)
  );
  if (data.length !== newDatas.length) {
    throw new MyErr(ERR_RES.MSG_RECEIVER.CREATE.ERR_BULK_ROW);
  }
  return new SuccModel({ data });
}

async function removeList(list, force = false) {
  let row = await MsgReceiver.destroyList(
    Opts.MSG_RECEIVER.REMOVE.list(list, force)
  );
  if (list.length !== row) {
    throw new MyErr({
      ...ERR_RES.MSG_RECEIVER.REMOVE.ROW,
      error: `要刪除的list為 ${list}`,
    });
  }
  return new SuccModel();
}

async function modify(id, newData) {
  let row = await MsgReceiver.update(id, newData);
  if (!row) {
    throw new MyErr({
      ...ERR_RES.MSG_RECEIVER.UPDATE.ERR_ROW,
      error: `msgReceiver/${id} 未更新`,
    });
  }
  return new SuccModel();
}

module.exports = {
  modify,
  removeList,
  setList,
};
