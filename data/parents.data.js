// 부모 대화 카드 시드 — 걱정 유형별 데이터 카드 + 대화 질문 + 부모 공유용 다국어 요약
// 원칙: 설득 스크립트가 아니라 '같은 자료 보기'. 부모 비난·일반화 금지. 수치는 검증분만(칩 필수).
// 다국어 요약: 쉬운 한국어·영어·중국어·베트남어 — I1("부모님이 한국 입시를 잘 모르셔서") 직결.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_PARENTS_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
    intro: "부모님을 이기는 대화가 아니라, 같은 자료를 보는 대화로 바꿔봐요. 걱정의 정체부터 골라요.",
    worries: [
      {
        id: "stability", label: "\"안정적인 게 최고야\"",
        parentLine: "불안한 시대에 안정을 바라는 건 자연스러운 걱정이에요. 걱정의 방향은 같아요 — 잘 사는 것.",
        facts: [
          { text: "고등학생의 대학 진학 희망은 64.9%까지 내려왔어요. '안정으로 가는 문'이 하나이던 시대가 지나가는 중이에요.", chip: { grade: "①", label: "교육부·KRIVET 2025" } },
          { text: "청년 취업자의 절반 가까이(49.1%)는 전공과 다른 일을 해요. 한 번의 선택이 평생을 정하지 않아요.", chip: { grade: "①", label: "통계청 2025" } },
        ],
        bridge: "부모님의 지도(평생직장)와 지금 지도(여러 경로)는 둘 다 그 시대에 합리적이었어요. (→ 렌즈 ③ 고용 vs 프로젝트)",
        questions: ["부모님은 첫 직장을 어떻게 고르셨어요?", "그때 제일 걱정됐던 건 뭐였어요?", "지금 제 진로에서 제일 걱정되는 건 뭐예요?"],
      },
      {
        id: "income", label: "\"돈 잘 버는 일을 해야지\"",
        parentLine: "수입 걱정은 현실적인 사랑이에요. 사실 또래들도 같은 생각이에요.",
        facts: [
          { text: "청소년 직업 선택 기준 1위도 수입(39.3%)이에요. 부모님과 제 기준이 크게 다르지 않아요.", chip: { grade: "①", label: "청소년 통계 2026" } },
          { text: "비용 걱정은 지원 제도와 같이 보면 달라져요. 국가장학금은 기초·차상위 등록금 전액, 구간에 따라 연 600만 원까지 지원돼요.", chip: { grade: "②", label: "한국장학재단·정부24 2026" } },
        ],
        bridge: "같은 연봉도 근무시간·안정성에 따라 체감이 완전히 달라요. 조건 카드를 같이 보면 대화가 구체적으로 변해요.",
        questions: ["수입 말고 하나만 더 고른다면, 부모님은 뭘 보시겠어요?", "제가 관심 있는 직업의 조건 카드를 같이 봐주실래요?", "이 직업의 어떤 부분이 제일 걱정되세요?"],
      },
      {
        id: "info", label: "\"그 직업은 잘 몰라서 걱정돼\"",
        parentLine: "모르는 길이라 걱정되는 거예요. 그건 반대가 아니라 정보가 필요하다는 신호예요.",
        facts: [
          { text: "마이드림의 조건 카드는 경로·조건·구조를 출처 등급(①국가통계~④경험)과 함께 보여줘요. 좋은 면만 보여주지 않아요." },
          { text: "직업별 임금·전망 원자료는 고용24(고용노동부)에서 함께 확인할 수 있어요.", chip: { grade: "②", label: "고용24" } },
        ],
        bridge: "의견 대 의견은 안 끝나요. 같은 화면을 보면 대화가 짧아져요.",
        questions: ["이 직업에 대해 제일 궁금한 게 뭐예요?", "10분만 같이 조건 카드를 봐주실래요?", "보고 나서도 걱정되는 게 있다면 뭐예요?"],
      },
      {
        id: "grades", label: "\"일단 성적부터 올려\"",
        parentLine: "부모님 세대에게 성적은 걱정을 표현하는 거의 유일한 언어였어요. 서운함은 당연하지만, 번역이 가능해요.",
        facts: [
          { text: "내신이 5등급제로 바뀌는 등 평가 방식 자체가 달라지는 중이에요. '성적'의 의미도 부모님 때와 달라요.", chip: { grade: "②", label: "교육부 내신 개편" } },
          { text: "같은 직업으로 가는 문은 보통 하나가 아니에요. 성적이 덜 중요한 문도 있고, 다른 준비가 필요한 문도 있어요." },
        ],
        bridge: "성적 대화를 진로 대화로 바꾸는 건 제가 먼저 화제를 여는 것으로 시작돼요.",
        questions: ["요즘 저는 이런 분야가 궁금한데, 들어보실래요?", "성적이 걱정되는 진짜 이유는 뭐예요?", "제가 스스로 알아보고 있다는 걸 뭘 보면 믿으시겠어요?"],
      },
    ],

    // 부모 공유용 요약 카드 (다국어) — 짧고 쉬운 문장만
    shareCard: {
      langs: [
        { id: "ko", label: "쉬운 한국어" },
        { id: "en", label: "English" },
        { id: "zh", label: "中文" },
        { id: "vi", label: "Tiếng Việt" },
      ],
      texts: {
        ko: {
          title: "부모님께 — '마이드림' 소개",
          body: [
            "마이드림은 아이의 진로 탐색을 돕는 무료 앱이에요.",
            "직업을 정해 주지 않아요. 아이가 자기 신호(좋아하는 것, 잘하는 것)를 모으게 도와요.",
            "정보에는 출처를 붙이고, 좋은 면만 보여주지 않아요.",
            "아이와 같은 화면을 보면서 이야기해 보세요.",
            "이렇게 물어봐 주세요: \"요즘 어떤 분야가 궁금해?\"",
          ],
        },
        en: {
          title: "For Parents — About '마이드림' (My Dream)",
          body: [
            "'마이드림' (My Dream) is a free app that helps your child explore careers.",
            "It does not choose a job for them. It helps them collect signals about what fits.",
            "All information shows its source, including the difficult parts.",
            "Please talk with your child while looking at the same screen.",
            "Try asking: \"What field are you curious about these days?\"",
          ],
        },
        zh: {
          title: "致家长 — 关于'마이드림'(我的梦想)",
          body: [
            "'마이드림'是一款帮助孩子探索职业方向的免费应用。",
            "它不会替孩子选择职业，而是帮助孩子了解自己。",
            "所有信息都注明出处，也不回避不利的信息。",
            "请和孩子一起看同一个页面聊一聊。",
            "可以这样问：\"最近你对什么领域感兴趣？\"",
          ],
        },
        vi: {
          title: "Gửi phụ huynh — Về '마이드림' (My Dream)",
          body: [
            "'마이드림' là ứng dụng miễn phí giúp con bạn khám phá nghề nghiệp.",
            "Ứng dụng không chọn nghề thay con, mà giúp con hiểu bản thân mình.",
            "Mọi thông tin đều ghi rõ nguồn, kể cả những điều khó khăn.",
            "Hãy cùng con xem một màn hình và trò chuyện.",
            "Hãy thử hỏi: \"Dạo này con quan tâm đến lĩnh vực nào?\"",
          ],
        },
      },
    },
  };
});
