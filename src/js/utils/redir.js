import FRONTEND from "@config/frontend_esm";
const API_LOGIN = "/login";

function from(url) {
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.size) {
    //  searchParams 取得的query，已經完成decodeURIComponent
    url = searchParams.get(FRONTEND.REDIR.FROM);
  }
  location.replace(url);
}

function check_login(data) {
  let login = data && data.me && data.me.id;
  if (login) {
    return true;
  }
  /* 若未登入，跳轉到登入頁 */
  alert(`請先登入`);

  location.href = `${API_LOGIN}?${FRONTEND.REDIR.FROM}=${encodeURIComponent(
    location.href
  )}`;
  return;
}

export default { from, check_login };
