// 외부 API 어댑터 (커리어넷·고용24) — 연동 준비 스켈레톤
// 현재 상태: 인증키 미발급 → 모든 조회는 내장 시드로 폴백한다. 가짜 응답을 만들지 않는다.
// 연동 절차와 엔드포인트는 docs/API_연동_가이드.md 참조. 키 발급 후 이 파일의 fetch 구현만 채우면 된다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiApi = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const KEYS_STORAGE = "mapsi.api.keys"; // { careernet: "...", work24: "..." }

  const PROVIDERS = {
    careernet: { name: "커리어넷 오픈API", portal: "https://www.career.go.kr/cnet/front/openapi/openApiMainCenter.do", scope: "직업백과·학과정보·진로심리검사" },
    work24: { name: "한국고용정보원 오픈API(공공데이터포털)", portal: "https://www.data.go.kr", scope: "직업정보·임금·전망·심리검사" },
  };

  function getKeys(storage) {
    try { return JSON.parse((storage || localStorage).getItem(KEYS_STORAGE)) || {}; } catch { return {}; }
  }

  function hasKey(provider, storage) {
    return !!getKeys(storage)[provider];
  }

  // 직업 상세(임금 분포 등) 조회 — 키가 없으면 명시적으로 시드 폴백을 알린다
  async function fetchJobDetail(jobName, storage) {
    if (!hasKey("work24", storage)) {
      return { source: "seed", available: false, reason: "API 키 미발급 — 가이드 참조" };
    }
    // TODO(키 발급 후): 고용24/한국고용정보원 직업정보 API 호출 구현
    return { source: "api", available: false, reason: "호출 구현 전" };
  }

  return { PROVIDERS, KEYS_STORAGE, getKeys, hasKey, fetchJobDetail };
});
