/**
 * @description Server IdolFans
 */

/* CONFIG      ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { IdolFans } = require("../db/mysql/model");

/* UTILS       ----------------------------------------------------------------------------- */
const { MyErr } = require("../utils/model");

async function restore(opts) {
  try {
    // RV ROW
    return await IdolFans.restore(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.IDOL_FANS.RESTORE.ERR, error });
  }
}

async function deleteList(opts) {
  try {
    //  RV row
    return await IdolFans.destroy(opts);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.IDOL_FANS.DELETE.ERR, error });
  }
}

async function update(opts, newData) {
  try {
    let [row] = await IdolFans.update(newData, opts);
    return row;
  } catch (error) {
    throw new MyErr({ ...ERR_RES.IDOL_FANS.UPDATE.ERR, error });
  }
}

module.exports = {
  update,
  deleteList,
  restore,
};
