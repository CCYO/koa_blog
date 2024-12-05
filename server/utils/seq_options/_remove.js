/* NPM         ----------------------------------------------------------------------------- */
const { Op } = require("sequelize");

const list = (id_list, force = false) => ({
  where: { id: { [Op.in]: id_list } },
  force,
});

module.exports = {
  list,
};
