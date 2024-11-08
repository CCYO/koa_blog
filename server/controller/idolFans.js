const IdolFans = require("../server/idolFans");
const Opts = require("../utils/seq_options");
const { SuccModel, MyErr } = require("../utils/model");
const { ERR_RES } = require("../config");

async function reFollow(id_list) {
  let opts = Opts.IDOL_FANS.UPDATE.reFollow(id_list);
  let row = await IdolFans.update(opts, {
    updatedAt: new Date(),
    deletedAt: null,
  });
  if (row !== id_list.length) {
    throw new MyErr(ERR_RES.IDOL_FANS.UPDATE.ERR_ROW);
  }
  return new SuccModel();
}

async function restoringList(id_list) {
  let row = await IdolFans.restore(Opts.IDOL_FANS.RESTORE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.IDOL_FANS.RESTORE.ROW_ERR);
  }
  return new SuccModel();
}

async function removeList(id_list) {
  let row = await IdolFans.deleteList(Opts.IDOL_FANS.REMOVE.list(id_list));
  if (id_list.length !== row) {
    throw new MyErr(ERR_RES.IDOL_FANS.REMOVE.ROW_ERR);
  }
  return new SuccModel();
}

async function modify(id, newData) {
  let opts = Opts.IDOL_FANS.UPDATE.modify(id);
  let row = await IdolFans.update(opts, newData);
  if (!row) {
    throw new MyErr({
      ...ERR_RES.IDOL_FANS.UPDATE.ERR_ROW,
      error: `idolFans/${id} 未更新`,
    });
  }
  return new SuccModel();
}

module.exports = {
  modify,
  restoringList,
  removeList,
  reFollow,
};
