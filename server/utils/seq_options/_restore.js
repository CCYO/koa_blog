/* NPM         ----------------------------------------------------------------------------- */
const { Op } = require("sequelize");

const list = (id_list) => ({
  where: {
    id: { [Op.in]: id_list },
  },
});

module.exports = {
  list,
};
