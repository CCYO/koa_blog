/* CONFIG     ----------------------------------------------------------------------------- */
const { CACHE } = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { getCache } = require("../db/redis");

const cache = getCache(CACHE.TYPE.REGISTER_CODE);

async function create(id) {
  let code = Math.floor(Math.random() * 1000000);
  // { code, expire }
  return await cache.set(id, code, CACHE.REGISTER_CODE.TTL);
}

async function read(id) {
  return await cache.get(id);
}

module.exports = {
  read,
  create,
};
