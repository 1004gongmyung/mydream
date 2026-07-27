// 고교 지도·학과 지도·실기 가이드 데이터 테스트
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const HISCHOOL = require(join(here, "..", "data", "hischool.data.js"));
const MAJORS = require(join(here, "..", "data", "majors.data.js"));
const ARTPREP = require(join(here, "..", "data", "artprep.data.js"));
const MODULES = require(join(here, "..", "data", "modules.data.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));

test("고교 지도: 유형 9종, 그룹·필드 완비, 진학 방법 3단계 이상", () => {
  assert.equal(HISCHOOL.types.length, 9);
  const groups = new Set(["별도 모집", "전기 모집", "후기 모집", "학교 밖·기타"]);
  for (const t of HISCHOOL.types) {
    assert.ok(groups.has(t.group), `${t.id}: 그룹 "${t.group}" 이상`);
    assert.ok(t.name && t.one && t.fit, `${t.id}: 필드 누락`);
    assert.ok(t.how.length >= 3, `${t.id}: 진학 방법 3개 미만`);
    assert.ok(t.check.length >= 1, `${t.id}: 준비 체크 없음`);
    if (t.relatedQ) assert.ok(content.answers[t.relatedQ], `${t.id}: 없는 답변 ${t.relatedQ}`);
    assert.ok((t.links || []).length >= 1, `${t.id}: 다음 행동 링크 없음`);
  }
});

test("고교 지도: 연간 일정에 확인 안내·출처 칩 병기, 자격증 안내 완비", () => {
  assert.ok(HISCHOOL.timeline.length >= 5);
  assert.ok(HISCHOOL.timelineNote.includes("공고"), "일정엔 반드시 공고 확인 안내");
  assert.ok(HISCHOOL.timelineChip, "일정 출처 칩 필요");
  assert.ok(HISCHOOL.cert.lines.length >= 3);
  assert.ok(HISCHOOL.cert.chip, "자격증 안내 출처 칩 필요");
  assert.ok(HISCHOOL.cert.links.some((l) => l.url && l.url.includes("q-net")), "큐넷 링크 필요");
});

test("고교 지도: 서열화·미화·훈계 표현 금지 ('좋은 학교' 프레임 금지)", () => {
  const text = JSON.stringify(HISCHOOL);
  for (const b of ["명문", "좋은 학교", "인생 망", "해야 해요", "추천해요", "무조건", "상위권 학교"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});

test("학과 지도: 계열 7종이 역방향 지도와 1:1, 학과·신호·자격 안내 완비", () => {
  const trackIds = new Set(MODULES.tracks.map((t) => t.id));
  assert.equal(MAJORS.tracks.length, MODULES.tracks.length, "역방향 계열 수와 일치");
  for (const tr of MAJORS.tracks) {
    assert.ok(trackIds.has(tr.trackId), `${tr.trackId}: 없는 계열`);
    assert.ok(tr.signals, `${tr.trackId}: 적성 신호 없음`);
    assert.ok(tr.majors.length >= 3, `${tr.trackId}: 학과 3개 미만`);
    for (const m of tr.majors) assert.ok(m.name && m.one, `${tr.trackId}: 학과 필드 누락`);
    assert.ok(tr.certNote, `${tr.trackId}: 자격 안내 없음`);
  }
});

test("학과 지도: 리서치 4단계·지원 자격 안내·공식 창구 3곳", () => {
  assert.equal(MAJORS.researchSteps.length, 4);
  assert.ok(MAJORS.eligibility.lines.length >= 3);
  assert.ok(MAJORS.eligibility.chip, "지원 자격 출처 칩 필요");
  for (const host of ["career.go.kr", "adiga.kr", "academyinfo.go.kr"]) {
    assert.ok(MAJORS.links.some((l) => l.url && l.url.includes(host)), `공식 창구 누락: ${host}`);
  }
});

test("실기 가이드: 4개 섹션(예고·대입·포트폴리오·학원없이), 합격 보장·학원 추천 금지", () => {
  const ids = ARTPREP.sections.map((s) => s.id);
  for (const need of ["midschool", "highschool", "portfolio", "nolesson"]) {
    assert.ok(ids.includes(need), `섹션 누락: ${need}`);
  }
  for (const s of ARTPREP.sections) {
    assert.ok(s.items.length >= 3, `${s.id}: 항목 3개 미만`);
    for (const it of s.items) assert.ok(it.head && it.body, `${s.id}: 항목 필드 누락`);
  }
  const text = JSON.stringify(ARTPREP);
  for (const b of ["합격 보장", "무조건", "학원에 다녀요", "이 학원", "해야 해요"]) {
    assert.ok(!text.includes(b), `금지: ${b}`);
  }
});

test("학교 데이터 전체: 통계성 수치 금지 (%·만 원·명 단위 수치 없음 — 정직 원칙)", () => {
  for (const [name, data] of [["고교 지도", HISCHOOL], ["학과 지도", MAJORS], ["실기 가이드", ARTPREP]]) {
    const text = JSON.stringify(data);
    assert.ok(!/\d+(\.\d+)?%|\d+만 원|\d+천 명/.test(text), `${name}: 통계 수치 발견 — 검증 절차 없이 싣지 않기`);
  }
});
