/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { INTEGER } = require("../types");

const BlogImg = seq.define("BlogImg", {
  id: {
    type: INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  img_id: {
    type: INTEGER,
    allowNull: false,
  },
  blog_id: {
    type: INTEGER,
    allowNull: false,
  },
});

module.exports = BlogImg;
