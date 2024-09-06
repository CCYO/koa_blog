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

function check_login(G) {
  const loginStatus = G?.data?.me;
  if (!loginStatus) {
    /* 若未登入，跳轉到登入頁 */
    alert(`請先登入`);
    location.href = `${API_LOGIN}?${FRONTEND.REDIR.FROM}=${encodeURIComponent(
      location.href
    )}`;
  }
  return loginStatus;
}

export default { from, check_login };
