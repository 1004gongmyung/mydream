// 생성물 — 손으로 고치지 말 것. 원본: data/clergy_*.seed.csv → node tools/load-clergy.mjs
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_CLERGY_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
  "builtFrom": [
    "clergy_paths.seed.csv",
    "clergy_stages.seed.csv",
    "training_institutions.seed.csv",
    "exploratory_steps.seed.csv"
  ],
  "allSample": true,
  "guard": {
    "required": [
      "PROTESTANT",
      "CATHOLIC",
      "BUDDHIST"
    ],
    "missing": [
      "PROTESTANT",
      "CATHOLIC",
      "BUDDHIST"
    ],
    "visible": false
  },
  "paths": [
    {
      "id": "sample-prot-pastor",
      "religion": "PROTESTANT",
      "denomination": "(샘플) 한빛교단",
      "role_name": "목사",
      "summary": "교인들의 예배를 인도하고 상담과 교육을 맡는 사람이에요. 설교 준비와 심방(가정 방문)이 일과의 큰 부분이에요. 행정과 재정 관리도 실제 업무에 들어가요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "(샘플) 한빛교단 총회 교육국",
      "official_contact_phone": "000-0000-0000",
      "official_contact_url": "https://example.com/sample",
      "reality_notes": "교단마다 인준하는 신학교가 달라요. 어느 신학대학원을 나왔는지가 아니라 내 교단이 그 학교를 인준하는지가 안수의 조건이에요.",
      "source_name": "샘플 데이터(실제 교단 아님)",
      "source_url": "https://example.com/sample",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "sample-prot-s1",
          "step_order": 1,
          "name": "신학대학원(교단 인준교)",
          "typical_duration": "3년",
          "prerequisites": "4년제 학사 학위",
          "is_reversible": true,
          "reversibility_note": "중도에 그만두면 이수 학점과 학위 과정 기록이 남아요. 다른 진로로 옮길 수 있어요."
        },
        {
          "id": "sample-prot-s2",
          "step_order": 2,
          "name": "목사 안수",
          "typical_duration": null,
          "prerequisites": "교단별 고시·수련 과정",
          "is_reversible": false,
          "reversibility_note": "안수는 교단 제도상 되돌리기 어려운 단계예요. 안수 전 단계까지는 언제든 진로를 바꿀 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "sample-prot-e1",
          "name": "교단 공식 진로 상담 받아보기",
          "description": "교단 총회의 진로 담당 부서에 전화나 방문으로 상담을 신청해요. 결정이 아니라 질문하러 가는 자리예요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": "https://example.com/sample"
        },
        {
          "id": "sample-prot-e2",
          "name": "신학교 공개 강좌 참관",
          "description": "인준 신학교가 여는 공개 강좌나 입시 설명회를 들어봐요. 어떤 공부를 하게 되는지 미리 볼 수 있어요.",
          "min_age": 14,
          "requires_guardian_consent": true,
          "duration": "반나절",
          "official_contact_url": null
        }
      ]
    },
    {
      "id": "sample-budd-monk",
      "religion": "BUDDHIST",
      "denomination": "(샘플) 한빛종단",
      "role_name": "비구·비구니",
      "summary": "수행과 의례를 담당하고 신도들의 상담을 맡는 사람이에요. 사찰 운영과 교육 활동도 함께 해요. 공동체 생활이 일과의 기본이에요.",
      "min_entry_age": 13,
      "is_open_to_minors": true,
      "official_contact_name": "(샘플) 한빛종단 교육원",
      "official_contact_phone": "000-0000-0000",
      "official_contact_url": "https://example.com/sample",
      "reality_notes": "출가 전 행자 기간은 되돌릴 수 있지만, 수계 이후는 제도적으로 되돌리기 어려워요. 단계마다 되돌림 가능 여부를 확인하고 결정해요.",
      "source_name": "샘플 데이터(실제 종단 아님)",
      "source_url": "https://example.com/sample",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "sample-budd-s1",
          "step_order": 1,
          "name": "행자 생활",
          "typical_duration": "6개월~1년",
          "prerequisites": "종단 상담 후 입산",
          "is_reversible": true,
          "reversibility_note": "행자 기간은 언제든 그만두고 일상으로 돌아갈 수 있어요. 기록이 남지 않아요."
        },
        {
          "id": "sample-budd-s2",
          "step_order": 2,
          "name": "수계(사미·사미니계)",
          "typical_duration": null,
          "prerequisites": "행자 과정 수료",
          "is_reversible": false,
          "reversibility_note": "수계 이후는 제도적으로 되돌리기 어려워요. 되돌릴 경우 종단 절차가 따로 필요해요."
        }
      ],
      "exploratory": [
        {
          "id": "sample-budd-e1",
          "name": "템플스테이 체험형 참가",
          "description": "주말 단기 프로그램으로 사찰의 하루를 겪어봐요. 언제든 집으로 돌아갈 수 있는 공식 프로그램이에요.",
          "min_age": 13,
          "requires_guardian_consent": true,
          "duration": "1박 2일",
          "official_contact_url": "https://example.com/sample"
        },
        {
          "id": "sample-budd-e2",
          "name": "종단 교육원 상담",
          "description": "출가 절차와 조건을 공식 창구에서 물어봐요. 상담만으로는 아무것도 확정되지 않아요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": null
        }
      ]
    }
  ],
  "institutions": [
    {
      "id": "sample-inst-approved",
      "religion": "PROTESTANT",
      "denomination": "(샘플) 한빛교단",
      "name": "(샘플) 한빛신학대학원대학교",
      "is_denomination_approved": true,
      "approving_body": "(샘플) 한빛교단 총회",
      "is_accredited_university": true,
      "degree_awarded": "신학석사(M.Div.)",
      "program_years": 3,
      "region_sido": "서울",
      "address": "(가상 주소)",
      "website": "https://example.com/sample",
      "source_name": "샘플 데이터(실제 기관 아님)",
      "source_url": "https://example.com/sample",
      "verified_at": "2026-07-27"
    },
    {
      "id": "sample-inst-unapproved",
      "religion": "PROTESTANT",
      "denomination": "(샘플) 한빛교단",
      "name": "(샘플) 새길신학교",
      "is_denomination_approved": false,
      "approving_body": null,
      "is_accredited_university": true,
      "degree_awarded": "신학사",
      "program_years": 4,
      "region_sido": "경기",
      "address": "(가상 주소)",
      "website": null,
      "source_name": "샘플 데이터(실제 기관 아님)",
      "source_url": "https://example.com/sample",
      "verified_at": "2026-07-27"
    },
    {
      "id": "sample-inst-nondegree",
      "religion": "BUDDHIST",
      "denomination": "(샘플) 한빛종단",
      "name": "(샘플) 한빛승가교육원",
      "is_denomination_approved": true,
      "approving_body": "(샘플) 한빛종단 교육원",
      "is_accredited_university": false,
      "degree_awarded": null,
      "program_years": 4,
      "region_sido": "부산",
      "address": "(가상 주소)",
      "website": null,
      "source_name": "샘플 데이터(실제 기관 아님)",
      "source_url": "https://example.com/sample",
      "verified_at": "2026-07-27"
    }
  ]
};
});
