// 직업 사전 테스트 — 세부 직업 인식이 직업군·질문·공식 창구로 바르게 이어지는지
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const DICT = require(join(here, "..", "data", "jobdict.data.js"));
const JOBS = require(join(here, "..", "data", "jobs.data.js"));
const JOBDEX = require(join(here, "..", "data", "jobdex.data.js"));
const MODULES = require(join(here, "..", "data", "modules.data.js"));
const Mapsi = require(join(here, "..", "js", "content.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));

test("사전 정합: 직업군 id 유효(또는 route), 이름 중복 없음(조건 카드·도감과도), 한 줄 설명 완비", () => {
  const clusterIds = new Set(MODULES.clusters.map((c) => c.id));
  const seen = new Set([...JOBS.jobs.map((j) => j.name), ...JOBDEX.jobs.map((j) => j.name)]);
  for (const e of DICT.entries) {
    assert.ok(e.clusterId ? clusterIds.has(e.clusterId) : e.route, `${e.name}: 직업군도 route도 없음`);
    if (e.clusterId) assert.ok(clusterIds.has(e.clusterId), `${e.name}: 없는 직업군 ${e.clusterId}`);
    assert.ok(!seen.has(e.name), `${e.name}: 이름 중복`);
    seen.add(e.name);
    assert.ok(e.line && e.line.endsWith("요."), `${e.name}: 한 줄 설명 형식`);
  }
  assert.ok(DICT.entries.length >= 80, `사전 규모 ${DICT.entries.length} — 80종 이상 유지`);
});

test("검색 인식: 요청된 세부 직업들이 전부 잡힌다 (별칭·문장 포함)", () => {
  const pool = DICT.entries;
  for (const q of ["간호조무사", "직업군인", "직업경찰", "환경미화원", "요리사", "선교사", "군인이 되고 싶어요", "셰프", "파일럿", "변호사"]) {
    assert.ok(Mapsi.findByNames(pool, q).length >= 1, `미인식: ${q}`);
  }
  assert.deepEqual(Mapsi.findByNames(pool, "오늘 뭐하지"), [], "무관 문장은 미인식");
});

test("질문 연동: 사전의 모든 직업군 항목이 전 학년에서 관련 질문 2건 이상으로 이어진다", () => {
  const clusters = new Set(DICT.entries.map((e) => e.clusterId).filter(Boolean));
  for (const c of clusters) {
    for (const g of Mapsi.GRADES) {
      const qs = Mapsi.questionsForJob(content, { clusterId: c }, g);
      assert.ok(qs.length >= 2, `${c}×${g}: ${qs.length}건`);
    }
  }
});

test("정성 원칙: 수치·유망 단정·서열 표현 금지, 모든 직업군 항목에 '비슷한 결' 조건 카드 존재", () => {
  const text = JSON.stringify(DICT);
  assert.ok(!/\d+(\.\d+)?%|\d+만 원|\d+천 명/.test(text), "통계 수치 금지");
  for (const b of ["유망", "최고의", "인기 직업", "추천해", "전망이 밝"]) assert.ok(!text.includes(b), `금지: ${b}`);
  for (const e of DICT.entries) {
    if (e.clusterId) assert.ok(JOBS.jobs.some((j) => j.clusterId === e.clusterId), `${e.name}: 같은 직업군 조건 카드 없음`);
  }
});
