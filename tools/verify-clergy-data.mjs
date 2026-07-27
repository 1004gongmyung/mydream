// 성직자 데이터 검증 — ① 빌드 가드 ② 기준일 180일 경과 ③ 출처 URL 응답 ④ 미성년 안전장치 ⑤ 개별 교회·사찰 패턴
// 실행: node tools/verify-clergy-data.mjs  (안전장치 위반·필수 누락이 있으면 종료 코드 1)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = require(path.join(root, "data", "clergy.data.js"));
const Clergy = require(path.join(root, "js", "clergy.js"));

let errors = 0;
console.log(`=== 성직자 데이터 검증 · 경로 ${DATA.paths.length}건, 기관 ${DATA.institutions.length}건 ===`);

// ① 빌드 가드
console.log(DATA.guard.visible
  ? "  ✓ 빌드 가드 통과 — 최소 요구 종교(개신교·천주교·불교) 실데이터 확보, 모듈 노출"
  : `  ※ 빌드 가드 미달 — 모듈 비노출 상태 (부족: ${DATA.guard.missing.map((r) => Clergy.RELIGION_LABELS[r]).join("·")})`);

// ④ 미성년 안전장치 — 위반은 에러
for (const p of DATA.paths) {
  const issues = Clergy.minorsSafetyIssues(p);
  if (issues.length) { console.log(`  ✗ ${p.id}(${p.role_name}) — 미성년 안전장치 위반: ${issues.join(", ")}`); errors++; }
}

// 비가역 단계 노트 필수
for (const p of DATA.paths) {
  for (const s of p.stages) {
    if (!s.is_reversible && !s.reversibility_note) { console.log(`  ✗ ${p.id}/${s.id} — 비가역 단계인데 reversibility_note 없음`); errors++; }
  }
}

// ⑤ 개별 교회·사찰·성당으로 보이는 기관명 경고 (종단 공식 기관만 허용)
for (const i of DATA.institutions) {
  if (/(교회|성당|사찰|암자|기도원)$/.test(i.name)) {
    console.log(`  △ 개별 시설 의심: ${i.id}(${i.name}) — 종단 공식 기관인지 재확인 필요`);
  }
}

// ② 기준일 180일 경과
const now = Date.now();
const staleOf = (arr) => arr.filter((x) => (now - new Date(x.verified_at).getTime()) / 86400000 >= 180);
const stale = [...staleOf(DATA.paths), ...staleOf(DATA.institutions)];
if (stale.length) {
  console.log(`  180일 경과 ${stale.length}건 — 재확인 필요:`);
  for (const x of stale) console.log(`    · ${x.id} — 기준일 ${x.verified_at}`);
} else console.log("  ✓ 기준일 180일 이내: 전체");

// ③ 출처 URL 응답 — 네트워크 실패는 보고만
const urls = [...new Set([...DATA.paths, ...DATA.institutions].map((x) => x.source_url))];
const UA = { "User-Agent": "Mozilla/5.0 (compatible; MydreamVerify/1.0)" }; // UA 없는 요청을 거부하는 서버 대응
for (const u of urls) {
  try {
    let res = await fetch(u, { method: "HEAD", redirect: "follow", headers: UA, signal: AbortSignal.timeout(8000) });
    if (res.status === 405 || res.status === 400) res = await fetch(u, { method: "GET", redirect: "follow", headers: UA, signal: AbortSignal.timeout(8000) });
    console.log(`  출처 ${res.ok ? "✓" : "△ HTTP " + res.status}: ${u}`);
  } catch (e) {
    console.log(`  출처 △ 확인 실패(${e.name}): ${u}`);
  }
}

if (DATA.allSample) console.log("  ※ 현재 전부 샘플 데이터 — 실데이터는 각 종단 공식 사이트 확인 후 주입 (docs/clergy-module.md)");
console.log(errors ? `결과: 오류 ${errors}건` : "결과: 검사 통과");
process.exitCode = errors ? 1 : 0;
