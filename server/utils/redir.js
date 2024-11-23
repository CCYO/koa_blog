const {
  COMMON: { UTILS },
} = require("../const");
//  redirect login page
function login(ctx) {
  let url = new URL(ctx.href);
  let search = url.search;
  let from = encodeURIComponent(url.pathname + search);
  ctx.redirect(`/login?${UTILS.REDIR_FROM}=${from}`);
}

module.exports = {
  login,
};
