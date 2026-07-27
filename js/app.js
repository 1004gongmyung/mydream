// 맵시 앱 셸 — 화면 전환(해시 라우팅)과 렌더링만 담당. 로직은 MapsiContent/MapsiCompass/MapsiReverse에 위임.
(function () {
  const content = window.MAPSI_CONTENT;
  const M = window.MapsiContent;
  const MD = window.MAPSI_MODULES_DATA;
  const CARE = window.MAPSI_CARE_DATA;
  const LENS = window.MAPSI_LENS_DATA;
  const JOBS = window.MAPSI_JOBS_DATA;
  const EXPLORE = window.MAPSI_EXPLORE_DATA;
  const QUEST = window.MAPSI_QUEST_DATA;
  const SHIELD = window.MAPSI_SHIELD_DATA;
  const PARENTS = window.MAPSI_PARENTS_DATA;
  const DDAY = window.MAPSI_DDAY_DATA;
  const JOBDEX = window.MAPSI_JOBDEX_DATA;
  const PATHS = window.MAPSI_PATHS_DATA;
  const GUIDES = window.MAPSI_GUIDES_DATA;
  const HISCHOOL = window.MAPSI_HISCHOOL_DATA;
  const MAJORS = window.MAPSI_MAJORS_DATA;
  const ARTPREP = window.MAPSI_ARTPREP_DATA;
  const ALTS = window.MAPSI_ALTSCHOOLS_DATA;
  const Alt = window.MapsiAltschools;
  const Compass = window.MapsiCompass;
  const Reverse = window.MapsiReverse;
  const Care = window.MapsiCare;
  const Lens = window.MapsiLens;
  const Quests = window.MapsiQuests;
  const Shield = window.MapsiShield;
  const Signal = window.MapsiSignal;
  const Portfolio = window.MapsiPortfolio;
  const Daily = window.MapsiDaily;
  const $screen = document.getElementById("screen");
  const $gradeBtn = document.getElementById("gradeBtn");

  // 저장 키 — 개인정보 최소수집: 시기 + 도구 결과(기기 저장)뿐
  const GRADE_KEY = "mapsi.grade";
  const COMPASS_KEY = "mapsi.compass";
  const REVERSE_KEY = "mapsi.reverse";
  const LENS_ANSWERS_KEY = "mapsi.lens.answers";
  const QUESTS_KEY = "mapsi.quests";
  const JOURNAL_KEY = "mapsi.journal";
  const CHECKIN_KEY = "mapsi.checkin";
  const SHIELD_CHECKS_KEY = "mapsi.shield.checks";
  const PORTFOLIO_KEY = "mapsi.portfolio";
  const JOBDEX_KEY = "mapsi.jobdex";

  const getGrade = () => localStorage.getItem(GRADE_KEY);
  const setGrade = (g) => localStorage.setItem(GRADE_KEY, g);
  const loadJson = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const saveJson = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const todayKey = () => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };

  // 속성 값에도 쓰이므로 따옴표까지 이스케이프한다
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  // 마크다운 볼드(**)만 지원 — 콘텐츠 원본이 쓰는 유일한 서식
  const md = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n+/g, "<br>");

  const CHIP_CLASS = { "①": "g1", "②": "g2", "③": "g3", "④": "g4" };
  const CHIP_DESC = { "①": "국가통계", "②": "공공기관·공식 규정", "③": "연구·이론", "④": "현장·개인 경험" };
  function chipsHtml(chips) {
    if (!chips || chips.length === 0) return "";
    const items = chips.map((c) => {
      const cls = CHIP_CLASS[c.grade] || "g0";
      const title = CHIP_DESC[c.grade] || "출처";
      return `<span class="chip ${cls}" title="${title}">${c.grade || ""} ${esc(c.label)}</span>`;
    }).join("");
    return `<div class="chips">${items}</div>`;
  }

  // 클립보드 복사 — 실패·미지원 시 거짓 피드백 대신 대안 안내
  function copyText(text, noteId, okMessage) {
    const $note = document.getElementById(noteId);
    const done = (msg) => { if ($note) { $note.textContent = msg; $note.classList.add("show"); } };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => done(okMessage))
        .catch(() => done("자동 복사가 안 되는 환경이에요. 화면을 캡처하거나 길게 눌러 복사해요."));
    } else {
      done("자동 복사가 안 되는 환경이에요. 화면을 캡처하거나 길게 눌러 복사해요.");
    }
  }

  // L3 버튼 목적지: 구현된 모듈만 라우팅, 국가 검사는 외부 링크, 나머지는 안내
  const TARGET_ROUTES = {
    "나침반 시작": "compass", "역방향 지도": "reverse", "렌즈 카드": "lens",
    "조건 카드": "jobs", "조건 비교": "jobs",
    "체험 지도": "explore",
    "퀘스트": "quests", "미니 퀘스트": "quests", "탐험 기록": "quests",
    "강점 저널": "journal", "저널 설정": "journal", "내 기록": "journal",
    "첫 일자리 방패": "shield",
    "포트폴리오": "portfolio",
    "대화 카드": "parents", "다국어 카드": "parents",
    // 경로 지도와 인접 목적지 연결
    "경로 지도": "paths", "전환기 지도": "paths", "학교 지도": "hischool",
    "산업 지도": "jobs", "비용표": "jobs", "후보 카드": "jobs",
    "AI 시작 지도": "explore", "조합 지도": "explore", "실험 가이드": "explore",
    // 과목 지도 = 역방향 지도(과목 취향 → 계열)가 그 기능
    "과목 지도": "reverse",
  };
  const TARGET_LINKS = { "검사 바로가기": "https://www.career.go.kr/cnet/front/examen/examenMain.do" };

  // ---- 온보딩 ----
  function renderOnboarding() {
    const grades = M.GRADES.filter((g) => g !== "학교밖");
    $screen.innerHTML = `
      <div class="onboard">
        <h1>지금 어느 시기에 있어요?</h1>
        <p>딱 이것만 물어볼게요. 이름도, 학교도 안 물어봐요.</p>
        <div class="grade-grid">
          ${grades.map((g) => `<button class="grade-choice" data-grade="${g}">${g}</button>`).join("")}
          <button class="grade-choice wide" data-grade="학교밖">지금은 학교에 다니지 않아요</button>
        </div>
        <p class="privacy-note">저장되는 건 이 선택 하나뿐이에요. 언제든 위에서 바꿀 수 있어요.</p>
      </div>`;
    $screen.querySelectorAll("[data-grade]").forEach((btn) =>
      btn.addEventListener("click", () => { setGrade(btn.dataset.grade); go("home"); })
    );
  }

  // ---- 홈 / 전체 열람 ----
  function qcardHtml(q) {
    const meta = [q.type, q.lens ? "렌즈 " + q.lens : null].filter(Boolean).join(" · ");
    return `<button class="qcard" data-q="${q.id}">${esc(q.text)}${meta ? `<span class="qmeta">${esc(meta)}</span>` : ""}</button>`;
  }

  // 검색 폼 — 모든 입력은 위기 감지를 먼저 통과한다 (답변엔진 부록: 위기 라우팅)
  let searchQuery = "";
  function searchFormHtml(value) {
    return `
      <form id="searchForm" class="search-form" autocomplete="off">
        <input id="searchInput" class="search-input" type="search" inputmode="search"
          placeholder="지금 고민을 검색해도 돼요" value="${esc(value || "")}" maxlength="80" />
        <button id="searchBtn" class="search-btn" type="submit" aria-label="검색">찾기</button>
      </form>`;
  }
  function wireSearchForm() {
    document.getElementById("searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("searchInput").value.trim();
      if (!text) return;
      if (Care.detectCrisis(CARE, text)) return go("care-now"); // 검색·답변 실행 없이 즉시 전환
      searchQuery = text;
      if (location.hash === "#search") renderSearch(); else go("search");
    });
  }

  function renderHome() {
    const grade = getGrade();
    const cards = M.rotationFor(content, grade, todayKey());
    // 하루 한 장: 주 2~3회만 홈에 노출 (푸시 아님 — 원칙 4)
    const lensCard = Lens.isLensDay(todayKey()) ? Lens.todaysCard(LENS, todayKey()) : null;
    // D-day 내비게이션 + 오늘의 5분 몫 + 오늘의 낯선 직업
    const ev = Daily.nextEvent(DDAY, grade, todayKey());
    const task = Daily.todaysTask(DDAY, grade, todayKey());
    const todayJob = Daily.todaysJob(JOBDEX, todayKey());
    const metToday = !!(loadJson(JOBDEX_KEY) || {})[todayJob.id];
    $screen.innerHTML = `
      ${searchFormHtml("")}
      <div class="period-nav">
        ${ev ? `
          <div class="dday-line"><span class="dday-badge">${ev.dday === 0 ? "D-DAY" : "D-" + ev.dday}</span><span>${esc(ev.label)}</span></div>
          <div class="dday-note">${esc(ev.note)}</div>`
        : `<div class="dday-line">${esc(M.periodNavFor(grade))}</div>`}
        <button class="dday-task" data-task-route="${task.route || ""}">오늘의 5분 몫 — ${esc(task.text)}${task.route ? " →" : ""}</button>
      </div>
      <button class="lens-teaser jobdex-teaser" data-nav="jobdex">
        <span class="lens-teaser-kicker">오늘의 낯선 직업 · 도감</span>
        <span class="lens-teaser-title">${metToday ? esc(todayJob.name) + " — 다시 보기" : "??? — 오늘의 직업 만나러 가기"}</span>
      </button>
      ${lensCard ? `
        <button class="lens-teaser" data-lens="${lensCard.id}">
          <span class="lens-teaser-kicker">오늘의 세상 작동법 · 3분</span>
          <span class="lens-teaser-title">${esc(lensCard.title)}</span>
        </button>` : ""}
      <div class="section-label">오늘의 고민 카드 · ${cards.length}장</div>
      ${cards.map(qcardHtml).join("")}
      <button class="browse-link" data-nav="browse">다른 고민도 볼래요 → 전체 질문 보기</button>`;
    wireSearchForm();
    wireCards();
    const taskBtn = $screen.querySelector("[data-task-route]");
    if (taskBtn) taskBtn.addEventListener("click", () => {
      if (taskBtn.dataset.taskRoute) go(taskBtn.dataset.taskRoute);
    });
    $screen.querySelector(".jobdex-teaser").addEventListener("click", () => go("jobdex"));
    const teaser = $screen.querySelector("[data-lens]");
    if (teaser) teaser.addEventListener("click", () => go("lens/" + teaser.dataset.lens));
    $screen.querySelector("[data-nav=browse]").addEventListener("click", () => go("browse"));
  }

  // ---- 경로 지도 ----
  function renderPaths() {
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">경로 지도</div>
      <h1 class="result-title">같은 목적지, 여러 개의 문</h1>
      <p class="result-sub">${esc(PATHS.intro)}</p>
      ${PATHS.sections.map((s) => `
        <div class="section-label">${esc(s.title)}</div>
        <div class="paths-note">${esc(s.note)}${s.noteChip ? chipsHtml([s.noteChip]) : ""}</div>
        ${s.items.map((it) => `
          <div class="cluster-card">
            <div class="cluster-name">${esc(it.name)}</div>
            <div class="job-path">${esc(it.line)}</div>
            ${it.chip ? chipsHtml([it.chip]) : ""}
            ${it.relatedQ ? `<button class="inline-link job-inline" data-q-link="${it.relatedQ}">관련 답변 보기 →</button>` : ""}
            ${it.route ? `<button class="inline-link job-inline" data-route="${it.route}">${esc(it.routeLabel || "열기")} →</button>` : ""}
          </div>`).join("")}`).join("")}
      <button class="ghost-btn" data-route="hischool">고교 유형·진학 방법 자세히 → 고교 지도</button>
      <div class="open-question">'포기냐 아니냐'가 아니라 '어느 문이냐'의 문제예요. 지금은 끌리는 문 하나만 기억해 둬요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-q-link]").forEach((b) => b.addEventListener("click", () => go("q/" + b.dataset.qLink)));
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 낯선 직업 도감 ----
  function renderJobdex() {
    const todayJob = Daily.todaysJob(JOBDEX, todayKey());
    const dex = loadJson(JOBDEX_KEY) || {};
    const firstMeet = !dex[todayJob.id];
    dex[todayJob.id] = dex[todayJob.id] || todayKey(); // 열어보는 순간 '만남'으로 기록
    saveJson(JOBDEX_KEY, dex);
    const metCount = Object.keys(dex).length;
    const relatedJob = JOBS.jobs.find((j) => j.clusterId === todayJob.clusterId);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">낯선 직업 도감 · ${metCount}/${JOBDEX.jobs.length}</div>
      <h1 class="result-title">${firstMeet ? "오늘 처음 만나는 직업이에요" : "오늘의 직업, 다시 만났어요"}</h1>
      <div class="cluster-card dex-today">
        <div class="cluster-head"><span class="cluster-name">${esc(todayJob.name)}</span><span class="cluster-match">${esc(todayJob.field)}</span></div>
        ${todayJob.lines.map((l) => `<div class="job-path">${esc(l)}</div>`).join("")}
        ${relatedJob ? `<button class="inline-link job-inline" data-job="${relatedJob.id}">비슷한 결의 조건 카드: ${esc(relatedJob.name)} →</button>` : ""}
      </div>
      <div class="open-question">더 궁금하면 오늘 미션으로: 이 직업의 하루를 검색해보고, 묻고 싶은 질문 1개만 적어와요.</div>
      <div class="section-label">지금까지 만난 직업들</div>
      <div class="subject-grid">
        ${JOBDEX.jobs.map((j) => dex[j.id]
          ? `<span class="subject-chip on dex-met">${esc(j.name)}</span>`
          : `<span class="subject-chip dex-unmet">???</span>`).join("")}
      </div>
      <div class="dday-note" style="margin-top:10px">내일 새 직업이 찾아와요. 놓친 날이 있어도 괜찮아요 — 전부 다시 돌아오거든요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    wireJobLinks();
    window.scrollTo(0, 0);
  }

  // ---- 렌즈: 아카이브 + 하루 한 장 상세 ----
  function flowHtml(flow) {
    const sep = `<span class="flow-sep">${esc(flow.joiner || "→")}</span>`;
    return `
      <div class="flow-row">
        ${flow.name ? `<span class="flow-name">${esc(flow.name)}</span>` : ""}
        <span class="flow-steps">${flow.steps.map((s) => `<span class="flow-step">${esc(s)}</span>`).join(sep)}</span>
      </div>`;
  }

  function renderLensHome() {
    const today = Lens.todaysCard(LENS, todayKey());
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">세상 작동법</div>
      <h1 class="result-title">지도가 다시 그려지는 자리들이에요</h1>
      <p class="result-sub">정답이 아니라 <strong>렌즈</strong>예요. 쓰고 보는 안경처럼, 껴 봤다가 벗어도 돼요.</p>
      <div class="section-label">하루 한 장 · 3분 카드</div>
      ${LENS.dailyCards.map((c) => `
        <button class="qcard${c.id === today.id ? " lens-today" : ""}" data-lens="${c.id}">
          ${esc(c.title)}
          <span class="qmeta">렌즈 ${esc(c.lens)} ${esc(lensName(c.lens))}${c.id === today.id ? " · 오늘의 카드" : ""}</span>
        </button>`).join("")}
      <div class="section-label">직업 조건, 왜 이런 걸까? — 구조 한 줄</div>
      ${LENS.structureLines.map((s) => {
        const jb = JOBS.jobs.find((j) => j.name === s.job);
        return `
        <div class="cluster-card">
          <div class="cluster-name">${esc(s.job)}</div>
          <div class="structure-line">${esc(s.line)} <span class="lens-ref">→ 렌즈 ${esc(s.lens)}</span></div>
          ${jb ? `<button class="inline-link job-inline" data-job="${jb.id}">조건 카드 보기 →</button>` : ""}
        </div>`;
      }).join("")}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-lens]").forEach((btn) =>
      btn.addEventListener("click", () => go("lens/" + btn.dataset.lens))
    );
    wireJobLinks();
    window.scrollTo(0, 0);
  }

  function lensName(n) {
    const l = LENS.lenses.find((x) => x.n === n);
    return l ? l.name : "";
  }

  function renderLensCard(id) {
    const c = Lens.cardById(LENS, id);
    if (!c) return go("lens");
    const answers = loadJson(LENS_ANSWERS_KEY) || {};
    const saved = answers[c.id];
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">하루 한 장 · 렌즈 ${esc(c.lens)} ${esc(lensName(c.lens))}</div>
      <h1 class="result-title">${esc(c.title)}</h1>
      <div class="lens-hook">${esc(c.hook)}</div>
      <div class="lens-structure">
        ${c.structure.flows.map(flowHtml).join("")}
        <div class="lens-structure-text">${esc(c.structure.text)}</div>
      </div>
      <div class="lens-counter">${esc(c.counter)}</div>
      <div class="lens-career"><span class="lens-career-label">진로와 이으면</span> ${esc(c.career)}</div>
      <div class="open-question">${esc(c.openQuestion)}</div>
      <form id="lensAnswerForm" class="lens-answer-form" autocomplete="off">
        <input id="lensAnswerInput" class="search-input" type="text" maxlength="120"
          placeholder="한 줄로 적어봐도 좋아요 (안 써도 돼요)" value="${esc(saved || "")}" />
        <button class="search-btn" type="submit">남기기</button>
      </form>
      <div id="lensSavedNote" class="l3-note${saved ? " show" : ""}">기록은 이 기기에만 저장돼요. 쌓이면 네 신호가 돼요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    document.getElementById("lensAnswerForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("lensAnswerInput").value.trim();
      if (!text) return;
      if (Care.detectCrisis(CARE, text)) return go("care-now"); // 모든 입력은 위기 감지를 거친다
      answers[c.id] = text;
      saveJson(LENS_ANSWERS_KEY, answers);
      document.getElementById("lensSavedNote").classList.add("show");
    });
    window.scrollTo(0, 0);
  }

  // ---- 검색 결과 ----
  function renderSearch() {
    const results = M.searchQuestions(content, searchQuery);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="home">← 홈으로</button>
      ${searchFormHtml(searchQuery)}
      ${results.length
        ? `<div class="section-label">"${esc(searchQuery)}" 관련 질문 · ${results.length}개</div>${results.map(qcardHtml).join("")}`
        : `<div class="open-question">딱 맞는 질문을 못 찾았어요. 단어를 바꿔보거나, 전체 질문에서 골라봐도 좋아요.</div>
           <button class="browse-link" data-nav="browse">전체 질문 보기</button>`}`;
    $screen.querySelector("[data-nav=home]").addEventListener("click", () => go("home"));
    const browseBtn = $screen.querySelector("[data-nav=browse]");
    if (browseBtn) browseBtn.addEventListener("click", () => go("browse"));
    wireSearchForm();
    wireCards();
    window.scrollTo(0, 0);
  }

  // ---- 위기 안내 (판단·상담 문구 없이 연결만) ----
  function renderCareNow() {
    const p = CARE.primary;
    $screen.innerHTML = `
      <div class="care-now">
        <h1 class="care-title">지금 이야기 나눌 수 있는 곳이 있어요</h1>
        <div class="care-primary">
          <div class="care-name">${esc(p.name)}</div>
          <div class="care-hours">${esc(p.how)} · ${esc(p.hours)}</div>
          <div class="care-desc">${esc(p.desc)}</div>
          <a class="care-call" href="tel:${esc(p.contact)}">전화 걸기 ${esc(p.contact)}</a>
          <a class="care-sms" href="sms:${esc(p.contact)}">문자 보내기</a>
          <a class="care-chat" href="${esc(p.chat.url)}" target="_blank" rel="noopener">${esc(p.chat.label)}</a>
        </div>
        <p class="care-note">마이드림은 상담 도구가 아니라서, 더 잘 들어줄 수 있는 곳으로 연결해요.</p>
        <button class="ghost-btn" data-nav="help">다른 상황별 도움 창구 보기</button>
        <button class="ghost-btn" data-nav="home">진로 질문을 찾고 있었어요 — 돌아가기</button>
      </div>`;
    $screen.querySelector("[data-nav=help]").addEventListener("click", () => go("help"));
    $screen.querySelector("[data-nav=home]").addEventListener("click", () => go("home"));
    window.scrollTo(0, 0);
  }

  // ---- 도움 창구 (안심 DB) ----
  function renderHelp() {
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">도움 창구</div>
      <h1 class="result-title">상황별로 바로 연결돼요</h1>
      <p class="result-sub">모두 공공 창구예요. 어디로 가야 할지 모르겠으면 <strong>1388</strong>부터 걸면 돼요.</p>
      ${CARE.situations.map((s) => `
        <div class="cluster-card">
          <div class="cluster-name">${esc(s.title)}</div>
          <div class="help-lines">
            ${s.lines.map((l) => `
              <div class="help-line">
                <div class="help-info"><span class="help-name">${esc(l.name)}</span><span class="help-note">${esc(l.note)}</span></div>
                ${l.contact ? `<a class="help-call" href="tel:${esc(l.contact)}">${esc(l.contact)}</a>` : ""}
                ${l.url ? `<a class="help-link" href="${esc(l.url)}" target="_blank" rel="noopener">열기</a>` : ""}
              </div>`).join("")}
          </div>
        </div>`).join("")}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    window.scrollTo(0, 0);
  }

  function renderBrowse() {
    const groups = M.groupsFor(content);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="home">← 홈으로</button>
      <div class="section-label">전체 질문 · ${content.questions.length}개</div>
      ${groups.map((g) => `
        <div class="group-block">
          <button class="group-title" data-group="${g.group}">
            <span>${esc(g.title)}</span><span class="count">${g.questions.length}개</span>
          </button>
          <div class="group-body" id="group-${g.group}">${g.questions.map(qcardHtml).join("")}</div>
        </div>`).join("")}`;
    $screen.querySelector("[data-nav=home]").addEventListener("click", () => go("home"));
    $screen.querySelectorAll(".group-title").forEach((btn) =>
      btn.addEventListener("click", () => {
        document.getElementById("group-" + btn.dataset.group).classList.toggle("open");
      })
    );
    wireCards();
  }

  // ---- 답변 ----
  function renderAnswer(id) {
    const q = content.questions.find((x) => x.id === id);
    const a = content.answers[id];
    if (!q || !a) return go("home");
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="answer-q">${esc(q.text)}</div>
      <div class="answer-l1">
        <div class="headline">${md(a.l1.headline)}</div>
        <div class="body">${md(a.l1.body)}</div>
        ${chipsHtml(a.l1.chips)}
      </div>
      <div class="answer-l2">
        <div class="l2-title">솔직하게 말하면</div>
        <div class="body">${md(a.l2.body)}</div>
        ${chipsHtml(a.l2.chips)}
      </div>
      <div class="answer-l3">
        <button class="l3-btn" id="l3Btn">${esc(a.l3.label)}</button>
        <div class="l3-note" id="l3Note">
          ${a.l3.target ? `<strong>${esc(a.l3.target)}</strong> 기능은 준비 중이에요.<br>` : ""}
          지금 필요한 핵심은 위 '솔직하게 말하면'에 담아뒀어요. 관련 질문은 전체 질문에서 더 볼 수 있어요.
          <button class="inline-link" id="l3BrowseLink">전체 질문 열기 →</button>
        </div>
      </div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    document.getElementById("l3Btn").addEventListener("click", () => {
      const target = a.l3.target;
      if (GUIDES.byQuestion[id]) return go("guide/" + id); // 질문 전용 가이드 카드가 최우선
      if (target && TARGET_ROUTES[target]) return go(TARGET_ROUTES[target]);
      if (target && TARGET_LINKS[target]) return window.open(TARGET_LINKS[target], "_blank", "noopener");
      const $note = document.getElementById("l3Note");
      $note.classList.add("show");
      $note.scrollIntoView({ behavior: "smooth", block: "nearest" }); // 모바일에서 '아무 반응 없음'으로 보이지 않게
    });
    const browseLink = document.getElementById("l3BrowseLink");
    if (browseLink) browseLink.addEventListener("click", () => go("browse"));
    window.scrollTo(0, 0);
  }

  // ---- 고교 지도 (학교 유형·진학 방법·연간 일정·자격증) ----
  // 기준일("YYYY-MM")에서 12개월 이상 지나면 자동으로 낡음 경고를 만든다 — 갱신을 잊어도 앱이 스스로 알린다 (정직 원칙)
  function staleWarningHtml(ym) {
    const m = /^(\d{4})-(\d{2})$/.exec(ym || "");
    if (!m) return "";
    const now = new Date();
    const months = (now.getFullYear() - Number(m[1])) * 12 + (now.getMonth() + 1 - Number(m[2]));
    if (months < 12) return "";
    return `<div class="lens-counter"><strong>이 명단은 기준일(${esc(ym)})에서 1년이 지났어요.</strong> 그 사이 학교 지정·전환이 있었을 수 있어요 — '수시 업데이트' 표시가 붙은 공식 포털 쪽이 정확해요.</div>`;
  }

  // 외부 포털 링크에는 '수시 업데이트' 표시 — 앱 데이터(기준일 고정)와 달리 항상 최신임을 알린다
  function typeLinksHtml(links) {
    return (links || []).map((l) => l.url
      ? `<a class="guide-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} → <span class="fresh-tag">수시 업데이트</span></a>`
      : `<button class="ghost-btn" data-route="${l.route}">${esc(l.label)} →</button>`).join("");
  }

  function renderHischool() {
    const groups = ["별도 모집", "전기 모집", "후기 모집", "학교 밖·기타"];
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">고교 지도 · 정보 기준일 ${esc(HISCHOOL.checkedAt)}</div>
      <h1 class="result-title">고등학교, 유형부터 보면 길이 보여요</h1>
      <p class="result-sub">${esc(HISCHOOL.intro)}</p>
      <div class="dday-note">${esc(HISCHOOL.updateNote)}</div>
      ${staleWarningHtml(HISCHOOL.checkedAt)}
      <div class="section-label">1년의 리듬 — 중3 기준</div>
      <div class="cluster-card">
        ${HISCHOOL.timeline.map((t) => `<div class="job-path">· <strong>${esc(t.when)}</strong> ${esc(t.what)}</div>`).join("")}
        <div class="cluster-why">${esc(HISCHOOL.timelineNote)}</div>
        ${chipsHtml([HISCHOOL.timelineChip])}
      </div>
      ${groups.map((g) => `
        <div class="section-label">${esc(g)}</div>
        ${HISCHOOL.types.filter((t) => t.group === g).map((t) => `
          <div class="cluster-card">
            <div class="cluster-head"><span class="cluster-name">${esc(t.name)}</span></div>
            <div class="cluster-day">${esc(t.one)}</div>
            <div class="cluster-why">이런 결이면 — ${esc(t.fit)}</div>
            <div class="job-alt-label">들어가는 문</div>
            ${t.how.map((h) => `<div class="job-path">· ${esc(h)}</div>`).join("")}
            <div class="job-alt-label">준비 체크</div>
            ${t.check.map((c) => `<div class="job-path soft">· ${esc(c)}</div>`).join("")}
            ${t.schools ? `
              <div class="job-alt-label">학교 명단 · ${esc(t.schools.checkedAt)} 조사 기준</div>
              ${t.schools.items ? `<div class="subject-grid">${t.schools.items.map((n) => `<span class="subject-chip">${esc(n)}</span>`).join("")}</div>` : ""}
              ${t.schools.note ? `<div class="job-path soft">${esc(t.schools.note)}</div>` : ""}
              ${t.schools.chip ? chipsHtml([t.schools.chip]) : ""}` : ""}
            ${t.relatedQ ? `<button class="inline-link job-inline" data-q-link="${t.relatedQ}">관련 답변 보기 →</button>` : ""}
            ${typeLinksHtml(t.links)}
          </div>`).join("")}`).join("")}
      <div class="section-label">${esc(HISCHOOL.cert.title)}</div>
      <div class="cluster-card">
        ${HISCHOOL.cert.lines.map((l) => `<div class="job-path">· ${esc(l)}</div>`).join("")}
        ${chipsHtml([HISCHOOL.cert.chip])}
        ${typeLinksHtml(HISCHOOL.cert.links)}
      </div>
      <div class="open-question">전부 볼 필요 없어요. '이런 결이면'이 나랑 겹치는 카드 두 개만 고르고, 그 학교 요강을 열어보는 것까지가 오늘의 몫이에요.</div>
      <button class="ghost-btn" data-route="majors">학과 지도 — 적성 신호로 학과 찾기 →</button>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-q-link]").forEach((b) => b.addEventListener("click", () => go("q/" + b.dataset.qLink)));
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 학과 지도 (적성 신호 → 계열 → 학과 + 대학 리서치·지원 자격) ----
  function renderMajors() {
    const trackName = (id) => { const t = MD.tracks.find((x) => x.id === id); return t ? t.name : id; };
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">학과 지도</div>
      <h1 class="result-title">적성 신호로 학과를 좁혀가요</h1>
      <p class="result-sub">${esc(MAJORS.intro)}</p>
      <button class="ghost-btn" data-route="reverse">아직 계열 감이 없으면 — 역방향 지도 2분 먼저 →</button>
      ${MAJORS.tracks.map((tr) => `
        <div class="section-label">${esc(trackName(tr.trackId))} 계열</div>
        <div class="cluster-card">
          <div class="cluster-why">이런 신호면 — ${esc(tr.signals)}</div>
          ${tr.majors.map((m) => `<div class="job-path">· <strong>${esc(m.name)}</strong> — ${esc(m.one)}</div>`).join("")}
          ${tr.certNote ? `<div class="stem-note">${esc(tr.certNote)}</div>` : ""}
          ${tr.stem ? `<div class="job-path soft">이공계 일부 학과는 핵심과목 이수를 봐요 — 권장과목은 역방향 지도에서 확인해요.</div>` : ""}
          ${tr.artprep ? `<button class="ghost-btn" data-route="artprep">실기·포트폴리오 준비 가이드 →</button>` : ""}
        </div>`).join("")}
      <div class="section-label">대학·학과 리서치 4단계</div>
      ${MAJORS.researchSteps.map((s) => `
        <div class="cluster-card">
          <div class="cluster-name">${esc(s.head)}</div>
          <div class="job-path">${esc(s.body)}</div>
        </div>`).join("")}
      <div class="section-label">${esc(MAJORS.eligibility.title)}</div>
      <div class="cluster-card">
        ${MAJORS.eligibility.lines.map((l) => `<div class="job-path">· ${esc(l)}</div>`).join("")}
        ${chipsHtml([MAJORS.eligibility.chip])}
      </div>
      ${typeLinksHtml(MAJORS.links)}
      <div class="open-question">계열 하나, 학과 둘까지만 좁혀도 큰 진전이에요. 오늘은 커리어넷에서 그 학과 하나만 검색해봐요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 실기·포트폴리오 준비 가이드 ----
  function renderArtprep() {
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">실기·포트폴리오 가이드</div>
      <h1 class="result-title">실기는 재능보다 순서 설계예요</h1>
      <p class="result-sub">${esc(ARTPREP.intro)}</p>
      ${ARTPREP.sections.map((s) => `
        <div class="section-label">${esc(s.title)}</div>
        ${s.items.map((it) => `
          <div class="cluster-card">
            <div class="cluster-name">${esc(it.head)}</div>
            <div class="job-path">${esc(it.body)}</div>
          </div>`).join("")}`).join("")}
      <div class="open-question">${esc(ARTPREP.note)}</div>
      ${typeLinksHtml(ARTPREP.links)}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 대안학교 정보 (핵심: '교육청 등록 ≠ 학력 인정' 혼동을 구조로 차단) ----
  const altState = { accreditOnly: false, level: null, boarding: false, entrust: false, sido: null, query: "" };

  function altBadgesHtml(s) {
    return `<div class="alt-badges">${Alt.badges(s).map((b) => `<span class="alt-badge ${b.kind}">${esc(b.text)}</span>`).join("")}</div>`;
  }

  function renderAltschools() {
    const all = ALTS.schools;
    // 이름 검색 — DB에 없으면 '확인되지 않음' 안내 (임의 판정 금지)
    const searched = altState.query ? Alt.searchByName(all, altState.query) : null;
    const list = Alt.filterSchools(searched || all, {
      accredit: altState.accreditOnly ? true : null,
      level: altState.level, sido: altState.sido,
      boarding: altState.boarding, entrust: altState.entrust,
    });
    const missScreen = altState.query && searched.length === 0;
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">대안학교 정보</div>
      <h1 class="result-title">학력 인정 여부부터 확인해요</h1>
      <p class="result-sub">교육청에 <strong>등록</strong>된 기관은 '학교' 이름을 쓸 수 있지만 <strong>학력은 인정되지 않아요</strong>. 이 화면은 그 구분을 돕기 위해 있어요 — 카드마다 맨 위 배지가 그 표시예요.</p>
      ${ALTS.allSample ? `
        <div class="lens-counter"><strong>지금은 구조 확인용 샘플 데이터만 있어요(실제 학교 아님).</strong> 검증된 명단은 준비 중이에요 — 실제 기관 확인은 아래 공식 창구에서 해요.</div>` : `
        <div class="dday-note">지금은 ${Alt.sidoList(all).map(esc).join("·")} 지역의 확인을 마친 인가 학교 ${all.length}곳부터 담았어요. 단계적으로 늘려가는 중이라, <strong>여기 없다고 인가·등록이 아닌 게 아니에요</strong> — 전체 현황은 아래 공식 창구가 기준이에요.</div>`}
      <form id="altSearchForm" class="search-form" autocomplete="off">
        <input id="altSearchInput" class="search-input" type="search" placeholder="기관 이름으로 확인해보기" value="${esc(altState.query)}" maxlength="40" />
        <button class="search-btn" type="submit">확인</button>
      </form>
      ${missScreen ? `
        <div class="cluster-card">
          <div class="alt-badges"><span class="alt-badge warn">이 목록에서 확인 안 됨</span></div>
          <div class="job-path">"${esc(altState.query)}" — 이 목록에서 확인되지 않는 이름이에요.</div>
          <div class="job-path soft">아직 이 목록에 담기지 않은 인가·등록 기관일 수도 있고, 교육청에 인가·등록되지 않은 시설일 수도 있어요. 인가·등록 여부와 학력 인정 여부는 관할 교육청과 대안교육기관지원센터에서 확인할 수 있어요.</div>
          <button class="ghost-btn" data-alt-clear>전체 목록 다시 보기</button>
        </div>` : `
        <div class="subject-grid">
          <button class="subject-chip${altState.accreditOnly ? " on" : ""}" data-alt-filter="accreditOnly">학력 인정만</button>
          <button class="subject-chip${altState.level === "MIDDLE" ? " on" : ""}" data-alt-level="MIDDLE">중등</button>
          <button class="subject-chip${altState.level === "HIGH" ? " on" : ""}" data-alt-level="HIGH">고등</button>
          <button class="subject-chip${altState.boarding ? " on" : ""}" data-alt-filter="boarding">기숙</button>
          <button class="subject-chip${altState.entrust ? " on" : ""}" data-alt-filter="entrust">위탁 가능</button>
          ${Alt.sidoList(all).map((sd) => `<button class="subject-chip${altState.sido === sd ? " on" : ""}" data-alt-sido="${esc(sd)}">${esc(sd)}</button>`).join("")}
        </div>
        ${list.length ? list.map((s) => `
          <button class="qcard alt-card" data-alt="${s.id}">
            ${altBadgesHtml(s)}
            ${esc(s.name)}
            <span class="qmeta">${esc(s.region_sido)} ${esc(s.region_sigungu)}${(s.school_levels || []).length ? " · " + s.school_levels.map((l) => esc(Alt.LEVEL_LABELS[l] || l)).join("·") : ""}${s.detail_tier === 2 ? " · 상세 정보 미제공" : ""}</span>
          </button>`).join("")
        : `<div class="open-question">지금 조건에 맞는 기관이 목록에 없어요. 필터를 풀거나, 아래 공식 창구에서 확인해봐요.</div>`}`}
      <div class="section-label">공식 확인 창구</div>
      ${typeLinksHtml([
        { url: "https://www.alter-edu.re.kr", label: "대안교육기관지원센터 — 등록 기관 현황" },
        { url: "https://www.schoolinfo.go.kr", label: "학교알리미 — 특성화중·고, 인가 대안학교" },
        { route: "hischool", label: "고교 지도 — 학교 밖·기타 갈래 보기" },
      ])}
      <div class="dday-note">학력이 인정되지 않는 기관에 다녀도 검정고시로 학력을 만들 수 있어요 — 각 기관 상세에서 안내해요. 최종 확인은 관할 교육청에 문의하세요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    document.getElementById("altSearchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("altSearchInput").value.trim();
      if (text && Care.detectCrisis(CARE, text)) return go("care-now"); // 모든 입력은 위기 감지 경유
      altState.query = text;
      renderAltschools();
    });
    const clearBtn = $screen.querySelector("[data-alt-clear]");
    if (clearBtn) clearBtn.addEventListener("click", () => { altState.query = ""; renderAltschools(); });
    $screen.querySelectorAll("[data-alt-filter]").forEach((b) =>
      b.addEventListener("click", () => { altState[b.dataset.altFilter] = !altState[b.dataset.altFilter]; renderAltschools(); }));
    $screen.querySelectorAll("[data-alt-level]").forEach((b) =>
      b.addEventListener("click", () => { altState.level = altState.level === b.dataset.altLevel ? null : b.dataset.altLevel; renderAltschools(); }));
    $screen.querySelectorAll("[data-alt-sido]").forEach((b) =>
      b.addEventListener("click", () => { altState.sido = altState.sido === b.dataset.altSido ? null : b.dataset.altSido; renderAltschools(); }));
    $screen.querySelectorAll("[data-alt]").forEach((b) =>
      b.addEventListener("click", () => go("altschool/" + b.dataset.alt)));
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  function renderAltschoolDetail(id) {
    const s = ALTS.schools.find((x) => x.id === id);
    if (!s) return go("altschools");
    const row = (label, v) => (v == null || v === "" ? "" : `<div class="job-path">· <strong>${esc(label)}</strong> — ${esc(v)}</div>`);
    const yn = (v) => (v === true ? "가능" : v === false ? "아니요" : null);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">대안학교 정보</div>
      ${altBadgesHtml(s)}
      <h1 class="result-title">${esc(s.name)}</h1>
      <p class="result-sub">${esc(s.region_sido)} ${esc(s.region_sigungu)} · ${esc(Alt.LEGAL_LABELS[s.legal_status] || s.legal_status)}</p>
      <div class="cluster-card">
        ${row("주소", s.address)}
        ${row("과정", (s.school_levels || []).map((l) => Alt.LEVEL_LABELS[l] || l).join("·") || null)}
        ${row("기숙", yn(s.is_boarding))}
        ${row("위탁 수학(원적교 학적 유지)", yn(s.accepts_entrustment))}
        ${s.annual_tuition_krw != null ? row("연간 학비", s.annual_tuition_krw.toLocaleString() + "원") : ""}
        ${row("학비 참고", s.tuition_note)}
        ${row("모집 시기", s.admission_period)}
        ${row("특성", (s.characteristics || []).map((c) => Alt.CHARACTER_LABELS[c] || c).join("·") || null)}
        ${row("종교", s.religious_affiliation)}
        ${row("연락처", s.contact_phone)}
        ${s.website ? `<a class="guide-link" href="${esc(s.website)}" target="_blank" rel="noopener">기관 홈페이지 → <span class="fresh-tag">수시 업데이트</span></a>` : ""}
        ${s.detail_tier === 2 ? `<div class="job-path soft">상세 정보 미제공 — 등록 기관은 이름·소재지·법적 지위만 확인해서 제공해요. 빈칸은 앱이 임의로 채우지 않아요.</div>` : ""}
      </div>
      ${Alt.needsGedNotice(s) ? `
        <div class="lens-counter">
          <strong>이곳을 다니면 학력(졸업장)은 별도로 만들어야 해요.</strong>
          검정고시(해마다 4월·8월)로 학력을 만들 수 있고, 대학 지원도 가능해요. 다니기 전에 이 구조를 알고 결정하는 게 중요해요.
        </div>
        <button class="ghost-btn" data-route="q/H2">검정고시 → 대학 경로 답변 보기 →</button>
        <button class="ghost-btn" data-route="hischool">고교 지도 — 다른 갈래도 같이 보기 →</button>` : ""}
      <div class="cluster-card">
        <div class="job-path soft">기준일 ${esc(s.verified_at)} · 출처 ${esc(s.source_name)}</div>
        <a class="guide-link" href="${esc(s.source_url)}" target="_blank" rel="noopener">출처 확인하기 → <span class="fresh-tag">수시 업데이트</span></a>
        <div class="job-path soft">최종 확인은 관할 교육청에 문의하세요.</div>
      </div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 가이드 카드 (L3 버튼이 약속한 미니 도구·절차·기준표) ----
  function renderGuide(id) {
    const g = GUIDES.byQuestion[id];
    if (!g) return go("home");
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">${esc(g.kicker)}</div>
      <h1 class="result-title">${esc(g.title)}</h1>
      <p class="result-sub">${esc(g.intro)}</p>
      ${g.items.map((it) => `
        <div class="cluster-card">
          <div class="cluster-name">${esc(it.head)}</div>
          <div class="job-path">${esc(it.body)}</div>
        </div>`).join("")}
      ${g.chip ? chipsHtml([g.chip]) : ""}
      <div class="open-question">${esc(g.note)}</div>
      ${g.links.map((l) => l.url
        ? `<a class="guide-link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} →</a>`
        : `<button class="ghost-btn" data-route="${l.route}">${esc(l.label)} →</button>`).join("")}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-route]").forEach((b) => b.addEventListener("click", () => go(b.dataset.route)));
    window.scrollTo(0, 0);
  }

  // ---- 나침반 (모듈 A: 역설계 진로 나침반) ----
  const compassState = { step: -1, picks: {} }; // step: -1 인트로, 0~5 축, 6 결과

  function renderCompass() {
    const saved = loadJson(COMPASS_KEY);
    if (compassState.step === -1) {
      $screen.innerHTML = `
        <button class="answer-back" data-nav="back">← 뒤로</button>
        <div class="tool-intro">
          <div class="tool-kicker">나침반</div>
          <h1>직업 말고, 하루부터 골라봐요</h1>
          <p>여섯 번만 고르면 돼요. 정답을 찾는 게 아니라 <strong>가설</strong>을 만드는 거예요. 모르겠으면 건너뛰어도 돼요.</p>
          <button class="l3-btn" id="startBtn">시작하기 (2분)</button>
          ${saved ? `<button class="ghost-btn" id="savedBtn">지난 결과 다시 보기 (${esc(saved.date)})</button>` : ""}
        </div>`;
      $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
      document.getElementById("startBtn").addEventListener("click", () => {
        compassState.step = 0; compassState.picks = {}; renderCompass();
      });
      if (saved) document.getElementById("savedBtn").addEventListener("click", () => {
        compassState.picks = saved.picks; compassState.step = 6; renderCompass();
      });
      return;
    }
    if (compassState.step < MD.axes.length) {
      const ax = MD.axes[compassState.step];
      const dots = MD.axes.map((_, i) =>
        `<span class="dot${i < compassState.step ? " done" : i === compassState.step ? " now" : ""}"></span>`).join("");
      $screen.innerHTML = `
        <div class="progress-dots">${dots}</div>
        <div class="axis-card">
          <div class="axis-q">${esc(ax.q)}</div>
          <button class="opt-btn" data-side="L">${esc(ax.left)}</button>
          <div class="axis-vs">아니면</div>
          <button class="opt-btn" data-side="R">${esc(ax.right)}</button>
          <button class="skip-btn" data-side="skip">잘 모르겠어요, 건너뛸래요</button>
        </div>`;
      $screen.querySelectorAll("[data-side]").forEach((btn) =>
        btn.addEventListener("click", () => {
          compassState.picks[ax.key] = btn.dataset.side === "skip" ? null : btn.dataset.side;
          compassState.step += 1;
          if (compassState.step === MD.axes.length) {
            saveJson(COMPASS_KEY, { picks: compassState.picks, date: todayKey() });
            compassState.step = 6;
          }
          renderCompass();
        })
      );
      window.scrollTo(0, 0);
      return;
    }
    // 결과 — 가설 프레임, 단정 금지
    const picks = compassState.picks;
    const results = Compass.scoreClusters(MD, picks);
    const summary = Compass.pickedSummary(MD, picks);
    const lens = Compass.lensLineFor(MD, picks);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="home">← 홈으로</button>
      <div class="tool-kicker">나침반 · 결과</div>
      <h1 class="result-title">네 하루가 가리키는 방향이에요</h1>
      <p class="result-sub">정답이 아니라 <strong>가설</strong>이에요. 아니라고 느껴지면, 그것도 소중한 데이터예요.</p>
      ${summary.length ? `<div class="pick-summary">${summary.map((s) => `<span class="pick-tag">${esc(s)}</span>`).join("")}</div>` : ""}
      <div class="section-label">이런 하루를 사는 사람이 많은 직업군</div>
      ${results.map((r, i) => `
        <div class="cluster-card">
          <div class="cluster-head"><span class="cluster-name">${esc(r.cluster.name)}</span>
            ${r.score > 0 ? `<span class="cluster-match">겹침 ${r.score}/6</span>` : ""}</div>
          <div class="cluster-day">${esc(r.cluster.day)}</div>
          <div class="cluster-jobs">${r.cluster.jobs.map((j) => `<span class="job-tag">${esc(j)}</span>`).join("")}</div>
          ${r.matched.length ? `<div class="cluster-why">겹친 취향: ${r.matched.map((ax) => esc(picks[ax.key] === "L" ? ax.left : ax.right)).join(" · ")}</div>` : ""}
          ${JOBS.jobs.filter((jb) => jb.clusterId === r.cluster.id).map((jb) =>
            `<button class="inline-link job-inline" data-job="${jb.id}">조건 카드: ${esc(jb.name)} →</button>`).join("")}
        </div>`).join("")}
      ${lens ? `<div class="lens-line">${esc(lens)}</div>` : ""}
      <div class="open-question">이 중에서 '하루'가 제일 그려지는 건 어느 쪽이에요? 마음에 걸리는 직업군 하나만 기억해 둬요.</div>
      <button class="ghost-btn" id="retryBtn">다시 골라보기</button>`;
    $screen.querySelector("[data-nav=home]").addEventListener("click", () => go("home"));
    document.getElementById("retryBtn").addEventListener("click", () => {
      compassState.step = 0; compassState.picks = {}; renderCompass();
    });
    wireJobLinks();
    window.scrollTo(0, 0);
  }

  // ---- 역방향 지도 (과목 취향 → 계열) ----
  function renderReverse() {
    const saved = loadJson(REVERSE_KEY);
    const selected = new Set((saved && saved.subjects) || []);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">역방향 지도</div>
      <h1 class="result-title">시간이 빨리 가는 과목만 골라요</h1>
      <p class="result-sub">성적표가 아니라 <strong>취향표</strong>예요. 등급은 안 물어봐요. 1개만 골라도 충분해요.</p>
      <div class="subject-grid">
        ${MD.subjects.map((s) => `<button class="subject-chip${selected.has(s.id) ? " on" : ""}" data-sub="${s.id}">${esc(s.name)}</button>`).join("")}
      </div>
      <button class="l3-btn" id="mapBtn">연결되는 계열 보기</button>
      <div id="reverseResult"></div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-sub]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const id = btn.dataset.sub;
        if (selected.has(id)) { selected.delete(id); btn.classList.remove("on"); }
        else { selected.add(id); btn.classList.add("on"); }
      })
    );
    document.getElementById("mapBtn").addEventListener("click", () => {
      const ids = [...selected];
      const $out = document.getElementById("reverseResult");
      if (ids.length === 0) {
        $out.innerHTML = `<div class="open-question">아직 없어도 괜찮아요. '제일 덜 지겨운' 과목 하나만 골라봐요 — 그것도 취향 데이터예요.</div>`;
        return;
      }
      saveJson(REVERSE_KEY, { subjects: ids, date: todayKey() });
      const results = Reverse.trackScores(MD, ids).slice(0, 4);
      $out.innerHTML = `
        <div class="section-label">네 취향과 자주 만나는 계열 — 가설이에요</div>
        ${results.map((r, i) => `
          <div class="cluster-card">
            <div class="cluster-head"><span class="cluster-name">${i + 1}. ${esc(r.track.name)} 계열</span></div>
            <div class="cluster-why">네가 고른 ${r.subjects.map(esc).join("·")} 과목이 이 계열과 자주 만나요.</div>
            <div class="cluster-jobs">${r.track.majors.map((m) => `<span class="job-tag">${esc(m)}</span>`).join("")}</div>
            ${r.track.stem ? `<div class="stem-note">이공계 일부 학과는 핵심과목 이수를 봐요 — '2028학년도 권장과목 안내'에서 확인해요. <button class="inline-link" data-q-link="D2">관련 답변 보기</button></div>` : ""}
          </div>`).join("")}
        <button class="ghost-btn" data-majors>이 계열의 학과·자격증 자세히 → 학과 지도</button>
        <div class="open-question">과목 선택엔 2~3학년에 조정 지점이 있어요. 지금은 이 가설을 후보로 적어두는 것까지면 충분해요.</div>`;
      $out.querySelectorAll("[data-q-link]").forEach((b) =>
        b.addEventListener("click", () => go("q/" + b.dataset.qLink))
      );
      $out.querySelector("[data-majors]").addEventListener("click", () => go("majors"));
      $out.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    window.scrollTo(0, 0);
  }

  // ---- 조건 대시보드 (모듈 B) ----
  function renderJobs() {
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">조건 카드</div>
      <h1 class="result-title">미화 없이, 조건부터 봐요</h1>
      <p class="result-sub">좋은 직업·나쁜 직업이 아니라, <strong>조건이 다른 직업</strong>이 있을 뿐이에요.</p>
      ${JOBS.jobs.map((j) => `
        <button class="qcard" data-job="${j.id}">${esc(j.name)}<span class="qmeta">${esc(j.summary)}</span></button>`).join("")}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    wireJobLinks();
    window.scrollTo(0, 0);
  }

  function renderJob(id) {
    const j = JOBS.jobs.find((x) => x.id === id);
    if (!j) return go("jobs");
    const sLine = LENS.structureLines.find((s) => s.job === j.name);
    const relQs = j.relatedQuestions.map((qid) => content.questions.find((q) => q.id === qid)).filter(Boolean);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">조건 카드</div>
      <h1 class="result-title">${esc(j.name)}</h1>
      <p class="result-sub">${esc(j.summary)}</p>
      <div class="cluster-card">
        <div class="cluster-name">가는 길</div>
        ${j.paths.main.map((p) => `<div class="job-path">· ${esc(p)}</div>`).join("")}
        <div class="job-alt-label">다른 문·되돌림</div>
        ${j.paths.alt.map((p) => `<div class="job-path soft">· ${esc(p)}</div>`).join("")}
      </div>
      <div class="cluster-card">
        <div class="cluster-name">솔직한 조건</div>
        ${j.conditions.map((c) => `<div class="job-path">· ${esc(c)}</div>`).join("")}
        ${j.conditionChip ? chipsHtml([j.conditionChip]) : ""}
      </div>
      <div class="lens-career"><span class="lens-career-label">이 일에서 AI가 못 하는 것</span>${esc(j.aiNote)}</div>
      ${sLine ? `<div class="lens-line">${esc(sLine.line)} <span class="lens-ref">→ 렌즈 ${esc(sLine.lens)}</span></div>` : ""}
      <div class="cluster-card">
        <div class="cluster-name">임금</div>
        <div class="job-path soft">${esc(JOBS.wagePendingNote)}</div>
        <div class="job-path">· ${esc(JOBS.wageCommonRef.text)}</div>
        ${chipsHtml([JOBS.wageCommonRef.chip])}
      </div>
      ${relQs.length ? `
        <div class="section-label">같이 보면 좋은 질문</div>
        ${relQs.map(qcardHtml).join("")}` : ""}
      <button class="l3-btn" data-nav="explore">관련 체험 찾아보기 → 체험 지도</button>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelector("[data-nav=explore]").addEventListener("click", () => go("explore"));
    wireCards();
    window.scrollTo(0, 0);
  }

  function wireJobLinks() {
    $screen.querySelectorAll("[data-job]").forEach((btn) =>
      btn.addEventListener("click", () => go("job/" + btn.dataset.job))
    );
  }

  // ---- 체험 지도 (모듈 C: 체험 DB) ----
  const exploreFilters = { personal: true, openToAll: false, free: false }; // 개인신청 필터 기본 ON (설계 원칙)

  function renderExplore() {
    let list = EXPLORE.entries;
    if (exploreFilters.personal) list = list.filter((e) => e.personal);
    if (exploreFilters.openToAll) list = list.filter((e) => e.openToAll === true);
    if (exploreFilters.free) list = list.filter((e) => e.free);
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">체험 지도</div>
      <h1 class="result-title">직접 해보는 게 제일 빠른 데이터예요</h1>
      <p class="result-sub">전부 공식 사이트에서 확인한 곳들이에요. 요금은 조사 시점 기준이라 방문 전에 한 번 더 봐요.</p>
      <div class="subject-grid">
        <button class="subject-chip${exploreFilters.personal ? " on" : ""}" data-filter="personal">개인 신청 가능</button>
        <button class="subject-chip${exploreFilters.free ? " on" : ""}" data-filter="free">무료만</button>
        <button class="subject-chip${exploreFilters.openToAll ? " on" : ""}" data-filter="openToAll">학교 밖도 OK</button>
      </div>
      ${list.map((e) => `
        <div class="cluster-card">
          <div class="cluster-head"><span class="cluster-name">${esc(e.name)}</span></div>
          <div class="cluster-day">${esc(e.org)} · ${esc(e.region)}</div>
          <div class="cluster-jobs">
            <span class="job-tag">${esc(e.mode)}</span>
            <span class="job-tag">${e.free ? "무료" : esc(e.costNote || "유료")}</span>
            ${e.personal ? `<span class="job-tag">개인 신청</span>` : `<span class="job-tag">학교 단위</span>`}
            ${e.openToAll === true ? `<span class="job-tag">재학 무관</span>` : e.openToAll === null ? `<span class="job-tag">재학 조건 확인</span>` : ""}
          </div>
          <div class="cluster-why">${esc(e.desc)}</div>
          <a class="help-link explore-open" href="${esc(e.url)}" target="_blank" rel="noopener">열기</a>
        </div>`).join("")}
      <div class="open-question">검증된 창구 ${EXPLORE.entries.length}곳이에요. 계속 확인을 거쳐 늘려가요 — 가까운 곳 하나부터 시작해요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-filter]").forEach((btn) =>
      btn.addEventListener("click", () => {
        exploreFilters[btn.dataset.filter] = !exploreFilters[btn.dataset.filter];
        renderExplore();
      })
    );
    window.scrollTo(0, 0);
  }

  // ---- 탐험 퀘스트 (모듈 C) ----
  function renderQuests() {
    const doneMap = loadJson(QUESTS_KEY) || {};
    const progress = Quests.progressBySkill(QUEST, doneMap);
    const doneTotal = Object.keys(doneMap).length;
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">탐험 퀘스트</div>
      <h1 class="result-title">완료 조건은 딱 하나, 앱 밖에서 하고 오기</h1>
      <p class="result-sub">${doneTotal === 0 ? "하나면 충분해요. 제일 만만한 걸로 골라요." : `지금까지 ${doneTotal}개 탐험했어요. 보상은 배지뿐 — 그게 마이드림 방식이에요.`}</p>
      <div class="pick-summary">${progress.map((p) => `<span class="pick-tag">${esc(p.skill.name)} ${p.done}/${p.total}</span>`).join("")}</div>
      ${QUEST.skills.map((skill) => `
        <div class="section-label">${esc(skill.name)}</div>
        ${QUEST.missions.filter((m) => m.skill === skill.id).map((m) => {
          const done = doneMap[m.id];
          return `
          <div class="cluster-card${done ? " quest-done" : ""}">
            <div class="cluster-head"><span class="cluster-name">${esc(m.title)}</span>${done ? `<span class="cluster-match">완료 · ${esc(done.date)}</span>` : ""}</div>
            <div class="cluster-day">${esc(m.action)}</div>
            ${done && done.note ? `<div class="cluster-why">내 기록: ${esc(done.note)}</div>` : ""}
            ${done
              ? `<button class="skip-btn" data-undo="${m.id}">완료 취소</button>`
              : `<button class="ghost-btn quest-doing" data-doing="${m.id}">하고 왔어요</button>
                 <form class="lens-answer-form quest-form" id="qform-${m.id}" autocomplete="off" hidden>
                   <input class="search-input" id="qnote-${m.id}" type="text" maxlength="120" placeholder="뭘 발견했어요? (한 줄, 안 써도 돼요)" />
                   <button class="search-btn" type="submit">기록</button>
                 </form>`}
          </div>`;
        }).join("")}`).join("")}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-doing]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const form = document.getElementById("qform-" + btn.dataset.doing);
        form.hidden = false;
        btn.hidden = true;
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          const note = document.getElementById("qnote-" + btn.dataset.doing).value.trim();
          if (note && Care.detectCrisis(CARE, note)) return go("care-now");
          doneMap[btn.dataset.doing] = { date: todayKey(), note };
          saveJson(QUESTS_KEY, doneMap);
          renderQuests();
        });
      })
    );
    $screen.querySelectorAll("[data-undo]").forEach((btn) =>
      btn.addEventListener("click", () => {
        delete doneMap[btn.dataset.undo];
        saveJson(QUESTS_KEY, doneMap);
        renderQuests();
      })
    );
    window.scrollTo(0, 0);
  }

  // ---- 강점 저널·체크인 (모듈 D) ----
  const MOODS = [
    { id: "ok", e: "😌", label: "괜찮아요" },
    { id: "soso", e: "🙂", label: "그냥 그래요" },
    { id: "anxious", e: "😟", label: "좀 불안해요" },
    { id: "heavy", e: "😩", label: "무거워요" },
    { id: "dunno", e: "🤷", label: "모르겠어요" },
  ];

  function renderJournal() {
    const checkin = loadJson(CHECKIN_KEY);
    const todayMood = checkin && checkin.date === todayKey() ? checkin.mood : null;
    const entries = loadJson(JOURNAL_KEY) || [];
    const needCare = todayMood === "anxious" || todayMood === "heavy";
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">강점 저널</div>
      <h1 class="result-title">오늘, 진로 생각하면 어떤 기분이에요?</h1>
      <div class="mood-row">
        ${MOODS.map((m) => `<button class="mood-btn${todayMood === m.id ? " on" : ""}" data-mood="${m.id}"><span class="mood-e">${m.e}</span><span class="mood-label">${esc(m.label)}</span></button>`).join("")}
      </div>
      ${needCare ? `
        <div class="care-block">
          그런 날이 있어요. 진로 생각은 잠시 내려놔도 돼요.<br>
          아직 정해지지 않은 건 뒤처진 게 아니라 탐험 중이라는 뜻이에요.<br>
          지금은 3분짜리 작은 것 하나면 충분해요 — 아니면 아무것도 안 해도 돼요.
          <div class="care-block-actions">
            <button class="ghost-btn" data-nav="quests">3분짜리 미션 보기</button>
            <button class="ghost-btn" data-nav="help">이야기할 곳 보기</button>
          </div>
        </div>` : ""}
      <div class="section-label">오늘 시간이 빨리 갔던 순간이 있었어요?</div>
      <form id="journalForm" class="lens-answer-form" autocomplete="off">
        <input id="journalInput" class="search-input" type="text" maxlength="120" placeholder="한 줄이면 돼요" />
        <button class="search-btn" type="submit">남기기</button>
      </form>
      ${entries.length ? `
        <div class="section-label">쌓인 기록 ${entries.length}개 — 남과 비교하지 않는 나만의 신호예요</div>
        <button class="browse-link" data-nav="signal">내 신호 리포트 보기 →</button>
        ${entries.slice().reverse().slice(0, 20).map((en, i) => `
          <div class="journal-entry">
            <span class="journal-date">${esc(en.date)}</span>
            <span class="journal-text">${esc(en.text)}</span>
            <button class="journal-del" data-del="${entries.length - 1 - i}" aria-label="삭제">×</button>
          </div>`).join("")}` : `
        <div class="open-question">기록이 쌓이면 '내가 몰입하는 순간'의 패턴이 보여요. 오늘 하나면 충분해요.</div>`}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-mood]").forEach((btn) =>
      btn.addEventListener("click", () => {
        saveJson(CHECKIN_KEY, { date: todayKey(), mood: btn.dataset.mood });
        renderJournal();
      })
    );
    $screen.querySelectorAll("[data-nav=quests]").forEach((b) => b.addEventListener("click", () => go("quests")));
    $screen.querySelectorAll("[data-nav=help]").forEach((b) => b.addEventListener("click", () => go("help")));
    $screen.querySelectorAll("[data-nav=signal]").forEach((b) => b.addEventListener("click", () => go("signal")));
    document.getElementById("journalForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const text = document.getElementById("journalInput").value.trim();
      if (!text) return;
      if (Care.detectCrisis(CARE, text)) return go("care-now");
      entries.push({ date: todayKey(), text });
      saveJson(JOURNAL_KEY, entries);
      renderJournal();
    });
    $screen.querySelectorAll("[data-del]").forEach((btn) =>
      btn.addEventListener("click", () => {
        entries.splice(Number(btn.dataset.del), 1);
        saveJson(JOURNAL_KEY, entries);
        renderJournal();
      })
    );
    window.scrollTo(0, 0);
  }

  // ---- 신호 리포트 (여정 A 5단계 — 가설 제시, 단정 금지) ----
  function renderSignal() {
    const compassSaved = loadJson(COMPASS_KEY);
    let clusterTop = null;
    if (compassSaved) {
      const rs = Compass.scoreClusters(MD, compassSaved.picks);
      if (rs[0] && rs[0].score > 0) clusterTop = rs[0].cluster.name;
    }
    const reverseSaved = loadJson(REVERSE_KEY);
    let trackTop = null;
    if (reverseSaved && (reverseSaved.subjects || []).length) {
      const ts = Reverse.trackScores(MD, reverseSaved.subjects);
      if (ts[0]) trackTop = ts[0].track.name;
    }
    const entries = loadJson(JOURNAL_KEY) || [];
    const doneMap = loadJson(QUESTS_KEY) || {};
    const lensAnswers = loadJson(LENS_ANSWERS_KEY) || {};
    const report = Signal.buildReport({
      clusterTop, trackTop,
      compassDone: !!compassSaved,
      reverseDone: !!(reverseSaved && (reverseSaved.subjects || []).length),
      journalCount: entries.length,
      questDone: Object.keys(doneMap).length,
      lensCount: Object.keys(lensAnswers).length,
    });
    const clusterObj = clusterTop ? MD.clusters.find((c) => c.name === clusterTop) : null;
    const relatedJobs = clusterObj ? JOBS.jobs.filter((j) => j.clusterId === clusterObj.id) : [];
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">신호 리포트</div>
      ${report.total === 0 ? `
        <h1 class="result-title">아직 신호가 없어요 — 출발 전이라는 뜻이에요</h1>
        <p class="result-sub">신호는 검사 점수가 아니라 <strong>네가 남긴 흔적</strong>이에요. 하나면 시작돼요.</p>` : `
        <h1 class="result-title">지금까지 모인 신호 ${report.total}개</h1>
        <p class="result-sub">리포트는 정답이 아니라 신호의 요약이에요. 신호가 바뀌면 리포트도 바뀌어요.</p>
        <div class="pick-summary">${report.signals.filter((s) => s.count > 0).map((s) => `<span class="pick-tag">${esc(s.label)} ${s.count}</span>`).join("")}</div>`}
      ${report.hypothesis ? `
        <div class="lens-line">${esc(report.hypothesis)}</div>
        ${relatedJobs.length ? `<div class="section-label">확인해볼 조건 카드</div>${relatedJobs.map((jb) => `<button class="qcard" data-job="${jb.id}">${esc(jb.name)}<span class="qmeta">${esc(jb.summary)}</span></button>`).join("")}` : ""}
        <button class="ghost-btn" data-nav="explore">현실 접촉 — 체험 지도에서 하나 신청해보기</button>` : ""}
      ${report.total > 0 && !report.ready ? `<div class="open-question">신호 ${Signal.READY_THRESHOLD}개부터 가설을 만들어줄게요. 조금만 더 모아봐요.</div>` : ""}
      ${entries.length ? `
        <div class="section-label">최근 몰입 기록</div>
        ${entries.slice(-3).reverse().map((en) => `<div class="journal-entry"><span class="journal-date">${esc(en.date)}</span><span class="journal-text">${esc(en.text)}</span></div>`).join("")}` : ""}
      ${report.nextSteps.length ? `
        <div class="section-label">다음 신호 모으기</div>
        ${report.nextSteps.map((s) => `<button class="ghost-btn" data-step="${s.route}">${esc(s.label)}</button>`).join("")}` : ""}`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    const exploreBtn = $screen.querySelector("[data-nav=explore]");
    if (exploreBtn) exploreBtn.addEventListener("click", () => go("explore"));
    $screen.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => go(b.dataset.step)));
    wireJobLinks();
    window.scrollTo(0, 0);
  }

  // ---- 첫 일자리 방패 (모듈 E) ----
  function renderShield() {
    const checks = loadJson(SHIELD_CHECKS_KEY) || {};
    const doneCount = SHIELD.checklist.filter((c) => checks[c.id]).length;
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">첫 일자리 방패</div>
      <h1 class="result-title">일 시작 전에, 권리부터 챙겨요</h1>
      <p class="result-sub">${esc(SHIELD.disclaimer)}</p>

      <div class="cluster-card">
        <div class="cluster-name">얼마 받아야 해요? — 계산기</div>
        <div class="job-path soft">${SHIELD.minWage.year}년 최저시급 ${SHIELD.minWage.hourly.toLocaleString()}원 · 주 40시간 월 환산 ${SHIELD.minWage.monthly209.toLocaleString()}원</div>
        ${chipsHtml([SHIELD.minWage.chip])}
        <div class="calc-row">
          <label class="calc-label">시급 <input id="calcWage" class="search-input calc-input" type="number" value="${SHIELD.minWage.hourly}" min="0" step="10" /></label>
          <label class="calc-label">주당 시간 <input id="calcHours" class="search-input calc-input" type="number" value="15" min="0" max="60" step="1" /></label>
        </div>
        <div id="calcResult" class="calc-result"></div>
      </div>

      <div class="cluster-card">
        <div class="cluster-name">근로계약서에 꼭 있어야 하는 것</div>
        ${SHIELD.contractMust.map((c) => `<div class="job-path">· ${esc(c)}</div>`).join("")}
      </div>
      <div class="lens-counter">
        <strong>이러면 멈추고 확인해요</strong>
        ${SHIELD.redFlags.map((r) => `<div class="job-path">· ${esc(r)}</div>`).join("")}
      </div>

      <div class="cluster-card">
        <div class="cluster-name">첫 알바 전 체크리스트 <span class="cluster-match">${doneCount}/10</span></div>
        ${SHIELD.checklist.map((c) => `
          <label class="check-item"><input type="checkbox" data-check="${c.id}" ${checks[c.id] ? "checked" : ""} /> <span>${esc(c.text)}</span></label>`).join("")}
      </div>

      <div class="cluster-card">
        <div class="cluster-name">면접에서 이런 질문이 나오면</div>
        ${SHIELD.interviewRedFlags.map((q) => `<div class="job-path">· ${esc(q)}</div>`).join("")}
        <div class="cluster-why">${esc(SHIELD.interviewNote)}</div>
        <div class="cluster-why">${esc(SHIELD.rightsNote)}</div>
      </div>

      <button class="l3-btn" data-nav="help">문제가 생겼어요 — 도움 창구 열기</button>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelector("[data-nav=help]").addEventListener("click", () => go("help"));
    const updateCalc = () => {
      const p = Shield.calcPay(document.getElementById("calcWage").value, document.getElementById("calcHours").value);
      document.getElementById("calcResult").innerHTML = `
        <div class="job-path">주급 <strong>${p.weekly.toLocaleString()}원</strong> = 기본 ${p.base.toLocaleString()}원 ${p.hasJusu ? `+ 주휴수당 ${p.jusu.toLocaleString()}원` : "(주 15시간 미만이라 주휴수당은 없어요)"}</div>
        <div class="job-path">한 달이면 약 <strong>${p.monthly.toLocaleString()}원</strong></div>
        ${p.youthCapExceeded ? `<div class="cluster-why">만 18세 미만은 주 35시간이 기본 한도예요. 시간을 확인해봐요.</div>` : ""}`;
    };
    document.getElementById("calcWage").addEventListener("input", updateCalc);
    document.getElementById("calcHours").addEventListener("input", updateCalc);
    updateCalc();
    const checks2 = checks;
    $screen.querySelectorAll("[data-check]").forEach((box) =>
      box.addEventListener("change", () => {
        if (box.checked) checks2[box.dataset.check] = true; else delete checks2[box.dataset.check];
        saveJson(SHIELD_CHECKS_KEY, checks2);
      })
    );
    window.scrollTo(0, 0);
  }

  // ---- 포트폴리오 (핵심 3개 큐레이션 + 문장 초안) ----
  function renderPortfolio() {
    const records = Portfolio.collectRecords({
      quests: loadJson(QUESTS_KEY) || {},
      journal: loadJson(JOURNAL_KEY) || [],
      lensAnswers: loadJson(LENS_ANSWERS_KEY) || {},
    }, { QUEST, LENS });
    let picked = (loadJson(PORTFOLIO_KEY) || []).filter((k) => records.some((r) => r.key === k));
    const draw = () => {
      const chosen = picked.map((k) => records.find((r) => r.key === k));
      const draft = Portfolio.combinedDraft(chosen);
      $screen.innerHTML = `
        <button class="answer-back" data-nav="back">← 뒤로</button>
        <div class="tool-kicker">포트폴리오</div>
        <h1 class="result-title">많이 말고, 연결되게 — 3개만 골라요</h1>
        <p class="result-sub">생기부 기재가 짧아진 시대엔 양보다 <strong>연결</strong>이에요. 흔적 중에 이야기가 되는 3개를 골라요.</p>
        ${records.length === 0 ? `
          <div class="open-question">아직 모은 흔적이 없어요. 퀘스트 하나, 저널 한 줄이면 재료가 생겨요.</div>
          <button class="ghost-btn" data-go="quests">탐험 퀘스트 열기</button>
          <button class="ghost-btn" data-go="journal">강점 저널 열기</button>` : `
          ${records.map((r) => `
            <button class="qcard${picked.includes(r.key) ? " lens-today" : ""}" data-pick="${r.key}">
              ${esc(r.label)}<span class="qmeta">${esc(r.type)}${r.date ? " · " + esc(r.date) : ""}${r.detail ? " · " + esc(r.detail) : ""}</span>
            </button>`).join("")}
          ${chosen.length ? `
            <div class="section-label">문장 초안 · ${draft.length}자 (그대로 붙여넣지 말고 내 말로 다듬어요)</div>
            <div class="cluster-card"><div class="job-path">${esc(draft)}</div></div>
            <button class="l3-btn" id="copyDraft">초안 복사하기</button>
            <div id="copyNote" class="l3-note">복사했어요. 빈칸(______)은 네 말로 채워요 — 그게 진짜 이야기예요.</div>` : `
            <div class="open-question">위에서 최대 3개를 골라봐요. 고르면 문장 초안을 만들어줄게요.</div>`}`}`;
      $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
      $screen.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
      $screen.querySelectorAll("[data-pick]").forEach((btn) =>
        btn.addEventListener("click", () => {
          const k = btn.dataset.pick;
          if (picked.includes(k)) picked = picked.filter((x) => x !== k);
          else if (picked.length < Portfolio.MAX_PICK) picked.push(k);
          saveJson(PORTFOLIO_KEY, picked);
          draw();
        })
      );
      const copyBtn = document.getElementById("copyDraft");
      if (copyBtn) copyBtn.addEventListener("click", () => {
        const chosen2 = picked.map((k) => records.find((r) => r.key === k));
        copyText(Portfolio.combinedDraft(chosen2), "copyNote", "복사했어요. 빈칸(______)은 네 말로 채워요 — 그게 진짜 이야기예요.");
      });
    };
    draw();
    window.scrollTo(0, 0);
  }

  // ---- 부모 대화 카드 (+ 다국어 요약) ----
  const parentsState = { worry: null, lang: "ko" };

  function renderParents() {
    const w = PARENTS.worries.find((x) => x.id === parentsState.worry) || null;
    const share = PARENTS.shareCard.texts[parentsState.lang];
    $screen.innerHTML = `
      <button class="answer-back" data-nav="back">← 뒤로</button>
      <div class="tool-kicker">부모님과 나</div>
      <h1 class="result-title">이기는 대화 말고, 같은 자료를 보는 대화</h1>
      <p class="result-sub">${esc(PARENTS.intro)}</p>
      <div class="subject-grid">
        ${PARENTS.worries.map((x) => `<button class="subject-chip${parentsState.worry === x.id ? " on" : ""}" data-worry="${x.id}">${esc(x.label)}</button>`).join("")}
      </div>
      ${w ? `
        <div class="cluster-card">
          <div class="cluster-day">${esc(w.parentLine)}</div>
          ${w.facts.map((f) => `<div class="job-path">· ${esc(f.text)}</div>${f.chip ? chipsHtml([f.chip]) : ""}`).join("")}
          <div class="cluster-why">${esc(w.bridge)}</div>
        </div>
        <div class="section-label">대화를 여는 질문 3개 (내가 먼저)</div>
        ${w.questions.map((q) => `<div class="cluster-card"><div class="job-path">"${esc(q)}"</div></div>`).join("")}` : ""}
      <div class="section-label">부모님 공유용 요약 카드</div>
      <div class="subject-grid">
        ${PARENTS.shareCard.langs.map((l) => `<button class="subject-chip${parentsState.lang === l.id ? " on" : ""}" data-lang="${l.id}">${esc(l.label)}</button>`).join("")}
      </div>
      <div class="cluster-card share-card">
        <div class="cluster-name">${esc(share.title)}</div>
        ${share.body.map((b) => `<div class="job-path">${esc(b)}</div>`).join("")}
      </div>
      <button class="l3-btn" id="copyShare">요약 카드 복사하기</button>
      <div id="shareNote" class="l3-note">복사했어요. 메신저로 보내드리거나 화면을 보여드려요.</div>`;
    $screen.querySelector("[data-nav=back]").addEventListener("click", () => history.back());
    $screen.querySelectorAll("[data-worry]").forEach((b) =>
      b.addEventListener("click", () => { parentsState.worry = parentsState.worry === b.dataset.worry ? null : b.dataset.worry; renderParents(); })
    );
    $screen.querySelectorAll("[data-lang]").forEach((b) =>
      b.addEventListener("click", () => { parentsState.lang = b.dataset.lang; renderParents(); })
    );
    document.getElementById("copyShare").addEventListener("click", () => {
      const t = PARENTS.shareCard.texts[parentsState.lang];
      copyText(t.title + "\n" + t.body.join("\n"), "shareNote", "복사했어요. 메신저로 보내드리거나 화면을 보여드려요.");
    });
    window.scrollTo(0, 0);
  }

  function wireCards() {
    $screen.querySelectorAll("[data-q]").forEach((btn) =>
      btn.addEventListener("click", () => go("q/" + btn.dataset.q))
    );
  }

  // ---- 라우팅 ----
  function go(route) { location.hash = "#" + route; }
  function route() {
    const grade = getGrade();
    const hash = location.hash.replace(/^#/, "") || "home";
    if (!grade && hash !== "onboarding") return go("onboarding");
    $gradeBtn.textContent = grade ? (grade === "학교밖" ? "학교 밖" : grade) + " · 바꾸기" : "";
    if (hash === "onboarding") return renderOnboarding();
    if (hash === "browse") return renderBrowse();
    if (hash === "compass") { compassState.step = -1; return renderCompass(); }
    if (hash === "reverse") return renderReverse();
    if (hash === "search") return renderSearch();
    if (hash === "care-now") return renderCareNow();
    if (hash === "help") return renderHelp();
    if (hash === "lens") return renderLensHome();
    if (hash.startsWith("lens/")) return renderLensCard(hash.slice(5));
    if (hash === "jobs") return renderJobs();
    if (hash.startsWith("job/")) return renderJob(hash.slice(4));
    if (hash === "explore") return renderExplore();
    if (hash === "quests") return renderQuests();
    if (hash === "journal") return renderJournal();
    if (hash === "signal") return renderSignal();
    if (hash === "shield") return renderShield();
    if (hash === "portfolio") return renderPortfolio();
    if (hash === "parents") return renderParents();
    if (hash === "jobdex") return renderJobdex();
    if (hash === "paths") return renderPaths();
    if (hash === "hischool") return renderHischool();
    if (hash === "majors") return renderMajors();
    if (hash === "artprep") return renderArtprep();
    if (hash === "altschools") return renderAltschools();
    if (hash.startsWith("altschool/")) return renderAltschoolDetail(hash.slice(10));
    if (hash.startsWith("guide/")) return renderGuide(hash.slice(6));
    if (hash.startsWith("q/")) return renderAnswer(hash.slice(2));
    return renderHome();
  }

  const $helpFooter = document.getElementById("helpFooterBtn");
  if ($helpFooter) $helpFooter.addEventListener("click", () => go("help"));
  document.getElementById("brandBtn").addEventListener("click", () => go("home"));
  $gradeBtn.addEventListener("click", () => go("onboarding"));
  window.addEventListener("hashchange", route);
  route();
})();
