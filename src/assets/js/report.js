//   處理外部資源讀取失敗
window.addEventListener("error", report, true);

function report(event) {
  event.preventDefault();
  let target = event.target ? event.target : undefined;
  if (!target) {
    return;
  }
  let url = target.src || target.href;
  if (!url) {
    return;
  }
  const payload = JSON.stringify({
    pathname: location.pathname,
    tagName: target.tagName,
    href: target.href,
    src: target.src,
  });
  fetch("/api/report/srcErr", {
    method: "POST",
    body: payload,
  })
    .then((res) => res.json())
    .then(({ errno, msg }) => {
      if (process.env.isProd) {
        return;
      }
      let prefix = `${target.tagName}:${url} 加載失敗 → 回報伺服器\n回報`;
      if (errno) {
        console.log(`${prefix}失敗: ${msg}`);
      } else {
        console.log(`${prefix}完成`);
      }
    });

  return;
}
