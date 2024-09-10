/**
 * @description Server IdolFans
 */
const { IdolFans } = require("../db/mysql/model");
const { MyErr } = require("../utils/model");
const { ERR_RES } = require("../config");

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

async function update(id, newData) {
  try {
    let [row] = await IdolFans.update(newData, {
      where: { id },
    });
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
