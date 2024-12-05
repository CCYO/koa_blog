/* CONFIG      ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { MsgReceiver } = require("../db/mysql/model");

/* UTILS       ----------------------------------------------------------------------------- */
const { MyErr } = require("../utils/model");
const Init = require("../utils/init");

async function bulkCreate({ datas, updateOnDuplicate }) {
  try {
    //  注意，無論要更新的資料是否被 updateOnDuplicate 標示，RV 顯示的數據皆會符合newDatas
    //  但實際上DB內的數據有沒有被更新，還是要看有沒有被 updateOnDuplicate 標示
    let ins = await MsgReceiver.bulkCreate(datas, { updateOnDuplicate });
    return Init.msgReceiver(ins);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.MSG_RECEIVER.UPDATE.ERR, error });
  }
}

async function restory(opts) {
  try {
    // RV ROW
    return await MsgReceiver.restore(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.MSG_RECEIVER.RESTORE.ERR, error });
  }
}

async function destroyList(opts) {
  try {
    //  RV: row
    return await MsgReceiver.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.MSG_RECEIVER.REMOVE.ERR, error });
  }
}

async function update(id, newData) {
  try {
    let [row] = await MsgReceiver.update(newData, { where: { id } });
    return row;
  } catch (error) {
    throw new MyErr({ ...ERR_RES.MSG_RECEIVER.UPDATE.ERR, error });
  }
}

module.exports = {
  update,
  restory,
  destroyList,
  bulkCreate,
};
