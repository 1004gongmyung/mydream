// 대안학교 데이터 검증 — ① verified_at 180일 경과 목록 ② source_url 응답 확인 ③ 법적 지위×학력 인정 정합
// 실행: node tools/verify-alt-schools.mjs  (정합 오류가 있으면 종료 코드 1)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = require(path.join(root, "data", "altschools.data.js"));
const Alt = require(path.join(root, "js", "altschools.js"));

let errors = 0;
console.log(`=== 대안학교 데이터 검증 · ${DATA.schools.length}건 ===`);

// ③ 정합 — 어긋나면 에러
for (const s of DATA.schools) {
  if (!Alt.checkConsistency(s)) {
    console.log(`  ✗ 정합 오류: ${s.id}(${s.name}) legal_status=${s.legal_status}, accredits_diploma=${s.accredits_diploma} — 원본 재확인 필요`);
    errors++;
  }
}

// ① 기준일 180일 경과
const now = Date.now();
const stale = DATA.schools.filter((s) => (now - new Date(s.verified_at).getTime()) / 86400000 >= 180);
if (stale.length) {
  console.log(`  180일 경과 ${stale.length}건 — 재확인 필요:`);
  for (const s of stale) console.log(`    · ${s.id}(${s.name}) — 기준일 ${s.verified_at}`);
} else console.log("  ✓ 기준일 180일 이내: 전체");

// ② 출처 URL 응답 — 네트워크 실패는 에러가 아니라 보고만 (오프라인 실행 허용)
const urls = [...new Set(DATA.schools.map((s) => s.source_url))];
for (const u of urls) {
  try {
    let res = await fetch(u, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) });
    if (res.status === 405) res = await fetch(u, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) }); // HEAD 미지원 서버
    console.log(`  출처 ${res.ok ? "✓" : "△ HTTP " + res.status}: ${u}`);
  } catch (e) {
    console.log(`  출처 △ 확인 실패(${e.name}): ${u}`);
  }
}

if (DATA.allSample) console.log("  ※ 현재 전부 샘플 데이터예요 — 실제 명단은 사람이 확인한 CSV로 주입하세요 (docs/alt-school-module.md)");
console.log(errors ? `결과: 정합 오류 ${errors}건` : "결과: 정합 검사 통과");
process.exitCode = errors ? 1 : 0;
