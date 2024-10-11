const xss = require("../xss");
const _REMOVE = require("./_remove");

const REMOVE = {
  list: _REMOVE.list,
};

const CREATE = {
  one: ({ blog_id, img_id }) => ({
    blog_id,
    img_id,
  }),
};

module.exports = {
  CREATE,
  REMOVE,
};
