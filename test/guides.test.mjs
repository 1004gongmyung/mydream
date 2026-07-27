// 가이드 카드 데이터 테스트 — L3 버튼의 약속(미니 도구·절차·기준표)이 실제 목적지를 갖는지
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const GUIDES = require(join(here, "..", "data", "guides.data.js"));
const content = JSON.parse(readFileSync(join(here, "..", "data", "content.json"), "utf8"));
const appSrc = readFileSync(join(here, "..", "js", "app.js"), "utf8");

const STATIC_ROUTES = new Set([
  "home", "onboarding", "browse", "compass", "reverse", "search", "care-now", "help",
  "lens", "jobs", "explore", "quests", "journal", "signal", "shield", "portfolio",
  "parents", "jobdex", "paths", "hischool", "majors", "artprep",
]);
const validRoute = (r) =>
  STATIC_ROUTES.has(r) ||
  (r.startsWith("q/") && !!content.answers[r.slice(2)]) ||
  (r.startsWith("guide/") && !!GUIDES.byQuestion[r.slice(6)]);

function extractTargets(name) {
  const m = appSrc.match(new RegExp(`const ${name} = \\{([\\s\\S]*?)\\};`));
  assert.ok(m, name + " 추출 실패");
  return [...m[1].matchAll(/"([^"]+)":/g)].map((x) => x[1]);
}

test("가이드: 모든 가이드는 실제 질문에 걸려 있고 필드가 완비돼 있다", () => {
  for (const [id, g] of Object.entries(GUIDES.byQuestion)) {
    assert.ok(content.answers[id], `${id}: 없는 질문`);
    assert.ok(g.kicker && g.title && g.intro && g.note, `${id}: 필드 누락`);
    assert.ok(g.items.length >= 3, `${id}: 항목 3개 미만`);
    for (const it of g.items) assert.ok(it.head && it.body, `${id}: 항목 필드 누락`);
    assert.ok(g.links.length >= 1, `${id}: 다음 행동 링크 없음`);
  }
});

test("가이드: 링크 목적지(라우트·URL)가 전부 유효하다", () => {
  for (const [id, g] of Object.entries(GUIDES.byQuestion)) {
    for (const l of g.links) {
      assert.ok(l.route || l.url, `${id}: route/url 없음`);
      if (l.route) assert.ok(validRoute(l.route), `${id}: 라우트 "${l.route}" 없음`);
      if (l.url) assert.match(l.url, /^https:\/\//, `${id}: https 아님`);
      assert.ok(l.label, `${id}: 링크 라벨 없음`);
    }
  }
});

test("L3 전수 커버: 63문 모든 L3 버튼이 가이드·라우트·외부링크 중 하나로 이어진다", () => {
  const routeTargets = new Set(extractTargets("TARGET_ROUTES"));
  const linkTargets = new Set(extractTargets("TARGET_LINKS"));
  const dead = [];
  for (const [id, a] of Object.entries(content.answers)) {
    const t = a.l3 && a.l3.target;
    if (!t) continue;
    if (GUIDES.byQuestion[id] || routeTargets.has(t) || linkTargets.has(t)) continue;
    dead.push(`${id}(${t})`);
  }
  assert.deepEqual(dead, [], `목적지 없는 L3: ${dead.join(", ")}`);
});

test("가이드: 통계성 수치가 있으면 출처 칩 필수 (정직 원칙)", () => {
  for (const [id, g] of Object.entries(GUIDES.byQuestion)) {
    const text = g.intro + g.items.map((i) => i.head + i.body).join("") + g.note;
    if (/\d+(\.\d+)?%|\d+만 원|\d+천 명|\d+명/.test(text)) {
      assert.ok(g.chip, `${id}: 수치에 칩 없음`);
    }
  }
});

test("가이드: 단정·서열화·훈계 표현 금지, 판단 주제엔 상담 병기", () => {
  const all = JSON.stringify(GUIDES);
  for (const b of ["무조건", "반드시 성공", "최고의 길", "더 좋은 길", "인생 역전", "등급 컷"]) {
    assert.ok(!all.includes(b), `금지: ${b}`);
  }
  // 대입 판단 가이드는 최종 판단 창구(담임·상담)를 병기한다
  for (const id of ["D3", "E3"]) {
    const g = GUIDES.byQuestion[id];
    const text = g.items.map((i) => i.body).join("") + g.note;
    assert.ok(text.includes("상담"), `${id}: 상담 병기 누락`);
  }
});
