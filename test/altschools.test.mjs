// 대안학교 모듈 테스트 — 데이터 절대 규칙(정합·기준일·출처)과 로직(배지·필터·검색·검정고시 안내)
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DATA = require(join(here, "..", "data", "altschools.data.js"));
const Alt = require(join(here, "..", "js", "altschools.js"));

test("절대 규칙: 전 레코드 legal_status×accredits_diploma 정합, verified_at·출처 필수", () => {
  assert.ok(DATA.schools.length >= 1, "레코드 없음");
  for (const s of DATA.schools) {
    assert.ok(Alt.checkConsistency(s), `${s.id}: 법적 지위(${s.legal_status})와 학력 인정(${s.accredits_diploma}) 정합 오류`);
    assert.equal(typeof s.accredits_diploma, "boolean", `${s.id}: accredits_diploma는 명시적 bool (파생 금지)`);
    assert.match(s.verified_at, /^\d{4}-\d{2}-\d{2}$/, `${s.id}: verified_at 없음/형식 오류`);
    assert.ok(s.source_name && s.source_url.startsWith("https://"), `${s.id}: 출처 누락`);
  }
});

test("배지: 학력 인정 여부가 항상 텍스트로 포함, REGISTERED는 '교육청 등록'+'학력 미인정' 병기", () => {
  for (const s of DATA.schools) {
    const texts = Alt.badges(s).map((b) => b.text);
    assert.ok(texts.includes(s.accredits_diploma ? "학력 인정" : "학력 미인정"), `${s.id}: 학력 배지 누락`);
  }
  const reg = { legal_status: "REGISTERED", accredits_diploma: false };
  const regTexts = Alt.badges(reg).map((b) => b.text);
  assert.ok(regTexts.includes("교육청 등록") && regTexts.includes("학력 미인정"), "REGISTERED 병기 규칙 위반");
});

test("Tier 2: 최소 필수 필드만으로 유효 — 빈 값은 null 유지(임의 채움 금지)", () => {
  const tier2 = DATA.schools.filter((s) => s.detail_tier === 2);
  for (const s of tier2) {
    assert.equal(s.accredits_diploma, false, `${s.id}: Tier 2(등록 기관)는 학력 미인정`);
    assert.ok(s.name && s.region_sido && s.region_sigungu && s.address, `${s.id}: Tier 2 필수 필드 누락`);
    for (const k of ["is_boarding", "annual_tuition_krw", "capacity", "admission_period"]) {
      assert.notEqual(s[k], "", `${s.id}: ${k}는 빈 문자열이 아니라 null이어야 함`);
    }
  }
});

test("검정고시 안내: 학력 미인정 레코드는 전부 안내 대상", () => {
  for (const s of DATA.schools) {
    assert.equal(Alt.needsGedNotice(s), !s.accredits_diploma, `${s.id}: 안내 로직 불일치`);
  }
  assert.ok(DATA.schools.some((s) => Alt.needsGedNotice(s)) || DATA.schools.every((s) => s.accredits_diploma),
    "미인정 레코드가 있으면 안내가 켜져야 함");
});

test("필터·검색: 학력 인정/학교급/기숙/위탁 필터와 이름 검색(공백 무시), 무결과는 빈 배열", () => {
  const all = DATA.schools;
  const acc = Alt.filterSchools(all, { accredit: true });
  assert.ok(acc.every((s) => s.accredits_diploma));
  const high = Alt.filterSchools(all, { level: "HIGH" });
  assert.ok(high.every((s) => s.school_levels.includes("HIGH")));
  const found = Alt.searchByName(all, all[0].name.replace(/\s+/g, ""));
  assert.ok(found.some((s) => s.id === all[0].id), "공백 무시 검색 실패");
  assert.deepEqual(Alt.searchByName(all, "존재하지않는기관명"), [], "무결과는 빈 배열 — 임의 판정 금지");
});

test("금지: 순위·평점·추천·종교 평가 표현 없음", () => {
  const text = JSON.stringify(DATA);
  for (const b of ["순위", "평점", "추천", "랭킹", "명문", "좋은 학교"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});
