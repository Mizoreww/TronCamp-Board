// 榜单数据源配置。
// 默认读同站静态文件(由 boardpub/push_board.sh 推到 Pages 仓库 data/ 下);
// 联调时可改为后端直连,如 "http://<backend-host>:8080/api/leaderboard.json"
// (注意:https 页面直连 http 后端会被浏览器混合内容策略拦截,生产读路径走静态文件)。
window.BOARD_CONFIG = {
  BOARD_DATA_URL: "./data/leaderboard.json",
  REFRESH_SECONDS: 60,
  // 网页提交页(评测后端伺服)。Pages 为 https、后端为 http,故官网用"跳转"而非
  // 内嵌上传表单,避免浏览器混合内容拦截。换评测机/给后端上 https 时只改这一处。
  SUBMIT_URL: "http://139.196.22.178:8080/submit",
};
