// 대안학교 시드 로더 — data/alternative_schools.seed.csv → data/altschools.data.js 생성
// 절대 규칙 (mydream-alt-school-module-prompt.md):
//   1. accredits_diploma는 legal_status에서 파생하지 않는다 — CSV에 명시된 값만 쓴다.
//   2. verified_at 없는 행은 넣지 않는다.
//   3. 모델이 학교 데이터를 생성·추정하지 않는다 — 이 스크립트는 사람이 확인한 CSV만 옮긴다.
// 필수 필드 누락 행은 스킵하고 사유를 출력한다. legal_status×accredits_diploma 정합이 어긋나면 스킵한다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = path.join(root, "data", "alternative_schools.seed.csv");
const outPath = path.join(root, "data", "altschools.data.js");

const LEGAL = ["SPECIALIZED_MIDDLE", "SPECIALIZED_HIGH", "ACCREDITED_ALT", "ENTRUSTED", "REGISTERED", "UNREGISTERED"];
// 법적 지위별 학력 인정 기댓값 — 정합 검사용 (파생용이 아님: 두 값 모두 CSV에 명시돼야 한다)
const EXPECTED_ACCREDITS = {
  SPECIALIZED_MIDDLE: true, SPECIALIZED_HIGH: true, ACCREDITED_ALT: true, ENTRUSTED: true,
  REGISTERED: false, UNREGISTERED: false,
};
const REQUIRED = ["id", "name", "legal_status", "accredits_diploma", "detail_tier", "region_sido", "region_sigungu", "address", "source_name", "source_url", "verified_at"];
const TIER1_EXPECTED = ["school_levels", "characteristics"]; // 비면 경고(스킵 아님) — 모집 시기 등은 단계 보강 대상

// 간단 CSV 파서 — 따옴표 필드 지원
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((f) => f !== "")) rows.push(row); }
  return rows;
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const header = rows.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));
const val = (r, k) => (r[idx[k]] || "").trim();
const orNull = (s) => (s === "" ? null : s);
const boolOrNull = (s) => (s === "" ? null : s === "true");
const intOrNull = (s) => (s === "" ? null : Number(s));
const listOrEmpty = (s) => (s === "" ? [] : s.split("|").map((x) => x.trim()).filter(Boolean));

const schools = [];
const skipped = [];
const warnings = [];
const seen = new Set();

for (const r of rows) {
  const id = val(r, "id");
  const missing = REQUIRED.filter((k) => val(r, k) === "");
  if (missing.length) { skipped.push(`${id || "(id 없음)"} — 필수 필드 누락: ${missing.join(", ")}`); continue; }
  if (seen.has(id)) { skipped.push(`${id} — id 중복`); continue; }
  const legal = val(r, "legal_status");
  if (!LEGAL.includes(legal)) { skipped.push(`${id} — legal_status 값 이상: ${legal}`); continue; }
  const acc = val(r, "accredits_diploma");
  if (acc !== "true" && acc !== "false") { skipped.push(`${id} — accredits_diploma는 true/false 명시 필수 (파생 금지)`); continue; }
  const accredits = acc === "true";
  if (EXPECTED_ACCREDITS[legal] !== accredits) { skipped.push(`${id} — legal_status(${legal})와 accredits_diploma(${accredits}) 정합 오류: 원본 재확인 필요`); continue; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val(r, "verified_at"))) { skipped.push(`${id} — verified_at 형식 이상(YYYY-MM-DD)`); continue; }
  const tier = Number(val(r, "detail_tier"));
  if (tier !== 1 && tier !== 2) { skipped.push(`${id} — detail_tier는 1 또는 2`); continue; }
  if (tier === 1) {
    const empty = TIER1_EXPECTED.filter((k) => val(r, k) === "");
    if (empty.length) warnings.push(`${id} — Tier 1인데 비어 있음: ${empty.join(", ")}`);
  }
  seen.add(id);
  schools.push({
    id, name: val(r, "name"), legal_status: legal, accredits_diploma: accredits, detail_tier: tier,
    school_levels: listOrEmpty(val(r, "school_levels")),
    region_sido: val(r, "region_sido"), region_sigungu: val(r, "region_sigungu"), address: val(r, "address"),
    lat: intOrNull(val(r, "lat")), lng: intOrNull(val(r, "lng")),
    is_boarding: boolOrNull(val(r, "is_boarding")),
    accepts_entrustment: boolOrNull(val(r, "accepts_entrustment")),
    annual_tuition_krw: intOrNull(val(r, "annual_tuition_krw")),
    tuition_note: orNull(val(r, "tuition_note")),
    capacity: intOrNull(val(r, "capacity")),
    admission_period: orNull(val(r, "admission_period")),
    characteristics: listOrEmpty(val(r, "characteristics")),
    religious_affiliation: orNull(val(r, "religious_affiliation")),
    contact_phone: orNull(val(r, "contact_phone")),
    website: orNull(val(r, "website")),
    source_name: val(r, "source_name"), source_url: val(r, "source_url"), verified_at: val(r, "verified_at"),
  });
}

// 시도 → 이름 순 정렬 (인접순 정렬은 위치 권한이 없어 미구현 — 우열·추천 랭킹은 만들지 않는다)
schools.sort((a, b) => a.region_sido.localeCompare(b.region_sido, "ko") || a.name.localeCompare(b.name, "ko"));

const data = {
  builtFrom: "alternative_schools.seed.csv",
  allSample: schools.length > 0 && schools.every((s) => s.id.startsWith("sample-")),
  schools,
};
writeFileSync(outPath,
  "// 생성물 — 손으로 고치지 말 것. 원본: data/alternative_schools.seed.csv → node tools/load-alt-schools.mjs\n" +
  "(function (root, factory) {\n" +
  "  if (typeof module === \"object\" && module.exports) module.exports = factory();\n" +
  "  else root.MAPSI_ALTSCHOOLS_DATA = factory();\n" +
  "})(typeof self !== \"undefined\" ? self : this, function () {\n" +
  "  return " + JSON.stringify(data, null, 2) + ";\n" +
  "});\n", "utf8");

console.log(`OK: ${schools.length}건 적재 → data/altschools.data.js${data.allSample ? " (전부 샘플 데이터)" : ""}`);
for (const w of warnings) console.log("  경고: " + w);
for (const s of skipped) console.log("  스킵: " + s);
process.exitCode = 0;
