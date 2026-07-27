// 생성물 — 손으로 고치지 말 것. 원본: data/alternative_schools.seed.csv → node tools/load-alt-schools.mjs
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.MAPSI_ALTSCHOOLS_DATA = factory();
})(typeof self !== "undefined" ? self : this, function () {
  return {
  "builtFrom": "alternative_schools.seed.csv",
  "allSample": true,
  "schools": [
    {
      "id": "sample-spec-high",
      "name": "(샘플) 푸른숲대안고등학교",
      "legal_status": "SPECIALIZED_HIGH",
      "accredits_diploma": true,
      "detail_tier": 1,
      "school_levels": [
        "HIGH"
      ],
      "region_sido": "경기",
      "region_sigungu": "가온시",
      "address": "경기 가온시 배움로 12 (가상 주소)",
      "lat": null,
      "lng": null,
      "is_boarding": true,
      "accepts_entrustment": false,
      "annual_tuition_krw": 3600000,
      "tuition_note": "기숙사비 별도 — 면담 시 안내",
      "capacity": 60,
      "admission_period": "매년 10~11월",
      "characteristics": [
        "ECO",
        "GENERAL"
      ],
      "religious_affiliation": null,
      "contact_phone": "000-0000-0000",
      "website": "https://example.com/sample",
      "source_name": "샘플 데이터(실제 학교 아님)",
      "source_url": "https://www.alter-edu.re.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "sample-entrusted",
      "name": "(샘플) 이음위탁교육센터",
      "legal_status": "ENTRUSTED",
      "accredits_diploma": true,
      "detail_tier": 1,
      "school_levels": [
        "HIGH"
      ],
      "region_sido": "부산",
      "region_sigungu": "바다구",
      "address": "부산 바다구 이음로 5 (가상 주소)",
      "lat": null,
      "lng": null,
      "is_boarding": false,
      "accepts_entrustment": true,
      "annual_tuition_krw": null,
      "tuition_note": "원적교 학적 유지 — 수업료는 공교육 기준",
      "capacity": 40,
      "admission_period": "수시(원적교 협의)",
      "characteristics": [
        "READJUSTMENT"
      ],
      "religious_affiliation": null,
      "contact_phone": "000-0000-0000",
      "website": null,
      "source_name": "샘플 데이터(실제 학교 아님)",
      "source_url": "https://www.alter-edu.re.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "sample-registered",
      "name": "(샘플) 하늘씨앗배움터",
      "legal_status": "REGISTERED",
      "accredits_diploma": false,
      "detail_tier": 2,
      "school_levels": [
        "MIDDLE",
        "HIGH"
      ],
      "region_sido": "서울",
      "region_sigungu": "마루구",
      "address": "서울 마루구 새길 34 (가상 주소)",
      "lat": null,
      "lng": null,
      "is_boarding": null,
      "accepts_entrustment": null,
      "annual_tuition_krw": null,
      "tuition_note": null,
      "capacity": null,
      "admission_period": null,
      "characteristics": [],
      "religious_affiliation": null,
      "contact_phone": null,
      "website": null,
      "source_name": "샘플 데이터(실제 학교 아님)",
      "source_url": "https://www.alter-edu.re.kr",
      "verified_at": "2026-07-27"
    }
  ]
};
});
