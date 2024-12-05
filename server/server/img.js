/* CONFIG      ----------------------------------------------------------------------------- */
const { ERR_RES } = require("../config");

/* CUSTOM      ----------------------------------------------------------------------------- */
const { Img } = require("../db/mysql/model");

/* UTILS       ----------------------------------------------------------------------------- */
const { MyErr } = require("../utils/model");
const Init = require("../utils/init");

async function create(data) {
  try {
    let img = await Img.create(data);
    return Init.img(img);
  } catch (error) {
    throw new MyErr({ ...ERR_RES.IMG.CREATE.ERR, error });
  }
}
async function read(opts) {
  let img = await Img.findOne(opts);
  return Init.img(img);
}

module.exports = {
  read,
  create,
};
