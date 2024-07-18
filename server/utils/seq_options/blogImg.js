const xss = require("../xss");
const _REMOVE = require("./_remove");

const REMOVE = {
  list: _REMOVE.list,
};

const CREATE = {
  one: ({ blog_id, name, img_id }) => ({
    blog_id,
    img_id,
    name: xss(name),
  }),
};

module.exports = {
  CREATE,
  REMOVE,
};
