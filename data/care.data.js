// 안심 DB — 위기 감지 키워드 + 공식 도움 창구 (공공 상시 운영 창구만 수록)
// 원칙(답변엔진 부록): 앱은 판단·상담을 시도하지 않는다. 연결만 한다.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_CARE_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    // 감지는 공백 제거 후 부분 일치. 과잉 감지가 과소 감지보다 안전하다(화면에서 되돌아가기 제공).
    crisisKeywords: [
      // 죽음·자해·"사라지고 싶다" 계열
      "죽고싶", "죽을래", "죽어버리", "자살", "자해", "손목그", "손목긋",
      "사라지고싶", "없어지고싶", "살기싫", "살고싶지않", "그만살", "살맛이없", "살아야하는이유없",
      // 폭력·학대·괴롭힘 피해 호소 계열
      "때리", "때려", "때렸", "맞았", "맞고있", "맞고살", "폭행", "폭력", "학대",
      "괴롭", "왕따", "따돌림", "성폭", "성추행", "성희롱",
      // 심각한 가정 위기
      "가출", "집나가고싶", "집에들어가기무서",
    ],

    // 즉시 연결 (위기 화면 최상단)
    primary: {
      name: "청소년상담 1388",
      contact: "1388",
      how: "전화·문자 1388",
      hours: "24시간, 연중무휴",
      desc: "어떤 이야기든 들어줘요. 이름을 말하지 않아도 돼요.",
      chat: { label: "채팅으로 상담하기 (청소년사이버상담센터)", url: "https://www.cyber1388.kr" },
    },

    // 상황별 도움 창구 (안심 DB)
    situations: [
      {
        id: "mind", title: "마음이 많이 무거울 때",
        lines: [
          { name: "청소년상담 1388", contact: "1388", note: "전화·문자, 24시간" },
          { name: "자살예방 상담전화", contact: "109", note: "24시간" },
          { name: "정신건강 위기상담", contact: "1577-0199", note: "24시간" },
          { name: "청소년사이버상담센터", contact: null, note: "채팅 상담, cyber1388.kr", url: "https://www.cyber1388.kr" },
        ],
      },
      {
        id: "violence", title: "폭력·괴롭힘을 겪고 있을 때",
        lines: [
          { name: "학교폭력 신고·상담", contact: "117", note: "24시간" },
          { name: "긴급할 때", contact: "112", note: "경찰" },
          { name: "여성긴급전화 (가정폭력·성폭력)", contact: "1366", note: "24시간" },
          { name: "청소년상담 1388", contact: "1388", note: "어디로 가야 할지 모르겠으면 여기부터" },
        ],
      },
      {
        id: "work", title: "알바·일터에서 문제가 생겼을 때",
        lines: [
          { name: "고용노동부 상담센터", contact: "1350", note: "임금·근로계약 상담" },
          { name: "청소년근로권익센터", contact: "1644-3119", note: "청소년 알바 무료 상담" },
        ],
      },
      {
        id: "outside", title: "학교 밖에서 도움이 필요할 때",
        lines: [
          { name: "꿈드림 (학교밖청소년지원센터)", contact: null, note: "kdream.or.kr — 검정고시·진로·건강 지원", url: "https://www.kdream.or.kr" },
          { name: "청소년상담 1388", contact: "1388", note: "가까운 센터를 연결해줘요" },
        ],
      },
    ],
  };
});
