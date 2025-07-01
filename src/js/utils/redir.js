/* CONFIG     ----------------------------------------------------------------------------- */
import { COMMON } from "../../config";

/* VAR        ----------------------------------------------------------------------------- */
const API_LOGIN = "/login";
const REDIR_FROM = COMMON.UTILS.REDIR_FROM;

/* EXPORT     ----------------------------------------------------------------------------- */
export default { from, check_login };

//  確認是否已轉址需求
function from(url) {
  let searchParams = new URLSearchParams(location.search);
  if (searchParams.size) {
    //  searchParams 取得的query，已經完成decodeURIComponent
    url = searchParams.get(REDIR_FROM);
  }
  location.replace(url);
}

//  確認是否有登入權限
function check_login(G_or_msg) {
  let loginStatus;
  let msg = undefined;

  if (typeof G_or_msg === "string") {
    msg = G_or_msg;
  } else if (!G_or_msg?.data?.me) {
    msg = `請先登入`;
    loginStatus = !G_or_msg?.data?.me;
  }
  if (msg) {
    /* 若未登入，跳轉到登入頁 */
    alert(msg);
    location.href = `${API_LOGIN}?${REDIR_FROM}=${encodeURIComponent(
      location.href
    )}`;
  }
  return !msg;
}
