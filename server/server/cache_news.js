/* CONFIG      ----------------------------------------------------------------------------- */
const {
  CACHE: {
    TYPE: { NEWS },
  },
} = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { getCache } = require("../db/redis");

async function has(id) {
  let news = getCache(NEWS);
  return await news.has(id);
}
async function destroyList(id_list) {
  let news = getCache(NEWS);
  return await news.del(id_list);
}

async function createList(id_list) {
  let news = getCache(NEWS);
  return await news.add(id_list);
}

module.exports = {
  has,
  destroyList,
  createList,
};
