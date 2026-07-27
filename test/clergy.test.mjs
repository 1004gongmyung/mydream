// 성직자 진로 모듈 테스트 — 스펙 5종(빌드 가드·미성년 안전장치·비가역 경고·배지 독립·동일 컴포넌트) + 중립성
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DATA = require(join(here, "..", "data", "clergy.data.js"));
const Clergy = require(join(here, "..", "js", "clergy.js"));
const appSrc = readFileSync(join(here, "..", "js", "app.js"), "utf8");
const cssSrc = readFileSync(join(here, "..", "css", "style.css"), "utf8");

test("빌드 가드: 3개 종교 실데이터가 모두 있어야만 노출 — 샘플은 판정 제외", () => {
  assert.equal(DATA.guard.visible, Clergy.isVisible(DATA.paths), "생성물 가드와 로직 판정 일치");
  // 실데이터 3종 확보 상태 — 어느 한 종교라도 빠지는 회귀가 생기면 여기서 잡힌다
  assert.equal(DATA.guard.visible, true, "개신교·천주교·불교 실데이터 확보 후엔 노출 상태여야 함");
  // 가드 로직 자체 검증 (합성 데이터)
  const real = ["PROTESTANT", "CATHOLIC", "BUDDHIST"].map((r, i) => ({ id: "p" + i, religion: r }));
  assert.equal(Clergy.isVisible(real), true);
  assert.equal(Clergy.isVisible(real.slice(0, 2)), false, "한 종교라도 0건이면 전체 비노출");
  assert.equal(Clergy.isVisible([...real.slice(0, 2), { id: "sample-x", religion: "BUDDHIST" }]), false, "샘플은 판정에서 제외");
});

test("미성년 안전장치: 진입 가능 경로엔 상담 전화 필수, 화면엔 보호자 안내·부모 카드 연결", () => {
  assert.deepEqual(Clergy.minorsSafetyIssues({ is_open_to_minors: false }), [], "미성년 불가 경로는 해당 없음");
  const bad = Clergy.minorsSafetyIssues({ is_open_to_minors: true, official_contact_phone: null, official_contact_name: "x" });
  assert.ok(bad.length >= 1, "전화 없으면 위반");
  for (const p of DATA.paths) assert.deepEqual(Clergy.minorsSafetyIssues(p), [], `${p.id}: 안전장치 위반`);
  // 렌더 코드에 3종 세트가 있어야 한다: 상담 전화(tel:) · 보호자 상의 문구 · 부모 카드 연결
  const detail = appSrc.match(/function renderClergyDetail[\s\S]*?\n  }\n/)[0];
  assert.ok(detail.includes("is_open_to_minors"), "미성년 분기 없음");
  assert.ok(detail.includes("보호자와 꼭 상의"), "보호자 안내 문구 없음");
  assert.ok(detail.includes('data-route="parents"'), "부모 카드 연결 없음");
  assert.ok(detail.includes("tel:"), "상담 전화 링크 없음");
});

test("비가역 단계: is_reversible 명시·false면 노트 필수·화면에 경고 배지", () => {
  for (const p of DATA.paths) {
    for (const s of p.stages) {
      assert.equal(typeof s.is_reversible, "boolean", `${s.id}: is_reversible 명시 필수`);
      if (!s.is_reversible) assert.ok(s.reversibility_note, `${s.id}: 비가역인데 노트 없음`);
    }
  }
  const detail = appSrc.match(/function renderClergyDetail[\s\S]*?\n  }\n/)[0];
  assert.ok(detail.includes("되돌리기 어려움"), "비가역 경고 배지 없음");
});

test("배지 독립: 교단 인준과 학위 인정이 4가지 조합 모두 각각 표시 (합치기 금지)", () => {
  for (const appr of [true, false]) {
    for (const acc of [true, false]) {
      const badges = Clergy.instBadges({ is_denomination_approved: appr, is_accredited_university: acc });
      assert.equal(badges.length, 2, "배지는 항상 2개");
      assert.ok(badges[0].text.includes("교단 인준"), "인준 배지 누락");
      assert.ok(badges[1].text.includes("학위"), "학위 배지 누락");
      assert.equal(badges[0].kind, appr ? "ok" : "warn");
      assert.equal(badges[1].kind, acc ? "ok" : "warn");
    }
  }
});

test("동일 컴포넌트: 성직자 화면은 기존 카드 컴포넌트만 사용, 전용 스타일 없음", () => {
  const list = appSrc.match(/function renderClergy\(\)[\s\S]*?\n  }\n/)[0];
  assert.ok(list.includes('class="qcard"'), "목록이 일반 직업 카드(qcard)와 다른 컴포넌트 사용");
  assert.ok(!/\.clergy/.test(cssSrc), "성직자 전용 CSS 클래스 금지 — 특별 대우가 편향 신호");
});

test("중립성: 교리·권유·정통성 판정 표현 금지, 개별 교회·사찰 미수록, 종교별 탭·추천 없음", () => {
  const text = JSON.stringify(DATA);
  // "전도사"(직책명)·"교구 추천"(제도 용어)은 허용 — 앱이 권유하는 형태의 표현만 금지
  for (const b of ["이단", "사이비", "참된 ", "믿으세요", "전도하", "포교하", "권해요", "추천해", "추천 순위", "구원받"]) {
    assert.ok(!text.includes(b), `금지 표현: ${b}`);
  }
  for (const i of DATA.institutions) {
    assert.ok(!/(교회|성당|사찰|암자|기도원)$/.test(i.name), `${i.id}: 개별 시설 의심 — 종단 공식 기관만`);
  }
  const list = appSrc.match(/function renderClergy\(\)[\s\S]*?\n  }\n/)[0];
  assert.ok(!list.includes("tab") && !list.includes("추천"), "종교별 탭·추천 정렬 금지");
});

test("데이터 절대 규칙: 경로·기관 전부 출처·기준일 보유, 두 인정 축은 명시 bool", () => {
  for (const p of DATA.paths) {
    assert.ok(p.source_name && p.source_url && /^\d{4}-\d{2}-\d{2}$/.test(p.verified_at), `${p.id}: 출처/기준일`);
  }
  for (const i of DATA.institutions) {
    assert.equal(typeof i.is_denomination_approved, "boolean", `${i.id}: 인준 명시 필수`);
    assert.equal(typeof i.is_accredited_university, "boolean", `${i.id}: 학위 명시 필수`);
    assert.ok(i.source_name && i.source_url && i.verified_at, `${i.id}: 출처/기준일`);
  }
});
