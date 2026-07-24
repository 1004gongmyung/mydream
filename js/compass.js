// 나침반 로직 (Deep Module) — 축 선택 → 직업군 가설 순위
// 인터페이스: scoreClusters(data, picks) / lensLineFor(data, picks) / matchedAxes(data, cluster, picks)
// picks: { rhythm: "L"|"R"|null, ... } — null = 건너뜀(무응답도 존중)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiCompass = factory();
})(typeof self !== "undefined" ? self : this, function () {
  const RESULT_MIN = 6; // 개발참고자료 §6: 부합 직업군 6~10개

  function matchedAxes(data, cluster, picks) {
    return data.axes.filter((ax) => {
      const want = cluster.vector[ax.key];
      return want && picks[ax.key] && picks[ax.key] === want;
    });
  }

  function scoreClusters(data, picks) {
    const scored = data.clusters.map((c) => {
      const matched = matchedAxes(data, c, picks);
      return { cluster: c, score: matched.length, matched };
    });
    // 점수 내림차순, 동점은 데이터 순서 유지(결정적)
    scored.sort((a, b) => b.score - a.score);
    // 상위 6개는 항상 제시(가설 폭 유지), 그 밖에는 1점 이상만
    return scored.filter((s, i) => i < RESULT_MIN || s.score > 0).slice(0, 10);
  }

  function lensLineFor(data, picks) {
    for (const rule of data.lensLines) {
      const keys = Object.keys(rule.when);
      if (keys.every((k) => picks[k] === rule.when[k])) return rule.line;
    }
    return null; // 렌즈는 조미료 — 해당 없으면 침묵
  }

  function pickedSummary(data, picks) {
    return data.axes
      .filter((ax) => picks[ax.key])
      .map((ax) => (picks[ax.key] === "L" ? ax.left : ax.right));
  }

  return { RESULT_MIN, scoreClusters, lensLineFor, matchedAxes, pickedSummary };
});
