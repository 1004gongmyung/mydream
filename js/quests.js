// 퀘스트 로직 (Deep Module) — 진행 집계와 편성 규칙
// 인터페이스: progressBySkill(data, doneMap) / missionById(data, id) / emergingRatio(data)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MapsiQuests = factory();
})(typeof self !== "undefined" ? self : this, function () {
  function progressBySkill(data, doneMap) {
    return data.skills.map((skill) => {
      const missions = data.missions.filter((m) => m.skill === skill.id);
      const done = missions.filter((m) => doneMap && doneMap[m.id]).length;
      return { skill, total: missions.length, done };
    });
  }

  function missionById(data, id) {
    return data.missions.find((m) => m.id === id) || null;
  }

  // 편성 규칙 검증용 — 강소·신기술 미션 비율 (UI에 노출하지 않는다)
  function emergingRatio(data) {
    const n = data.missions.filter((m) => m.tag === "emerging").length;
    return n / data.missions.length;
  }

  return { progressBySkill, missionById, emergingRatio };
});
