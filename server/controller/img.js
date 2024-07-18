const Img = require("../server/img");
const Opts = require("../utils/seq_options");
const { SuccModel, ErrModel } = require("../utils/model");
const { ERR_RES } = require("../config");

async function add({ hash, url }) {
  let data = await Img.create({ hash, url });
  return new SuccModel({ data });
}
async function find(hash) {
  let data = await Img.read(Opts.IMG.FIND.one(hash));
  if (!data) {
    return new ErrModel(ERR_RES.IMG.READ.NO_DATA);
  }
  return new SuccModel({ data });
}

module.exports = {
  add,
  find,
};
