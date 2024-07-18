const BACKEND = require("../config");
//  redirect login page
function login(ctx) {
  let url = new URL(ctx.href);
  let search = url.search;
  let from = encodeURIComponent(url.pathname + search);
  ctx.redirect(`/login?${BACKEND.UTILS.REDIR_FROM}=${from}`);
}

module.exports = {
  login,
};
