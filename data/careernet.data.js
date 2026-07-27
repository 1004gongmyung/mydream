// 생성물 — 손으로 고치지 말 것. 원본: 커리어넷 오픈API → node tools/fetch-careernet.mjs (키 필요)
// 현재: 빈 스냅샷(키로 수집 전) — available:false면 앱은 이 데이터를 표시하지 않는다 (가짜 응답 금지).
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_CAREERNET_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return { available: false, source: null, fetchedAt: null, jobs: [], details: {} };
});
