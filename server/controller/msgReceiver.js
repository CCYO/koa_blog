/* CONFIG     ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* SERVER     ----------------------------------------------------------------------------- */
const MsgReceiver = require("../server/msgReceiver");

/* UTILS      ----------------------------------------------------------------------------- */
const Opts = require("../utils/seq_options");
const { MyErr, SuccModel } = require("../utils/model");

async function setList(newDatas) {
  let data = await MsgReceiver.bulkCreate(
    Opts.MSG_RECEIVER.CREATE.bulk(newDatas)
  );
  if (data.length !== newDatas.length) {
    throw new MyErr(ERR_RES.MSG_RECEIVER.CREATE.ERR_BULK_ROW);
  }
  return new SuccModel({ data });
}

async function removeList(id_list, force = false) {
  let row = await MsgReceiver.destroyList(
    Opts.MSG_RECEIVER.REMOVE.list(id_list, force)
  );
  if (id_list.length !== row) {
    throw new MyErr({
      ...ERR_RES.MSG_RECEIVER.REMOVE.ROW,
      error: `要刪除的MsgReceiver_list為 ${id_list}`,
    });
  }
  return new SuccModel();
}

async function restoryList(id_list) {
  let row = await MsgReceiver.restory(Opts.MSG_RECEIVER.RESTORE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr({
      ...ERR_RES.MSG_RECEIVER.RESTORE.ROW_ERR,
      error: `要restory的msgReceiver_list為 ${id_list}`,
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
  restoryList,
  removeList,
  setList,
};
