/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER, TEXT, BOO, DATE } = require("../types");
const {
  COMMON: { AJV },
} = require("../../../config");

const Blog = seq.define(
  "Blog",
  {
    title: {
      allowNull: false,
      type: STRING(AJV.BLOG.TITLE.MAX_LENGTH),
      validate: {
        is: AJV.BLOG.TITLE.REGEXP,
      },
    },
    author_id: {
      type: INTEGER,
      allowNull: false,
    },
    html: {
      type: TEXT,
    },
    show: {
      type: BOO,
      defaultValue: false,
    },
    showAt: {
      type: DATE,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Blog;
