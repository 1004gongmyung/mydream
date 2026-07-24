// 탐험 퀘스트 시드 (모듈 C) — Krumboltz 5역량 + 관찰(렌즈) 미션
// 완료 조건은 언제나 "앱 밖에서 하고 와서" 셀프 인증. 금전 보상 없음.
// tag "emerging" = 강소기업·신기술 계열 (편성 규칙: 전체의 40% 이상 — 사용자에게 비율을 언급하지 않는다)
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_QUEST_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    skills: [
      { id: "curiosity", name: "호기심" },
      { id: "grit", name: "끈기" },
      { id: "flex", name: "유연성" },
      { id: "optimism", name: "낙관" },
      { id: "venture", name: "모험심" },
      { id: "observe", name: "관찰" },
    ],
    missions: [
      { id: "c1", skill: "curiosity", tag: "core", title: "처음 듣는 직업 검색하기",
        action: "처음 듣는 직업 1개를 검색하고, 그 직업인에게 묻고 싶은 질문 1개를 적어와요." },
      { id: "c2", skill: "curiosity", tag: "emerging", title: "숨은 세계 상위 기업 찾기",
        action: "세계 시장 상위인데 이름은 낯선 한국 회사 1곳을 검색해서, 뭘 만드는 회사인지 알아와요." },
      { id: "c3", skill: "curiosity", tag: "emerging", title: "낯선 기술 단어 하나 뜯어보기",
        action: "뉴스에 나오는 기술 단어 1개(로봇·배터리·우주 등)를 골라 영상 하나를 보고, 새로 안 것 1개를 적어와요." },
      { id: "g1", skill: "grit", tag: "core", title: "한 번 더 해보기",
        action: "지난주에 재밌었던 일 하나를 이번 주에 한 번 더 해보고, 여전히 재밌는지 확인해요." },
      { id: "g2", skill: "grit", tag: "core", title: "딱 5분만 다시",
        action: "지루해서 접었던 일을 딱 5분만 다시 해보고, 지난번과 달라진 점을 적어요." },
      { id: "f1", skill: "flex", tag: "core", title: "안 보던 분야 3개 보기",
        action: "평소 안 보던 분야의 영상 3개를 보고, 제일 의외였던 것 1개를 적어요." },
      { id: "f2", skill: "flex", tag: "emerging", title: "옆 직업 찾기",
        action: "관심 산업(게임·AI·콘텐츠 등)에서 유명한 직업 말고 '옆에서 같이 일하는 직업' 1개를 찾아와요." },
      { id: "o1", skill: "optimism", tag: "core", title: "작은 잘한 일 적기",
        action: "오늘 잘한 일 1개를 적어요. 아주 작아도 돼요." },
      { id: "o2", skill: "optimism", tag: "core", title: "실패에서 건진 것",
        action: "잘 안 됐지만 배운 게 있었던 경험 1개를 적어요." },
      { id: "v1", skill: "venture", tag: "core", title: "체험처 찾아 신청 방법까지",
        action: "안 가본 체험처 1곳을 찾아 신청 방법까지 확인해요. 체험 지도에서 시작해도 돼요." },
      { id: "v2", skill: "venture", tag: "core", title: "질문 하나 보내기",
        action: "직업인이나 선배에게 질문 1개를 보내요. 댓글, 메일, DM 어디든요." },
      { id: "v3", skill: "venture", tag: "emerging", title: "가까운 메이커스페이스 찾기",
        action: "메이크올(makeall.com)에서 가까운 메이커스페이스를 찾고, 뭘 만들 수 있는지 봐와요." },
      { id: "b1", skill: "observe", tag: "core", title: "돈의 길 추적하기",
        action: "오늘 산 것 하나를 골라, 낸 돈이 누구에게 얼마씩 갈지 추적해봐요." },
      { id: "b2", skill: "observe", tag: "emerging", title: "무료 앱의 비밀",
        action: "무료 앱 3개를 골라, 각각 뭘로 돈을 버는지 찾아봐요." },
      { id: "b3", skill: "observe", tag: "emerging", title: "강소기업 탐구 카드 완성",
        action: "세계 점유율 상위인 한국 강소기업 1곳을 골라 '무엇을·어디에·왜 강한가' 세 줄 탐구 카드를 완성해요." },
    ],
  };
});
