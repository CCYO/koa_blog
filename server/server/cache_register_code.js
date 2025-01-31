/* CONFIG     ----------------------------------------------------------------------------- */
const { CACHE } = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { getCache } = require("../db/redis");

const cache = getCache(CACHE.TYPE.REGISTER_CODE);

async function create(id) {
  let code = Math.floor(Math.random() * 1000000);
  if (100000 > code) {
    code = "0" + code;
  } else {
    code = String(code);
  }
  // { code, expire }
  return await cache.set(id, code, CACHE.REGISTER_CODE.TTL);
}

async function read(id) {
  return await cache.get(id);
}

async function remove(id) {
  return await cache.del([id]);
}

module.exports = {
  remove,
  read,
  create,
};
