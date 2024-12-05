/* CONFIG     ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* SERVER     ----------------------------------------------------------------------------- */
const CachePage = require("../server/cache_page");

/* UTILS      ----------------------------------------------------------------------------- */
const { SuccModel, ErrModel } = require("../utils/model");

async function find(type, id) {
  let cache = await CachePage.read(type, id);
  if (!cache) {
    return new ErrModel(ERR_RES.CACHE.READ.PAGE_NOT_EXIST);
  }
  let [etag, data] = Object.entries(cache)[0];
  return new SuccModel({ data: { etag, data } });
}

async function modify(type, id, data) {
  await CachePage.update(type, id, data);
  return new SuccModel();
}

async function removeList(type, id_list) {
  await CachePage.destroyList(type, id_list);
  return new SuccModel();
}

module.exports = {
  find,
  removeList,
  modify,
};
