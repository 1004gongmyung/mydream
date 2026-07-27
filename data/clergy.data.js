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
  "allSample": false,
  "guard": {
    "required": [
      "PROTESTANT",
      "CATHOLIC",
      "BUDDHIST"
    ],
    "missing": [],
    "visible": true
  },
  "paths": [
    {
      "id": "prot-tonghap",
      "religion": "PROTESTANT",
      "denomination": "대한예수교장로회(통합)",
      "role_name": "목사",
      "summary": "교회 공동체의 예배를 인도하고 설교·상담·교육을 맡는 사람이에요. 교인들의 삶의 중요한 순간(결혼·장례 등)에 함께해요. 교회 행정과 운영도 실제 업무의 큰 부분이에요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "대한예수교장로회총회(통합)",
      "official_contact_phone": null,
      "official_contact_url": "https://new.pck.or.kr",
      "reality_notes": "개신교는 교단마다 인준하는 신학교가 달라요 — 어느 신학대학원이든이 아니라 '내 교단이 인준한 학교'를 나와야 안수로 이어져요. 이 교단의 직영(인준) 신학대학은 장로회신학대 등 7곳이에요. 교단이 다르면 이 정보가 통째로 달라지니, 소속 교회가 어느 교단인지 확인하는 게 첫 순서예요.",
      "source_name": "대한예수교장로회총회(통합) 공식 안내(2026-07 확인)",
      "source_url": "https://new.pck.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "prot-s1",
          "step_order": 1,
          "name": "4년제 대학 졸업(전공 무관)",
          "typical_duration": "4년",
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "학사 과정은 어느 진로로든 이어져요."
        },
        {
          "id": "prot-s2",
          "step_order": 2,
          "name": "교단 인준 신학대학원(M.Div.)",
          "typical_duration": "3년",
          "prerequisites": "학사 학위",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위 과정 기록이 남고 다른 진로로 옮길 수 있어요."
        },
        {
          "id": "prot-s3",
          "step_order": 3,
          "name": "전도사 과정과 교단 고시",
          "typical_duration": null,
          "prerequisites": "신학대학원 과정",
          "is_reversible": true,
          "reversibility_note": "고시 전까지는 언제든 방향을 바꿀 수 있어요."
        },
        {
          "id": "prot-s4",
          "step_order": 4,
          "name": "목사 안수",
          "typical_duration": null,
          "prerequisites": "교단 고시 합격",
          "is_reversible": false,
          "reversibility_note": "안수는 교단 제도상 되돌리기 어려운 단계예요. 그 전 단계까지는 되돌릴 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "prot-e1",
          "name": "소속 교단 확인해보기",
          "description": "다니는(또는 아는) 교회가 어느 교단인지 물어봐요. 교단에 따라 인준 신학교와 과정이 통째로 달라져서 이게 첫 정보예요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "5분",
          "official_contact_url": null
        },
        {
          "id": "prot-e2",
          "name": "총회·신학대 입시 안내 읽어보기",
          "description": "교단 총회와 인준 신학대의 입학 안내를 읽어봐요. 결정이 아니라 정보 수집이에요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "반나절",
          "official_contact_url": "https://new.pck.or.kr"
        }
      ]
    },
    {
      "id": "cath-priest",
      "religion": "CATHOLIC",
      "denomination": "한국 천주교(교구 사제)",
      "role_name": "신부(사제)",
      "summary": "미사와 성사를 집전하고 신자들의 신앙생활과 상담을 돌보는 사람이에요. 교구에 소속되어 본당(성당)을 옮겨 다니며 일해요. 독신으로 사는 것이 제도의 일부예요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "한국천주교주교회의",
      "official_contact_phone": null,
      "official_contact_url": "https://www.cbck.or.kr",
      "reality_notes": "신학교 입학부터 사제 서품까지 통상 10년 안팎이 걸리는 긴 경로예요. 신학교(전국 교구별 7곳)는 소속 교구의 추천이 있어야 입학할 수 있어서, 본당 신부님·교구 사무국 상담이 공식 첫 단계예요. 서품 전 단계까지는 언제든 멈추고 다른 진로로 갈 수 있어요.",
      "source_name": "한국천주교주교회의(2026-07 확인)",
      "source_url": "https://www.cbck.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "cath-s1",
          "step_order": 1,
          "name": "교구 예비신학생 과정",
          "typical_duration": null,
          "prerequisites": "소속 본당·교구 안내",
          "is_reversible": true,
          "reversibility_note": "중·고생 대상 모임으로 참여만으로는 아무것도 확정되지 않아요."
        },
        {
          "id": "cath-s2",
          "step_order": 2,
          "name": "신학대학 입학·수학",
          "typical_duration": "군복무 포함 통상 10년 안팎",
          "prerequisites": "고졸·소속 교구 추천",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위 과정이 남아요. 실제로 다른 진로로 옮기는 사람들이 있어요."
        },
        {
          "id": "cath-s3",
          "step_order": 3,
          "name": "부제 서품",
          "typical_duration": null,
          "prerequisites": "신학 과정 수료",
          "is_reversible": false,
          "reversibility_note": "서품은 교회 제도상 되돌리기 어려운 단계예요."
        },
        {
          "id": "cath-s4",
          "step_order": 4,
          "name": "사제 서품",
          "typical_duration": null,
          "prerequisites": "부제 과정",
          "is_reversible": false,
          "reversibility_note": "서품 이후는 제도적으로 되돌리기 어려워요. 그 전 어느 단계에서든 멈출 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "cath-e1",
          "name": "교구 예비신학생 모임 알아보기",
          "description": "각 교구가 사제직에 관심 있는 중·고생 모임을 운영해요. 본당 사무실에 묻는 게 공식 경로예요.",
          "min_age": null,
          "requires_guardian_consent": true,
          "duration": "정기 모임",
          "official_contact_url": "https://www.cbck.or.kr"
        },
        {
          "id": "cath-e2",
          "name": "본당 신부님과 진로 상담",
          "description": "결정이 아니라 질문하러 가는 자리예요. 과정·조건을 직접 들어봐요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": null
        }
      ]
    },
    {
      "id": "budd-jogye",
      "religion": "BUDDHIST",
      "denomination": "대한불교조계종",
      "role_name": "스님(비구·비구니)",
      "summary": "수행과 의례를 담당하고 신도 교육·상담과 사찰 운영을 맡는 사람이에요. 공동체 생활과 수행이 일과의 기본이에요.",
      "min_entry_age": 13,
      "is_open_to_minors": true,
      "official_contact_name": "대한불교조계종 출가 상담",
      "official_contact_phone": "1666-7987",
      "official_contact_url": "http://monk.buddhism.or.kr",
      "reality_notes": "출가 자격은 만 13세~50세이고 구족계(정식 승려의 계)를 받으려면 만 20세 이상·고졸 이상이 필요해요. 행자 기간은 언제든 돌아올 수 있지만 수계 이후는 절차 없이 되돌리기 어려워요. 미성년 출가에는 보호자 동의 등 별도 절차가 있어요 — 정확한 조건은 출가 상담 전화로 확인하는 게 순서예요.",
      "source_name": "대한불교조계종 출가 안내(2026-07 확인)",
      "source_url": "http://monk.buddhism.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "budd-s1",
          "step_order": 1,
          "name": "출가 상담·행자 생활",
          "typical_duration": "6개월~1년",
          "prerequisites": "만 13세~50세",
          "is_reversible": true,
          "reversibility_note": "행자 기간은 언제든 그만두고 일상으로 돌아갈 수 있어요."
        },
        {
          "id": "budd-s2",
          "step_order": 2,
          "name": "사미·사미니계 수지",
          "typical_duration": null,
          "prerequisites": "행자 과정 수료",
          "is_reversible": false,
          "reversibility_note": "수계 이후는 종단 절차 없이 되돌리기 어려워요. 결정 전 단계에서 충분히 확인해요."
        },
        {
          "id": "budd-s3",
          "step_order": 3,
          "name": "기본교육 과정",
          "typical_duration": "4년",
          "prerequisites": "사미·사미니계",
          "is_reversible": true,
          "reversibility_note": "교육 과정 자체는 중단할 수 있어요. 수계 상태는 별개예요."
        },
        {
          "id": "budd-s4",
          "step_order": 4,
          "name": "구족계(비구·비구니계) 수지",
          "typical_duration": null,
          "prerequisites": "만 20세 이상·고졸 이상",
          "is_reversible": false,
          "reversibility_note": "정식 승려가 되는 단계로 제도상 되돌리기 어려워요."
        }
      ],
      "exploratory": [
        {
          "id": "budd-e1",
          "name": "템플스테이 체험 참가",
          "description": "사찰의 하루를 1박 2일로 겪어보고 언제든 돌아와요. 종단 산하 공식 프로그램이에요.",
          "min_age": null,
          "requires_guardian_consent": true,
          "duration": "1박 2일",
          "official_contact_url": "https://www.templestay.com"
        },
        {
          "id": "budd-e2",
          "name": "출가 상담 전화 걸어보기",
          "description": "상담만으로는 아무것도 확정되지 않아요. 조건과 절차를 공식 창구에서 들어봐요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": "http://monk.buddhism.or.kr"
        }
      ]
    },
    {
      "id": "won-gyomu",
      "religion": "WON_BUDDHIST",
      "denomination": "원불교",
      "role_name": "교무",
      "summary": "교당에서 법회와 교화·상담을 맡는 원불교의 성직자예요. 교육·복지·문화 기관에서 일하는 교무도 있어요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "원불교 교정원",
      "official_contact_phone": null,
      "official_contact_url": "https://www.won.or.kr",
      "reality_notes": "전무출신(성직) 지원 심사를 거쳐 예비교무 학부 4년과 대학원 2년, 두 차례 자격 검정을 통과해야 교무가 돼요. 과정이 정해져 있는 만큼 학부 입학 전에 교당·교정원 상담으로 조건을 확인하는 게 순서예요. 출가식 전까지는 다른 진로로 옮길 수 있어요.",
      "source_name": "원불교 교정원·원광대 원불교학과(2026-07 확인)",
      "source_url": "https://www.won.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "won-s1",
          "step_order": 1,
          "name": "전무출신 지원·심사",
          "typical_duration": null,
          "prerequisites": "교무 추천",
          "is_reversible": true,
          "reversibility_note": "심사는 지원 절차일 뿐이라 언제든 철회할 수 있어요."
        },
        {
          "id": "won-s2",
          "step_order": 2,
          "name": "예비교무 학부 과정",
          "typical_duration": "4년",
          "prerequisites": "전무출신 심사 통과",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위가 남아요."
        },
        {
          "id": "won-s3",
          "step_order": 3,
          "name": "대학원 과정과 자격 검정",
          "typical_duration": "2년",
          "prerequisites": "학부 과정·1차 검정",
          "is_reversible": true,
          "reversibility_note": "검정 전까지는 방향을 바꿀 수 있어요."
        },
        {
          "id": "won-s4",
          "step_order": 4,
          "name": "출가식·교무 임명",
          "typical_duration": null,
          "prerequisites": "2차 자격 검정 합격",
          "is_reversible": false,
          "reversibility_note": "출가식 이후는 제도상 되돌리기 어려워요."
        }
      ],
      "exploratory": [
        {
          "id": "won-e1",
          "name": "교당 진로 상담",
          "description": "가까운 교당 교무에게 과정을 물어봐요. 추천 제도가 있어서 상담이 공식 첫 단계예요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": "https://www.won.or.kr"
        },
        {
          "id": "won-e2",
          "name": "원불교학과 안내 읽어보기",
          "description": "예비교무 과정이 어떤 공부인지 학과 안내로 미리 봐요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "반나절",
          "official_contact_url": "https://wonbuddhism.wku.ac.kr"
        }
      ]
    },
    {
      "id": "angl-priest",
      "religion": "PROTESTANT",
      "denomination": "대한성공회",
      "role_name": "사제",
      "summary": "예배(감사성찬례)를 집전하고 교회 공동체를 돌보는 사람이에요. 교구에 소속되어 일하고 결혼할 수 있어요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "대한성공회",
      "official_contact_phone": null,
      "official_contact_url": "https://anglicankr.church",
      "reality_notes": "4년제 학사를 마친 뒤 소속 교회·교구의 청원을 거쳐 성공회대 신학전문대학원 성직과정에 들어가는 구조예요. 견진(정식 신자 절차) 후 1년 이상 등 교회 내 조건이 있어서 교구 상담이 공식 첫 단계예요. 서품 전까지는 되돌릴 수 있어요.",
      "source_name": "대한성공회(2026-07 확인)",
      "source_url": "https://anglicankr.church",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "angl-s1",
          "step_order": 1,
          "name": "4년제 대학 졸업(전공 무관)",
          "typical_duration": "4년",
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "학사 과정은 어느 진로로든 이어져요."
        },
        {
          "id": "angl-s2",
          "step_order": 2,
          "name": "교구 청원·신학전문대학원 성직과정",
          "typical_duration": null,
          "prerequisites": "견진 후 1년 이상·소속 교구 청원",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위 과정이 남아요."
        },
        {
          "id": "angl-s3",
          "step_order": 3,
          "name": "부제 서품",
          "typical_duration": null,
          "prerequisites": "성직과정 수료",
          "is_reversible": false,
          "reversibility_note": "서품은 제도상 되돌리기 어려운 단계예요."
        },
        {
          "id": "angl-s4",
          "step_order": 4,
          "name": "사제 서품",
          "typical_duration": null,
          "prerequisites": "사제고시 합격",
          "is_reversible": false,
          "reversibility_note": "서품 이후는 되돌리기 어려워요. 그 전에는 언제든 멈출 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "angl-e1",
          "name": "교구 사무처 상담",
          "description": "성직 과정의 조건(견진·청원 등)을 공식 창구에서 확인해요. 상담은 결정이 아니에요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": "https://anglicankr.church"
        }
      ]
    },
    {
      "id": "prot-hapdong",
      "religion": "PROTESTANT",
      "denomination": "대한예수교장로회(합동)",
      "role_name": "목사",
      "summary": "교회 공동체의 예배를 인도하고 설교·상담·교육을 맡는 사람이에요. 교인들의 삶의 중요한 순간에 함께해요. 교회 행정과 운영도 실제 업무의 큰 부분이에요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "대한예수교장로회총회(합동)",
      "official_contact_phone": null,
      "official_contact_url": "https://www.gapck.org",
      "reality_notes": "이 교단의 인준 신학교는 총신대학교예요. 신학대학원 뒤 강도사고시와 강도사 1년, 노회 목사고시를 거쳐 안수를 받는 구조라 학부부터 통상 8년 안팎이 걸려요. 교단마다 인준 신학교와 과정이 다르니 소속 교회의 교단 확인이 첫 순서예요.",
      "source_name": "대한예수교장로회총회(합동) 공식 안내(2026-07 확인)",
      "source_url": "https://www.gapck.org",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "hapdong-s1",
          "step_order": 1,
          "name": "4년제 대학 졸업(전공 무관)",
          "typical_duration": "4년",
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "학사 과정은 어느 진로로든 이어져요."
        },
        {
          "id": "hapdong-s2",
          "step_order": 2,
          "name": "총신대 신학대학원(M.Div.)",
          "typical_duration": "3년",
          "prerequisites": "학사 학위",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위 과정 기록이 남아요."
        },
        {
          "id": "hapdong-s3",
          "step_order": 3,
          "name": "강도사고시·강도사 과정",
          "typical_duration": "1년",
          "prerequisites": "신학대학원 수료",
          "is_reversible": true,
          "reversibility_note": "고시와 수련 단계까지는 언제든 방향을 바꿀 수 있어요."
        },
        {
          "id": "hapdong-s4",
          "step_order": 4,
          "name": "노회 목사고시·목사 안수",
          "typical_duration": null,
          "prerequisites": "강도사 과정",
          "is_reversible": false,
          "reversibility_note": "안수는 교단 제도상 되돌리기 어려운 단계예요. 그 전까지는 되돌릴 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "hapdong-e1",
          "name": "소속 교단 확인해보기",
          "description": "다니는(또는 아는) 교회가 어느 교단인지 물어봐요. 교단에 따라 인준 신학교와 과정이 통째로 달라져요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "5분",
          "official_contact_url": null
        },
        {
          "id": "hapdong-e2",
          "name": "총회·신학대 입시 안내 읽어보기",
          "description": "교단 총회와 인준 신학교의 입학 안내를 읽어봐요. 결정이 아니라 정보 수집이에요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "반나절",
          "official_contact_url": "https://www.gapck.org"
        }
      ]
    },
    {
      "id": "prot-methodist",
      "religion": "PROTESTANT",
      "denomination": "기독교대한감리회",
      "role_name": "목사",
      "summary": "교회 공동체의 예배를 인도하고 설교·상담·교육을 맡는 사람이에요. 감리회는 목회자를 연회(지역 조직)가 파송하는 구조라 임지 이동이 제도의 일부예요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "기독교대한감리회 본부",
      "official_contact_phone": null,
      "official_contact_url": "https://www.kmc.or.kr",
      "reality_notes": "감리회가 인준하는 신학대학원은 감리교신학대·목원대·협성대 세 곳이에요. 인준 과정 수료 후 수련 과정과 연회 고시를 거쳐 안수를 받아요. 같은 개신교라도 교단마다 인준 학교가 다르니 소속 교회의 교단부터 확인해요.",
      "source_name": "기독교대한감리회 공식 안내(2026-07 확인)",
      "source_url": "https://www.kmc.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "meth-s1",
          "step_order": 1,
          "name": "4년제 대학 졸업(전공 무관)",
          "typical_duration": "4년",
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "학사 과정은 어느 진로로든 이어져요."
        },
        {
          "id": "meth-s2",
          "step_order": 2,
          "name": "인준 신학대학원(감신대·목원대·협성대)",
          "typical_duration": null,
          "prerequisites": "학사 학위",
          "is_reversible": true,
          "reversibility_note": "중도에 나오면 이수 학점·학위 과정 기록이 남아요."
        },
        {
          "id": "meth-s3",
          "step_order": 3,
          "name": "수련 과정·연회 고시",
          "typical_duration": null,
          "prerequisites": "인준 과정 수료",
          "is_reversible": true,
          "reversibility_note": "고시 전까지는 언제든 방향을 바꿀 수 있어요."
        },
        {
          "id": "meth-s4",
          "step_order": 4,
          "name": "목사 안수",
          "typical_duration": null,
          "prerequisites": "연회 고시 합격",
          "is_reversible": false,
          "reversibility_note": "안수는 교단 제도상 되돌리기 어려운 단계예요."
        }
      ],
      "exploratory": [
        {
          "id": "meth-e1",
          "name": "소속 교단 확인해보기",
          "description": "다니는(또는 아는) 교회가 어느 교단인지 물어봐요. 감리회라면 인준 신학대학원 세 곳이 후보가 돼요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "5분",
          "official_contact_url": null
        },
        {
          "id": "meth-e2",
          "name": "인준 신학대 안내 읽어보기",
          "description": "감신대·목원대·협성대의 입학 안내를 읽어봐요. 결정이 아니라 정보 수집이에요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "반나절",
          "official_contact_url": "https://www.kmc.or.kr"
        }
      ]
    },
    {
      "id": "cath-religious",
      "religion": "CATHOLIC",
      "denomination": "한국 천주교(수도회)",
      "role_name": "수녀·수사(수도자)",
      "summary": "수도회 공동체에 소속되어 기도와 공동생활을 중심으로 사는 사람이에요. 교육·의료·복지 등 수도회의 사명에 따라 다양한 현장에서 일해요. 사제(신부)와는 다른 길이고, 수녀는 여성·수사는 남성 수도자예요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "한국천주교주교회의(각 교구 성소 안내)",
      "official_contact_phone": null,
      "official_contact_url": "https://www.cbck.or.kr",
      "reality_notes": "수도회마다 영성과 하는 일, 입회 조건이 달라서 '어느 수도회인지'가 사실상의 진로 선택이에요. 지원기·청원기·수련기까지는 언제든 떠날 수 있고, 유기서원도 기한이 끝나면 갱신하지 않을 수 있어요. 종신서원부터 되돌리기 어려워요. 성소 모임 참여는 결정이 아니라 탐색이에요.",
      "source_name": "한국천주교주교회의·가톨릭신문 성소 안내(2026-07 확인)",
      "source_url": "https://www.cbck.or.kr",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "rel-s1",
          "step_order": 1,
          "name": "성소 모임·수도회 탐색",
          "typical_duration": null,
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "모임 참여는 탐색일 뿐 아무것도 확정되지 않아요."
        },
        {
          "id": "rel-s2",
          "step_order": 2,
          "name": "입회·지원기",
          "typical_duration": "6개월~1년",
          "prerequisites": "수도회별 입회 조건",
          "is_reversible": true,
          "reversibility_note": "지원기는 서로를 알아보는 기간이라 언제든 떠날 수 있어요."
        },
        {
          "id": "rel-s3",
          "step_order": 3,
          "name": "청원기",
          "typical_duration": "약 1년",
          "prerequisites": "지원기 수료",
          "is_reversible": true,
          "reversibility_note": "청원기까지는 자유롭게 되돌릴 수 있어요."
        },
        {
          "id": "rel-s4",
          "step_order": 4,
          "name": "수련기",
          "typical_duration": "2년",
          "prerequisites": "청원기 수료",
          "is_reversible": true,
          "reversibility_note": "수련기 중에도 떠날 수 있어요. 기록이 진로에 불이익으로 남지 않아요."
        },
        {
          "id": "rel-s5",
          "step_order": 5,
          "name": "유기서원",
          "typical_duration": "4~5년(갱신제)",
          "prerequisites": "수련기 수료",
          "is_reversible": true,
          "reversibility_note": "기한이 있는 서원이라 만료 때 갱신하지 않으면 떠날 수 있어요."
        },
        {
          "id": "rel-s6",
          "step_order": 6,
          "name": "종신서원",
          "typical_duration": null,
          "prerequisites": "유기서원기 수료",
          "is_reversible": false,
          "reversibility_note": "평생을 약속하는 서원이라 제도상 되돌리기 어려워요. 그 전 모든 단계에서는 떠날 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "rel-e1",
          "name": "교구 성소 모임 알아보기",
          "description": "각 교구와 수도회가 성소 모임을 운영해요. 본당 사무실에 묻는 게 공식 경로예요. 참여는 탐색이지 결정이 아니에요.",
          "min_age": null,
          "requires_guardian_consent": true,
          "duration": "정기 모임",
          "official_contact_url": "https://www.cbck.or.kr"
        },
        {
          "id": "rel-e2",
          "name": "수도회 소개 자료 읽어보기",
          "description": "수도회마다 영성과 하는 일이 달라요. 관심 있는 수도회의 공식 소개 자료부터 읽어봐요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "반나절",
          "official_contact_url": "https://www.cbck.or.kr"
        }
      ]
    },
    {
      "id": "islam-imam",
      "religion": "ISLAM",
      "denomination": "한국이슬람교중앙회",
      "role_name": "이맘",
      "summary": "모스크(성원)에서 예배를 인도하고 공동체의 교육과 상담을 맡는 사람이에요.",
      "min_entry_age": null,
      "is_open_to_minors": false,
      "official_contact_name": "한국이슬람교중앙회",
      "official_contact_phone": null,
      "official_contact_url": "http://www.koreaislam.org",
      "reality_notes": "국내에는 이맘을 양성하는 인가 교육기관이 없어요. 한국인 이맘은 대부분 해외 이슬람 대학 유학으로 과정을 밟았어요. 이 길에 관심이 있다면 한국이슬람교중앙회가 사실상 유일한 공식 상담 창구예요 — 유학 조건과 절차를 거기서 확인해요.",
      "source_name": "한국이슬람교중앙회(2026-07 확인)",
      "source_url": "http://www.koreaislam.org",
      "verified_at": "2026-07-27",
      "stages": [
        {
          "id": "islam-s1",
          "step_order": 1,
          "name": "중앙회 상담·공동체 활동",
          "typical_duration": null,
          "prerequisites": null,
          "is_reversible": true,
          "reversibility_note": "상담과 활동만으로는 아무것도 확정되지 않아요."
        },
        {
          "id": "islam-s2",
          "step_order": 2,
          "name": "해외 이슬람 대학 유학",
          "typical_duration": null,
          "prerequisites": "중앙회 상담으로 조건 확인",
          "is_reversible": true,
          "reversibility_note": "학위 과정이라 이수 기록이 남고 다른 진로로도 이어질 수 있어요."
        }
      ],
      "exploratory": [
        {
          "id": "islam-e1",
          "name": "중앙회 방문·상담",
          "description": "서울중앙성원 안내 등 공식 창구에서 궁금한 걸 물어봐요. 유학 조건도 여기서 확인해요.",
          "min_age": null,
          "requires_guardian_consent": false,
          "duration": "1회",
          "official_contact_url": "http://www.koreaislam.org"
        }
      ]
    }
  ],
  "institutions": [
    {
      "id": "prot-inst-puts",
      "religion": "PROTESTANT",
      "denomination": "대한예수교장로회(통합)",
      "name": "장로회신학대학교",
      "is_denomination_approved": true,
      "approving_body": "대한예수교장로회총회(통합)",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.puts.ac.kr",
      "source_name": "대한예수교장로회총회(통합) 직영 신학대 안내(2026-07 확인)",
      "source_url": "https://new.pck.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "cath-inst-cuk",
      "religion": "CATHOLIC",
      "denomination": "한국 천주교(교구 사제)",
      "name": "가톨릭대학교 신학대학(성신교정)",
      "is_denomination_approved": true,
      "approving_body": "천주교 서울대교구",
      "is_accredited_university": true,
      "degree_awarded": "신학사",
      "program_years": null,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.catholic.ac.kr",
      "source_name": "한국천주교주교회의(2026-07 확인)",
      "source_url": "https://www.cbck.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "budd-inst-sangha",
      "religion": "BUDDHIST",
      "denomination": "대한불교조계종",
      "name": "중앙승가대학교",
      "is_denomination_approved": true,
      "approving_body": "대한불교조계종",
      "is_accredited_university": true,
      "degree_awarded": "불교학사",
      "program_years": 4,
      "region_sido": "경기",
      "address": null,
      "website": "https://www.sangha.ac.kr",
      "source_name": "대한불교조계종 출가 안내(2026-07 확인)",
      "source_url": "http://monk.buddhism.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "budd-inst-dongguk",
      "religion": "BUDDHIST",
      "denomination": "대한불교조계종",
      "name": "동국대학교 불교학부",
      "is_denomination_approved": true,
      "approving_body": "대한불교조계종",
      "is_accredited_university": true,
      "degree_awarded": "학사",
      "program_years": 4,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.dongguk.edu",
      "source_name": "대한불교조계종 출가 안내(2026-07 확인)",
      "source_url": "http://monk.buddhism.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "won-inst-wku",
      "religion": "WON_BUDDHIST",
      "denomination": "원불교",
      "name": "원광대학교 원불교학과",
      "is_denomination_approved": true,
      "approving_body": "원불교 교정원",
      "is_accredited_university": true,
      "degree_awarded": "학사",
      "program_years": 4,
      "region_sido": "전북",
      "address": null,
      "website": "https://wonbuddhism.wku.ac.kr",
      "source_name": "원불교 교정원·원광대 원불교학과(2026-07 확인)",
      "source_url": "https://www.won.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "won-inst-grad",
      "religion": "WON_BUDDHIST",
      "denomination": "원불교",
      "name": "원불교대학원대학교",
      "is_denomination_approved": true,
      "approving_body": "원불교 교정원",
      "is_accredited_university": true,
      "degree_awarded": "석사",
      "program_years": 2,
      "region_sido": "전북",
      "address": null,
      "website": null,
      "source_name": "원불교 교정원(2026-07 확인)",
      "source_url": "https://www.won.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "won-inst-youngsan",
      "religion": "WON_BUDDHIST",
      "denomination": "원불교",
      "name": "영산선학대학교",
      "is_denomination_approved": true,
      "approving_body": "원불교 교정원",
      "is_accredited_university": true,
      "degree_awarded": "학사",
      "program_years": 4,
      "region_sido": "전남",
      "address": null,
      "website": null,
      "source_name": "원불교 교정원(2026-07 확인)",
      "source_url": "https://www.won.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "angl-inst-skhu",
      "religion": "PROTESTANT",
      "denomination": "대한성공회",
      "name": "성공회대학교(신학과·신학전문대학원)",
      "is_denomination_approved": true,
      "approving_body": "대한성공회",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.skhu.ac.kr",
      "source_name": "대한성공회(2026-07 확인)",
      "source_url": "https://anglicankr.church",
      "verified_at": "2026-07-27"
    },
    {
      "id": "hapdong-inst-chongshin",
      "religion": "PROTESTANT",
      "denomination": "대한예수교장로회(합동)",
      "name": "총신대학교",
      "is_denomination_approved": true,
      "approving_body": "대한예수교장로회총회(합동)",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.chongshin.ac.kr",
      "source_name": "대한예수교장로회총회(합동) 공식 안내(2026-07 확인)",
      "source_url": "https://www.gapck.org",
      "verified_at": "2026-07-27"
    },
    {
      "id": "meth-inst-mtu",
      "religion": "PROTESTANT",
      "denomination": "기독교대한감리회",
      "name": "감리교신학대학교",
      "is_denomination_approved": true,
      "approving_body": "기독교대한감리회",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "서울",
      "address": null,
      "website": "https://www.mtu.ac.kr",
      "source_name": "기독교대한감리회 공식 안내(2026-07 확인)",
      "source_url": "https://www.kmc.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "meth-inst-mokwon",
      "religion": "PROTESTANT",
      "denomination": "기독교대한감리회",
      "name": "목원대학교(신학과·신학대학원)",
      "is_denomination_approved": true,
      "approving_body": "기독교대한감리회",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "대전",
      "address": null,
      "website": "https://www.mokwon.ac.kr",
      "source_name": "기독교대한감리회 공식 안내(2026-07 확인)",
      "source_url": "https://www.kmc.or.kr",
      "verified_at": "2026-07-27"
    },
    {
      "id": "meth-inst-hyupsung",
      "religion": "PROTESTANT",
      "denomination": "기독교대한감리회",
      "name": "협성대학교(신학과·신학대학원)",
      "is_denomination_approved": true,
      "approving_body": "기독교대한감리회",
      "is_accredited_university": true,
      "degree_awarded": "신학사·신학석사(M.Div.)",
      "program_years": null,
      "region_sido": "경기",
      "address": null,
      "website": "https://www.uhs.ac.kr",
      "source_name": "기독교대한감리회 공식 안내(2026-07 확인)",
      "source_url": "https://www.kmc.or.kr",
      "verified_at": "2026-07-27"
    }
  ]
};
});
