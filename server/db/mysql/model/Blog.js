/**
 * @description Sequelize Model
 */
const seq = require("../seq");
const { STRING, INTEGER, TEXT, BOO, DATE } = require("../types");
const { COMMON } = require("../../../const");

const Blog = seq.define(
  "Blog",
  {
    title: {
      type: STRING(COMMON.AJV.EDITOR.TITLE_MAX_LENGTH),
      validate: {
        is: COMMON.AJV.EDITOR.TITLE_REGEXP,
      },
      allowNull: false,
    },
    author_id: {
      type: INTEGER,
      allowNull: false,
    },
    html: {
      type: TEXT,
      allowNull: true,
    },
    show: {
      type: BOO,
      defaultValue: false,
    },
    showAt: {
      type: DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true,
  }
);

module.exports = Blog;
