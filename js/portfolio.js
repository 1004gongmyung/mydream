// 포트폴리오 로직 (Deep Module) — 활동 기록 수집과 문장 초안 생성
// 설계 근거: 생기부 500자 축소 → "많이 쌓기"가 아니라 "핵심 3개 큐레이션 + 문장 초안"
// 인터페이스: collectRecords(stores, datasets) / draftFor(record) / combinedDraft(records)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiPortfolio = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const MAX_PICK = 3; // 핵심 큐레이션 상한

  function collectRecords(stores, datasets) {
    const out = [];
    const quests = stores.quests || {};
    for (const [mid, done] of Object.entries(quests)) {
      const m = datasets.QUEST.missions.find((x) => x.id === mid);
      if (!m) continue;
      out.push({ key: "q:" + mid, type: "탐험", date: done.date || "", label: m.title, detail: done.note || "" });
    }
    (stores.journal || []).forEach((en, i) => {
      out.push({ key: "j:" + i, type: "몰입", date: en.date, label: en.text, detail: "" });
    });
    for (const [cid, ans] of Object.entries(stores.lensAnswers || {})) {
      const c = datasets.LENS.dailyCards.find((x) => x.id === cid);
      if (!c) continue;
      out.push({ key: "l:" + cid, type: "생각", date: "", label: c.title, detail: ans });
    }
    // 최신 먼저 (날짜 없는 항목은 뒤로)
    return out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function draftFor(r) {
    if (r.type === "탐험") {
      return r.detail
        ? `'${r.label}' 활동을 직접 해 보며 '${r.detail}'라는 것을 발견했다.`
        : `'${r.label}' 활동을 직접 해 보았다.`;
    }
    if (r.type === "몰입") return `'${r.label}' 순간에 시간 가는 줄 모르고 몰입한 경험이 있다.`;
    if (r.type === "생각") {
      return r.detail
        ? `'${r.label}'라는 주제를 접하고 '${r.detail}'라고 생각을 정리해 보았다.`
        : `'${r.label}'라는 주제로 생각을 정리해 보았다.`;
    }
    return `${r.label}`;
  }

  function combinedDraft(records) {
    if (!records.length) return "";
    const body = records.map(draftFor).join(" ");
    return body + " 이 경험들을 이어 ______ 분야를 더 알아보는 중이다.";
  }

  return { MAX_PICK, collectRecords, draftFor, combinedDraft };
});
