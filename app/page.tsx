"use client";

import { useEffect, useMemo, useState } from "react";
import { totalExamCoveredWords, totalExamExamples, totalIdiomCoveredWords, totalIdiomEntries, totalIdiomLinks, totalOfficiallyCheckedIdioms, totalTextbookExamples, totalVerifiedSenses, verifiedWords } from "./data/verified-words";
import { functionWordExamGroups, realWordExamGroups, totalDatedFunctionWordExamExamples, totalDatedRealWordExamExamples, totalFunctionWordExamExamples, totalRealWordExamExamples, type ExamExample } from "./data/exam-data";

type SectionId = "home" | "words" | "texts" | "exam" | "resources";
type ReviewRating = "again" | "hard" | "good";
type ReviewRecord = { nextReview: number; intervalDays: number; repetitions: number; lastRating: ReviewRating };

const navItems: Array<{ id: SectionId; label: string; short: string; hint: string }> = [
  { id: "home", label: "学习总览", short: "览", hint: "课堂与复习入口" },
  { id: "words", label: "实词实验室", short: "实", hint: "字形、义脉与语境" },
  { id: "texts", label: "课文复习", short: "课", hint: "按教材篇目串联" },
  { id: "exam", label: "高考语义地图", short: "考", hint: "真题语境与考法" },
  { id: "resources", label: "资料库", short: "库", hint: "来源与核验状态" },
];

const researchWorks = [
  "陆宗达《说文解字通论》", "裘锡圭《文字学概要》", "王凤阳《汉字学》",
  "王宁《汉字构形学讲座》", "王宁《汉字学概要》", "许慎撰、徐铉校定《说文解字》",
  "邹晓丽《基础汉字形义释源》",
];

const seminars = [
  "《学术论著专题研讨》", "《汉字汉语专题研讨》", "《中华传统文化专题研讨》",
  "《中国现当代作家作品专题研讨》", "《中国革命传统作品专题研讨》",
];

const teachingResources = [
  "七年级上册（2024秋版）语文电子课本", "七年级下册（2025春版）语文电子课本",
  "八年级上册", "八年级下册", "九年级下册", "高中语文必修上", "高中语文必修下",
  "高中语文选择性必修上", "高中语文选择性必修中", "高中语文选择性必修下",
  "高中语文统编版学习任务汇总", "120实词归档版", "文言文实词关联成语120个", "文言文阅读十年汇编（原卷版）",
  "文言文阅读十年汇编（答案版）", "2026高考文学类文本教考衔接资料",
  "120个文言实词高考真题关联句翻译辅助", "18个文言虚词高考真题关联句翻译辅助",
];

const publicReferenceWorks = ["教育部《成语典》2020（2026-06-25 数据版）"];

const learningPath = ["看字形", "猜本义", "理义脉", "回教材", "联成语", "对高考", "再复习"];
const taughtWordsStorageKey = "pp-wenyan-lab-taught-words";
const reviewRecordsStorageKey = "pp-wenyan-lab-review-records";
const textbookVolumeOrder = ["七年级上册（2024秋版）", "七年级下册（2025春版）", "八年级上册", "八年级下册", "九年级下册", "高中语文必修上", "高中语文必修下", "高中语文选择性必修上", "高中语文选择性必修中", "高中语文选择性必修下"];
const pickRandom = <T,>(items: T[], fallback: T) => items[Math.floor(Math.random() * items.length)] ?? fallback;
const cleanReferenceLabel = (value: string) => value.replace(/[＃※]/g, "").replace(/\*\d+\*/g, "").replace(/\n/g, "；").trim();
const textbookLessons = (() => {
  const lessons = new Map<string, { id: string; title: string; volume: string; examples: Array<{ character: string; wordIndex: number; sentence: string; pdfPage: number; matchedMeaning: string }> }>();
  verifiedWords.forEach((word) => word.textbookExamples.forEach((example) => {
    const id = `${example.volume}|${example.title}`;
    const lesson = lessons.get(id) ?? { id, title: example.title, volume: example.volume, examples: [] };
    lesson.examples.push({ character: word.character, wordIndex: word.index, sentence: example.sentence, pdfPage: example.pdfPage, matchedMeaning: example.matchedMeaning });
    lessons.set(id, lesson);
  }));
  return [...lessons.values()].sort((a, b) => textbookVolumeOrder.indexOf(a.volume) - textbookVolumeOrder.indexOf(b.volume) || a.title.localeCompare(b.title, "zh-CN"));
})();

export default function Home() {
  const [section, setSection] = useState<SectionId>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestedWord, setRequestedWord] = useState("爱");
  const current = useMemo(() => navItems.find((item) => item.id === section) ?? navItems[0], [section]);
  const chooseSection = (next: SectionId) => {
    setSection(next); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openWord = (character: string) => { setRequestedWord(character); chooseSection("words"); };

  return (
    <div className="app-shell">
      <div className="paper-grain" aria-hidden="true" />
      <aside className={`sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="brand">
          <div className="brand-seal" aria-hidden="true"><span>pp</span></div>
          <div><p className="brand-name">pp的文言实验室</p><p className="brand-tagline">一字一脉 · 通古达今</p></div>
        </div>
        <nav className="side-nav" aria-label="主要功能">
          {navItems.map((item) => (
            <button className={`nav-item ${section === item.id ? "active" : ""}`} key={item.id} onClick={() => chooseSection(item.id)} type="button">
              <span className="nav-glyph" aria-hidden="true">{item.short}</span>
              <span><strong>{item.label}</strong><small>{item.hint}</small></span>
            </button>
          ))}
        </nav>
        <div className="source-promise"><span className="promise-mark" aria-hidden="true">据</span><div><strong>资料优先</strong><p>只呈现已核验内容；缺失处明确标记。</p></div></div>
      </aside>
      {mobileMenuOpen && <button className="menu-backdrop" aria-label="关闭导航" onClick={() => setMobileMenuOpen(false)} />}

      <main className="main-canvas">
        <header className="topbar">
          <button className="menu-button" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="打开导航"><span /><span /><span /></button>
          <div className="breadcrumb"><span>文言学习工作台</span><i>/</i><strong>{current.label}</strong></div>
          <div className="shared-mode"><span>课堂 · 自学共用</span></div>
        </header>
        <div className="page-frame" key={section}>
          {section === "home" && <Dashboard goTo={chooseSection} />}
          {section === "words" && <WordsLab initialCharacter={requestedWord} />}
          {section === "texts" && <TextsReview openWord={openWord} />}
          {section === "exam" && <ExamMap openWord={openWord} />}
          {section === "resources" && <Resources />}
        </div>
      </main>
      <nav className="mobile-nav" aria-label="移动端主要功能">
        {navItems.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => chooseSection(item.id)} type="button"><span>{item.short}</span>{item.label.replace("实验室", "").replace("语义地图", "")}</button>)}
      </nav>
    </div>
  );
}

function Dashboard({ goTo }: { goTo: (section: SectionId) => void }) {
  return <>
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="eyebrow"><span />第七轮 · 高考关联资料已接入</div>
        <h1>从一个字出发，走通一条清楚的义脉</h1>
        <p>适合课堂展示与自主复习的文言学习工作台。先观察、再推测，沿着字形、本义、义脉、教材、成语与高考语境逐步验证。</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => goTo("words")} type="button">进入实词实验室 <span>→</span></button><button className="text-button" onClick={() => goTo("resources")} type="button">查看已收录资料</button></div>
      </div>
      <div className="path-card" aria-label="完整学习路径">
        <div className="path-heading"><span>认知路径</span><small>完整走一遍，才算真正认识</small></div>
        <div className="path-flow">{learningPath.map((step, index) => <div className="path-step" key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}</div>
        <div className="ink-circle" aria-hidden="true">文</div>
      </div>
    </section>

    <section className="stat-row" aria-label="资料库概况">
      <div className="stat-card"><strong>31</strong><span>项资料依据</span><small>30 项上传资料 · 1 项公开核验源</small></div>
      <div className="stat-card"><strong>10</strong><span>册语文教材</span><small>初高中教材文件</small></div>
      <div className="stat-card"><strong>7</strong><span>部文字学著作</span><small>字形与本义的重要依据</small></div>
      <div className="stat-card warning"><strong>120</strong><span>个文言实词</span><small>{totalVerifiedSenses} 条带例句义项已据资料接入</small></div>
    </section>

    <div className="content-grid">
      <section className="section-card modules-card">
        <div className="section-heading"><div><span className="section-kicker">工作台</span><h2>学习模块</h2></div><span className="quiet-tag">按轮次逐步开放</span></div>
        <div className="module-grid">
          <ModuleCard glyph="实" title="实词实验室" note="观察、猜测、义项、教材与成语" status={`${totalIdiomEntries}条成语关联已接入`} active onClick={() => goTo("words")} />
          <ModuleCard glyph="课" title="按课文复习" note="从教材原句回看重点词义" status="第四轮已开放" onClick={() => goTo("texts")} />
          <ModuleCard glyph="抽" title="随机抽字" note="课堂提问与课后自测入口" status="第四轮已开放" onClick={() => goTo("texts")} />
          <ModuleCard glyph="考" title="高考语义地图" note="连接实词、虚词与真题语境" status={`${totalDatedRealWordExamExamples + totalDatedFunctionWordExamExamples}条标注年份关联`} onClick={() => goTo("exam")} />
        </div>
      </section>
      <aside className="section-card guard-card">
        <div className="section-heading compact"><div><span className="section-kicker">资料原则</span><h2>每一条，都要有来处</h2></div><span className="red-seal">真</span></div>
        <ul className="guard-list"><li><span>教材</span><p>原句须从已上传教材定位并核验。</p></li><li><span>字形</span><p>古文字形与本义须标明研究依据。</p></li><li><span>高考</span><p>年份、题干、答案与解析逐项核对。</p></li><li><span>缺失</span><p>未找到可靠材料时显示“暂无资料”。</p></li></ul>
      </aside>
    </div>
    <section className="section-card source-strip"><div className="source-strip-title"><span>本义研究依据</span><small>已收录 · 待建立页码级索引</small></div><div className="source-pills">{researchWorks.slice(0, 6).map((work) => <span key={work}>{work}</span>)}<button type="button" onClick={() => goTo("resources")}>全部资料 +</button></div></section>
  </>;
}

function ModuleCard({ glyph, title, note, status, active = false, onClick }: { glyph: string; title: string; note: string; status: string; active?: boolean; onClick?: () => void }) {
  return <button className={`module-card ${active ? "featured" : ""}`} type="button" onClick={onClick}><span className="module-glyph">{glyph}</span><span className="module-copy"><strong>{title}</strong><small>{note}</small></span><span className="module-status">{status}</span></button>;
}

function WordsLab({ initialCharacter }: { initialCharacter: string }) {
  const [activeCharacter, setActiveCharacter] = useState(verifiedWords.some((word) => word.character === initialCharacter) ? initialCharacter : verifiedWords[0].character);
  const [query, setQuery] = useState("");
  const [grammar, setGrammar] = useState("全部");
  const [showTranslations, setShowTranslations] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [lessonWords, setLessonWords] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"journey" | "catalog" | "review">("journey");
  const [journeyStage, setJourneyStage] = useState(0);
  const [unlockedStage, setUnlockedStage] = useState(0);
  const [guessSelection, setGuessSelection] = useState<string | null>(null);
  const [progressFilter, setProgressFilter] = useState<"all" | "taught" | "untaught">("all");
  const [taughtWords, setTaughtWords] = useState<string[]>([]);
  const [reviewRecords, setReviewRecords] = useState<Record<string, ReviewRecord>>({});
  const [reviewClock, setReviewClock] = useState(0);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const activeWord = verifiedWords.find((word) => word.character === activeCharacter) ?? verifiedWords[0];
  const grammarOptions = ["全部", "名词", "动词", "形容词", "其他"];
  const filteredWords = verifiedWords.filter((word) => {
    const haystack = [word.index, word.character, word.pinyin, ...word.senses.flatMap((sense) => [sense.meaning, sense.sentence, sense.reference]), ...word.idiomExamples.flatMap((example) => [example.idiom, example.explanation, example.officialVerification?.traditional, example.officialVerification?.sourceTitle]), ...word.examExamples.flatMap((example) => [example.sourceLabel, ...example.paragraphs])].join(" ");
    const matchesQuery = haystack.toLowerCase().includes(query.trim().toLowerCase());
    const isTaught = taughtWords.includes(word.character);
    const matchesProgress = progressFilter === "all" || (progressFilter === "taught" ? isTaught : !isTaught);
    return matchesQuery && matchesProgress;
  });
  const visibleSenses = activeWord.senses.filter((sense) => {
    if (grammar === "全部") return true;
    if (grammar === "其他") return !["名词", "动词", "形容词"].some((item) => sense.grammar.startsWith(item));
    return sense.grammar.startsWith(grammar);
  });
  const inLesson = lessonWords.includes(activeWord.character);
  const isTaught = taughtWords.includes(activeWord.character);
  const toggleLesson = () => setLessonWords((words) => inLesson ? words.filter((word) => word !== activeWord.character) : [...words, activeWord.character]);
  const toggleTaught = () => setTaughtWords((words) => isTaught ? words.filter((word) => word !== activeWord.character) : [...words, activeWord.character]);
  const chooseWord = (character: string) => {
    setActiveCharacter(character); setGrammar("全部"); setJourneyStage(0); setUnlockedStage(0); setGuessSelection(null);
  };
  const advanceJourney = (next: number) => { setJourneyStage(next); setUnlockedStage((current) => Math.max(current, next)); };
  const reviewWords = taughtWords.length ? verifiedWords.filter((word) => taughtWords.includes(word.character)) : verifiedWords;
  const rateReview = (character: string, rating: ReviewRating) => {
    const now = Date.now();
    setReviewRecords((records) => {
      const previous = records[character];
      const intervalDays = rating === "again" ? 0 : rating === "hard" ? Math.max(1, previous?.intervalDays ?? 1) : Math.min(30, Math.max(3, (previous?.intervalDays ?? 1) * 2));
      return { ...records, [character]: { nextReview: rating === "again" ? now : now + intervalDays * 86_400_000, intervalDays, repetitions: rating === "again" ? 0 : (previous?.repetitions ?? 0) + 1, lastRating: rating } };
    });
    setReviewClock(now);
  };

  useEffect(() => {
    const restoreProgress = window.requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(window.localStorage.getItem(taughtWordsStorageKey) ?? "[]");
        const knownCharacters = new Set(verifiedWords.map((word) => word.character));
        if (Array.isArray(saved)) setTaughtWords([...new Set(saved.filter((character): character is string => typeof character === "string" && knownCharacters.has(character)))]);
        const savedReviews = JSON.parse(window.localStorage.getItem(reviewRecordsStorageKey) ?? "{}");
        if (savedReviews && typeof savedReviews === "object" && !Array.isArray(savedReviews)) {
          const validReviews = Object.fromEntries(Object.entries(savedReviews).filter(([character, record]) => knownCharacters.has(character) && record && typeof record === "object" && Number.isFinite((record as ReviewRecord).nextReview) && Number.isFinite((record as ReviewRecord).intervalDays)));
          setReviewRecords(validReviews as Record<string, ReviewRecord>);
        }
      } catch {
        setTaughtWords([]);
        setReviewRecords({});
      } finally {
        setReviewClock(Date.now());
        setProgressLoaded(true);
      }
    });
    return () => window.cancelAnimationFrame(restoreProgress);
  }, []);

  useEffect(() => {
    if (progressLoaded) {
      window.localStorage.setItem(taughtWordsStorageKey, JSON.stringify(taughtWords));
      window.localStorage.setItem(reviewRecordsStorageKey, JSON.stringify(reviewRecords));
    }
  }, [progressLoaded, reviewRecords, taughtWords]);

  return <section className={`workspace-section words-workspace ${focusMode ? "focus-mode" : ""}`}>
    <div className="page-heading">
      <div><span className="section-kicker">第七轮 · 高考关联资料</span><h1>实词实验室</h1><p>120 个实词已按上传资料顺序完整接入；教材、成语和高考关联分别注明来源，名单差异与原文件异常均明确标注。</p></div>
      <span className="stage-badge">120 字 · {totalIdiomEntries} 条成语 · {totalExamExamples} 条高考关联</span>
    </div>
    <div className="lab-mode-row">
      <div className="lab-mode-switch"><button type="button" className={viewMode === "journey" ? "active" : ""} onClick={() => setViewMode("journey")}>分步探索</button><button type="button" className={viewMode === "catalog" ? "active" : ""} onClick={() => setViewMode("catalog")}>义项全览</button><button type="button" className={viewMode === "review" ? "active" : ""} onClick={() => setViewMode("review")}>卡片复习</button></div>
      <div className="progress-filter" role="group" aria-label="按已讲状态筛选">
        <button type="button" className={progressFilter === "all" ? "active" : ""} onClick={() => setProgressFilter("all")}>全部 {verifiedWords.length}</button>
        <button type="button" className={progressFilter === "taught" ? "active" : ""} onClick={() => setProgressFilter("taught")}>已讲 {taughtWords.length}</button>
        <button type="button" className={progressFilter === "untaught" ? "active" : ""} onClick={() => setProgressFilter("untaught")}>未讲 {verifiedWords.length - taughtWords.length}</button>
      </div>
      <label className="mobile-word-picker"><span>选择实词</span><select aria-label="选择实词" value={filteredWords.some((word) => word.character === activeWord.character) ? activeWord.character : ""} onChange={(event) => event.target.value && chooseWord(event.target.value)}>{filteredWords.length ? filteredWords.map((word) => <option key={word.character} value={word.character}>{word.index}. {word.character} · {word.pinyin}</option>) : <option value="" disabled>当前筛选暂无实词</option>}</select></label>
      <button type="button" className={`taught-toggle ${isTaught ? "active" : ""}`} aria-pressed={isTaught} onClick={toggleTaught}>{isTaught ? "✓ 已讲" : "标记为已讲"}</button>
    </div>
    {viewMode !== "review" && <div className="lab-path">{learningPath.map((step, index) => <button type="button" disabled={viewMode === "journey" && index > unlockedStage} onClick={() => viewMode === "journey" && setJourneyStage(index)} className={viewMode === "journey" && index === journeyStage ? "current" : index <= unlockedStage ? "unlocked" : ""} key={step}><i>{index + 1}</i>{step}</button>)}</div>}
    <div className="lab-layout populated">
      <aside className="word-drawer">
        <div className="drawer-heading"><strong>实词目录</strong><span>{filteredWords.length} / {verifiedWords.length}</span></div>
        <label className="fake-search"><span>⌕</span><input aria-label="搜索实词" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索字、篇目、成语或义项" /></label>
        <div className="word-list">
          {filteredWords.map((word) => <button type="button" key={word.character} className={word.character === activeWord.character ? "active" : ""} onClick={() => chooseWord(word.character)}><span>{word.character}</span><div><strong>{String(word.index).padStart(3, "0")} · {word.pinyin}</strong><small>{word.senses.length} 个义项{taughtWords.includes(word.character) ? " · 已讲" : ""}</small></div><i>›</i></button>)}
          {filteredWords.length === 0 && <p className="no-result">120 个词条中没有匹配内容</p>}
        </div>
        <div className="drawer-foot"><span>据</span><p>资料来源<br /><strong>《120实词归档版》</strong></p></div>
      </aside>

      <article className="word-canvas">
        {viewMode !== "review" && <header className="word-hero">
          <div className={`character-block ${focusMode ? "enlarged" : ""}`}><strong>{activeWord.character}</strong><span>{activeWord.pinyin}</span></div>
          <div className="word-meta"><h2>{activeWord.senses.length} 个义项</h2><p>{activeWord.readings ?? `读音：${activeWord.pinyin}`}</p>{activeWord.verificationNotes?.map((note) => <small className="word-verification-note" key={note}>核验：{note}</small>)}</div>
          <div className="source-status"><span>资料状态</span><strong>实词义项已录入</strong><small>教材原句 · {activeWord.textbookExamples.length ? `已核验 ${activeWord.textbookExamples.length} 条` : "暂无关联"}</small><small>成语 · {activeWord.idiomExamples.length ? `已录入 ${activeWord.idiomExamples.length} 条` : "暂无可靠关联"}</small><small>高考关联 · {activeWord.examExamples.length ? `已录入 ${activeWord.examExamples.length} 条` : "暂无可靠关联"}</small><small>古文字形 · 暂无资料</small></div>
        </header>}

        {viewMode === "review" ? <SpacedReview words={reviewWords} records={reviewRecords} now={reviewClock} onRate={rateReview} onOpenWord={(character) => { chooseWord(character); setViewMode("journey"); }} usingTaughtWords={taughtWords.length > 0} /> : viewMode === "journey" ? <LearningJourney word={activeWord} stage={journeyStage} advance={advanceJourney} guessSelection={guessSelection} setGuessSelection={setGuessSelection} /> : <><div className="sense-toolbar">
          <div className="grammar-tabs" role="group" aria-label="按词性筛选">{grammarOptions.map((item) => <button type="button" key={item} onClick={() => setGrammar(item)} className={grammar === item ? "active" : ""}>{item}</button>)}</div>
          <button type="button" className="translation-toggle" onClick={() => setShowTranslations((show) => !show)}>{showTranslations ? "收起译文" : "展开译文"}</button>
        </div>

        <div className="sense-list">
          {visibleSenses.map((sense, index) => <article className="sense-card" key={`${sense.grammar}-${sense.meaning}-${index}`}>
            <div className="sense-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="sense-body">
              <div className="sense-title"><span>{sense.grammar}</span><h3>{showTranslations ? sense.meaning : "释义已隐藏"}</h3>{sense.sourceMarksOriginal && <small>资料标注“本意”</small>}</div>
              <blockquote>{sense.sentence}</blockquote>
              <div className="sentence-source">条目来源：{sense.reference}</div>
              {sense.verificationNote && <p className="verification-note">核验说明：{sense.verificationNote}</p>}
              {showTranslations ? <p className="translation"><span>译</span>{sense.translation}</p> : <button type="button" className="reveal-one" onClick={() => setShowTranslations(true)}>点击揭晓释义与译文</button>}
            </div>
          </article>)}
          {visibleSenses.length === 0 && <div className="no-sense"><span>暂无</span><p>该词在上传资料中没有此词性义项。</p></div>}
        </div></>}
      </article>

      <aside className="lesson-panel active-tools">
        <div className="drawer-heading"><strong>学习工具</strong><span>课堂 · 自学</span></div>
        <button type="button" className={focusMode ? "active" : ""} onClick={() => setFocusMode((focus) => !focus)}><span>放</span>{focusMode ? "恢复字形" : "放大字形"}</button>
        <button type="button" className={!showTranslations ? "active" : ""} onClick={() => setShowTranslations((show) => !show)}><span>隐</span>{showTranslations ? "隐藏释义" : "显示释义"}</button>
        <button type="button" className={isTaught ? "active" : ""} onClick={toggleTaught}><span>讲</span>{isTaught ? "取消已讲" : "标记已讲"}</button>
        <button type="button" className={inLesson ? "active" : ""} onClick={toggleLesson}><span>课</span>{inLesson ? "移出本课" : "加入本课"}</button>
        <div className="lesson-basket"><span>本课字篮</span><strong>{lessonWords.length}</strong><p>{lessonWords.length ? lessonWords.join(" · ") : "尚未添加实词"}</p></div>
        <div className="tool-note"><strong>资料边界</strong><p>首批成语采用公开授权的教育部《成语典》核验；未建立可靠对应的词不自动补全。</p></div>
      </aside>
    </div>
  </section>;
}

function SpacedReview({ words, records, now, onRate, onOpenWord, usingTaughtWords }: {
  words: (typeof verifiedWords)[number][];
  records: Record<string, ReviewRecord>;
  now: number;
  onRate: (character: string, rating: ReviewRating) => void;
  onOpenWord: (character: string) => void;
  usingTaughtWords: boolean;
}) {
  const [answerVisible, setAnswerVisible] = useState(false);
  const [cursor, setCursor] = useState(0);
  const dueWords = words.filter((word) => !records[word.character] || records[word.character].nextReview <= now);
  const word = dueWords[cursor % Math.max(dueWords.length, 1)];
  const nextReview = words.map((item) => records[item.character]?.nextReview).filter((value): value is number => typeof value === "number" && value > now).sort((a, b) => a - b)[0];
  const rate = (rating: ReviewRating) => {
    if (!word) return;
    onRate(word.character, rating);
    if (rating === "again") setCursor((current) => current + 1);
    setAnswerVisible(false);
  };

  if (!word) return <div className="review-deck review-complete">
    <span className="review-kicker">本轮完成</span><strong>今日到期卡片已复习完</strong><p>{nextReview ? `下一次安排：${new Date(nextReview).toLocaleDateString("zh-CN")}` : "当前没有等待复习的实词。"}</p>
  </div>;

  const textbookExample = word.textbookExamples[0];
  return <div className="review-deck">
    <div className="review-deck-head"><div><span className="review-kicker">Anki 式卡片复习</span><h2>先回忆，再揭晓</h2></div><div className="review-count"><strong>{dueWords.length}</strong><span>张今日待复习</span></div></div>
    <p className="review-source-note">{usingTaughtWords ? `当前使用 ${words.length} 个“已讲”实词组卡。` : "尚未标记“已讲”实词，当前暂从全部 120 字中组卡。"} 卡片答案只读取已接入资料。</p>
    <article className={`review-card ${answerVisible ? "is-revealed" : ""}`}>
      <div className="review-card-front"><small>第 {word.index} 词</small><strong>{word.character}</strong><span>{word.pinyin}</span><p>请先说出本义线索、常见义项，或一条教材原句。</p></div>
      {answerVisible && <div className="review-card-back">
        <div><span>资料义项</span><ul>{word.senses.slice(0, 4).map((sense, index) => <li key={`${sense.meaning}-${index}`}><small>{sense.grammar}</small>{sense.meaning}{sense.sourceMarksOriginal && <em>资料标注“本意”</em>}</li>)}</ul>{word.senses.length > 4 && <p>另有 {word.senses.length - 4} 个义项，可进入完整学习路径查看。</p>}</div>
        <div><span>教材核验</span>{textbookExample ? <blockquote>{textbookExample.sentence}<small>《{textbookExample.title}》· {textbookExample.volume}</small></blockquote> : <p>暂无已核验教材原句。</p>}</div>
      </div>}
    </article>
    {!answerVisible ? <button className="review-reveal" type="button" onClick={() => setAnswerVisible(true)}>显示资料答案</button> : <div className="review-rating" aria-label="评价本次回忆"><button type="button" onClick={() => rate("again")}><strong>重来</strong><small>本轮再见</small></button><button type="button" onClick={() => rate("hard")}><strong>模糊</strong><small>明天复习</small></button><button type="button" onClick={() => rate("good")}><strong>掌握</strong><small>3 天起复习</small></button></div>}
    <div className="review-foot"><span>复习安排保存在当前设备</span><button type="button" onClick={() => onOpenWord(word.character)}>进入“{word.character}”的完整学习路径 →</button></div>
  </div>;
}

function LearningJourney({ word, stage, advance, guessSelection, setGuessSelection }: {
  word: (typeof verifiedWords)[number];
  stage: number;
  advance: (next: number) => void;
  guessSelection: string | null;
  setGuessSelection: (selection: string | null) => void;
}) {
  const markedOriginal = word.senses.find((sense) => sense.sourceMarksOriginal);
  const guessOptions = markedOriginal
    ? [markedOriginal, ...word.senses.filter((sense) => sense !== markedOriginal).slice(0, 2)]
    : word.senses.slice(0, 3);
  const guessIsCorrect = Boolean(markedOriginal && guessSelection === markedOriginal.meaning);
  const officiallyCheckedCount = word.idiomExamples.filter((example) => example.officialVerification).length;

  if (stage === 0) return <div className="journey-panel observation-stage">
    <div className="journey-heading"><span>01 · 看字形</span><h2>先看，不急着解释</h2><p>观察今天通行的字形。上传资料中的古文字图像尚未建立页码索引，因此这里不绘制、不猜测古文字形。</p></div>
    <div className="observation-board"><div className="grid-paper"><strong>{word.character}</strong></div><div className="observation-prompts"><span>你看到了哪些部件？</span><span>它和哪些字形相近？</span><span>先把猜想留在心里。</span></div></div>
    <div className="evidence-boundary"><span>暂无资料</span><p>甲骨文、金文、小篆等字形等待文字学著作页码级核验后再展示。</p></div>
    <button className="journey-next" type="button" onClick={() => advance(1)}>我观察好了，开始猜测 <span>→</span></button>
  </div>;

  if (stage === 1) return <div className="journey-panel guess-stage">
    <div className="journey-heading"><span>02 · 猜本义</span><h2>{markedOriginal ? "哪一个义项最接近资料标注的“本意”？" : "你认为哪一个义项最可能接近本义？"}</h2><p>{markedOriginal ? "本环节只依据上传资料中的明确标注，不用常识补写。答案揭晓后仍会保留资料边界说明。" : "先根据字形和已有义项作出假设。当前资料未明确标注标准答案，你的选择只作为学习猜想，不会被写成已核验结论。"}</p></div>
    {markedOriginal ? <>
      <div className="guess-options">{guessOptions.map((sense, index) => <button type="button" key={`${sense.meaning}-${index}`} className={`${guessSelection === sense.meaning ? "selected" : ""} ${guessSelection && sense === markedOriginal ? "correct" : ""}`} onClick={() => setGuessSelection(sense.meaning)}><span>{sense.grammar}</span><strong>{sense.meaning}</strong></button>)}</div>
      {guessSelection && !guessIsCorrect && <div className="guess-feedback wrong"><strong>再想一想</strong><p>这也是资料收录的义项，但没有被该资料标注为“本意”。</p></div>}
      {guessIsCorrect && <div className="guess-feedback correct"><strong>资料标注：{markedOriginal.meaning}</strong><p>依据《120实词归档版》中的“【本意】”标记。文字学专著的进一步核验尚未完成。</p><button className="journey-next" type="button" onClick={() => advance(2)}>展开全部义项 <span>→</span></button></div>}
    </> : <>
      <div className="guess-options">{guessOptions.map((sense, index) => <button type="button" key={`${sense.meaning}-${index}`} className={guessSelection === sense.meaning ? "selected" : ""} onClick={() => setGuessSelection(sense.meaning)}><span>{sense.grammar}</span><strong>{sense.meaning}</strong></button>)}</div>
      {guessSelection ? <div className="guess-feedback neutral"><strong>你的猜想：{guessSelection}</strong><p>已记录为本轮学习假设。由于上传资料尚未给出可核验的本义标注，这里不判定对错。</p><button className="journey-next" type="button" onClick={() => advance(2)}>带着猜想展开义项 <span>→</span></button></div> : <div className="evidence-boundary"><span>待核验</span><p>请选择一个义项作为猜想；文字学专著核验完成后，再补充有依据的答案。</p></div>}
    </>}
  </div>;

  if (stage === 2) return <div className="journey-panel meaning-stage">
    <div className="journey-heading"><span>03 · 理义脉</span><h2>先看义项怎样分布</h2><p>下列顺序沿用上传资料的编排，仅作课堂浏览；连线不代表已经核验的历史演变先后。</p></div>
    <div className="meaning-chain">{word.senses.map((sense, index) => <div className="meaning-node" key={`${sense.grammar}-${sense.meaning}`}><i>{index + 1}</i><span>{sense.grammar}</span><strong>{sense.meaning}</strong><small>{sense.reference}</small></div>)}</div>
    <div className="chain-note"><span>注意</span>“义项地图”不等于“词义演变图”。真正的引申关系将在文字学资料核验后补充。</div>
    <button className="journey-next" type="button" onClick={() => advance(3)}>带着义项回到教材 <span>→</span></button>
  </div>;

  if (stage === 3) return <div className="journey-panel textbook-stage">
    <div className="journey-heading"><span>04 · 回教材</span><h2>在教材原句里重新认出“{word.character}”</h2><p>以下仅展示已在上传教材 PDF 中逐句定位的内容，页码为 PDF 页码。</p></div>
    {word.textbookExamples.length ? <div className="textbook-cards">{word.textbookExamples.map((example) => <article key={`${example.volume}-${example.pdfPage}`}><div className="book-meta"><span>{example.volume}</span><small>PDF 第 {example.pdfPage} 页</small></div><blockquote>{example.sentence}</blockquote><div><strong>{example.title}</strong><span>对应义项：{example.matchedMeaning}</span></div></article>)}</div> : <div className="empty-evidence compact"><span>课</span><h3>暂无已核验教材关联</h3><p>不是说明教材中一定没有，而是当前尚未完成该词的逐页定位。</p></div>}
    <button className="journey-next" type="button" onClick={() => advance(4)}>继续联系成语 <span>→</span></button>
  </div>;

  if (stage === 4) return <div className="journey-panel">
    <div className="journey-heading"><span>05 · 联成语</span><h2>用熟悉的成语固定“{word.character}”的词义</h2><p>条目与释义优先采用你上传的《文言文实词关联成语120个》；只有与公开《成语典》逐项匹配的内容才另标“官网核验”。本资料没有逐条指定义项时，页面不自行猜测。</p></div>
    {word.idiomExamples.length ? <><div className="idiom-round-summary"><span><strong>{word.idiomExamples.length}</strong> 条上传资料关联</span><span><strong>{officiallyCheckedCount}</strong> 条已有官网交叉核验</span></div><div className="idiom-cards">{word.idiomExamples.map((example, index) => <article key={`${example.idiom}-${index}`}>
      <div className="idiom-heading"><div><span>关联成语 / 熟语</span><h3>{example.idiom}</h3></div>{example.officialVerification ? <small>{example.officialVerification.pinyin}</small> : <small>读音：资料未标注</small>}</div>
      <p className="official-meaning"><span>上传资料释义</span>{example.explanation}</p>
      {example.matchedMeaning ? <details><summary>查看已核验的“{word.character}”对应义项</summary><div><strong>{example.matchedMeaning}</strong><p>义项依据：《120实词归档版》；对应关系经公开资料交叉核验。</p></div></details> : <div className="idiom-boundary"><span>对应义项暂不判定</span><p>上传资料未逐条标注义项序号，当前不作推断。</p></div>}
      {example.officialVerification && <div className="idiom-verification"><span>官网交叉核验</span>{example.officialVerification.traditional !== example.idiom && <p>《成语典》条目：{example.officialVerification.traditional}</p>}<p>{example.officialVerification.officialMeaning}</p><div><small>典源：{cleanReferenceLabel(example.officialVerification.sourceTitle)}</small><a href={example.officialVerification.sourceUrl} target="_blank" rel="noreferrer">核验来源 ↗</a></div></div>}
      <div className="idiom-source"><div><span>{example.sourceEntry}</span><small>{example.sourceLabel}</small></div></div>
    </article>)}</div></> : <div className="empty-evidence"><span>成</span><h3>暂无可靠成语关联</h3><p>不是说明没有相关成语，而是当前上传资料未提供可直接接入的可靠条目。</p></div>}
    {word.idiomSourceNote && <div className="source-anomaly"><strong>资料核对说明</strong><p>{word.idiomSourceNote}</p></div>}
    <button className="journey-next" type="button" onClick={() => advance(5)}>继续查看高考关联 <span>→</span></button>
  </div>;

  if (stage === 5) return <div className="journey-panel">
    <div className="journey-heading"><span>06 · 对高考</span><h2>把“{word.character}”放进高考语境</h2><p>下列内容来自你上传的《120个文言实词高考真题关联句翻译辅助》。资料明确标出年份和卷别的照录；未标注的条目单独提示，不补造考试信息。</p></div>
    {word.examExamples.length ? <ExamEntryCards entries={word.examExamples} sourceName="120个文言实词高考真题关联句翻译辅助" /> : <div className="empty-evidence"><span>考</span><h3>暂无可靠高考关联</h3><p>当前上传资料未提供可直接对应此字的条目。</p></div>}
    {word.examSourceNote && <div className="source-anomaly"><strong>资料核对说明</strong><p>{word.examSourceNote}</p></div>}
    <button className="journey-next" type="button" onClick={() => advance(6)}>完成本轮学习 <span>→</span></button>
  </div>;

  return <div className="journey-panel review-stage">
    <div className="journey-heading"><span>07 · 再复习</span><h2>合上答案，再说一次</h2><p>用三个问题检查自己是否真的理解，而不只是“看过”。</p></div>
    <div className="review-summary"><div><span>字</span><strong>{word.character}</strong><small>{word.pinyin}</small></div><ul><li>我能说出至少两个义项吗？</li><li>我能解释一条教材原句吗？</li><li>我知道哪些内容仍待资料核验吗？</li></ul></div>
    <div className="review-stats"><span><strong>{word.senses.length}</strong>个已录入义项</span><span><strong>{word.textbookExamples.length}</strong>条已核验教材原句</span><span><strong>{word.idiomExamples.length}</strong>条已录入成语关联</span><span><strong>{word.examExamples.length}</strong>条高考关联</span></div>
    <button className="journey-next secondary" type="button" onClick={() => advance(0)}>再走一遍 <span>↺</span></button>
  </div>;
}

function TextsReview({ openWord }: { openWord: (character: string) => void }) {
  const volumes = ["全部教材", ...textbookVolumeOrder.filter((volume) => textbookLessons.some((lesson) => lesson.volume === volume))];
  const [volume, setVolume] = useState("全部教材");
  const filteredLessons = textbookLessons.filter((lesson) => volume === "全部教材" || lesson.volume === volume);
  const [lessonId, setLessonId] = useState(textbookLessons[0]?.id ?? "");
  const activeLesson = filteredLessons.find((lesson) => lesson.id === lessonId) ?? filteredLessons[0] ?? textbookLessons[0];
  const [randomCharacter, setRandomCharacter] = useState("爱");
  const [randomRevealed, setRandomRevealed] = useState(false);
  const randomWord = verifiedWords.find((word) => word.character === randomCharacter) ?? verifiedWords[0];

  const chooseVolume = (nextVolume: string) => {
    const nextLessons = textbookLessons.filter((lesson) => nextVolume === "全部教材" || lesson.volume === nextVolume);
    setVolume(nextVolume);
    setLessonId(nextLessons[0]?.id ?? "");
  };
  const drawWord = (fromLesson: boolean) => {
    const candidates = fromLesson && activeLesson
      ? [...new Set(activeLesson.examples.map((example) => example.character))]
      : verifiedWords.map((word) => word.character);
    const picked = pickRandom(candidates, "爱");
    setRandomCharacter(picked);
    setRandomRevealed(false);
  };

  return <section className="workspace-section texts-workspace">
    <div className="page-heading">
      <div><span className="section-kicker">第四轮 · 教材原句索引</span><h1>按课文复习</h1><p>从教材篇目进入，复习已经逐句核验的实词。当前只收入能在上传教材 PDF 中定位、且义项可由上传资料支持的原句。</p></div>
      <span className="stage-badge">{textbookLessons.length} 篇 · {totalTextbookExamples} 条关联</span>
    </div>

    <div className="text-review-summary">
      <span><strong>{textbookLessons.length}</strong>篇已建索引</span><span><strong>{new Set(textbookLessons.flatMap((lesson) => lesson.examples.map((example) => example.character))).size}</strong>个实词已回到教材</span><span><strong>{textbookVolumeOrder.filter((item) => textbookLessons.some((lesson) => lesson.volume === item)).length}</strong>册教材已有核验关联</span><span><strong>{totalTextbookExamples}</strong>条原句关联</span>
    </div>

    <div className="text-review-layout">
      <aside className="lesson-directory">
        <div className="drawer-heading"><strong>教材篇目</strong><span>{filteredLessons.length} 篇</span></div>
        <label className="volume-filter"><span>册次</span><select value={volume} onChange={(event) => chooseVolume(event.target.value)}>{volumes.map((item) => <option key={item}>{item}</option>)}</select></label>
        <div className="lesson-list">{filteredLessons.map((lesson) => <button type="button" key={lesson.id} className={lesson.id === activeLesson?.id ? "active" : ""} onClick={() => setLessonId(lesson.id)}><span>{lesson.title}</span><small>{lesson.volume} · {lesson.examples.length} 条关联</small></button>)}</div>
      </aside>

      <article className="lesson-review-canvas">
        {activeLesson ? <>
          <header><span>{activeLesson.volume}</span><h2>{activeLesson.title}</h2><p>先读原句并结合上下文判断词义，再核验对应义项；点击实词可回到完整学习路径，课堂提问与自主复习均可使用。</p></header>
          <div className="lesson-example-list">{activeLesson.examples.map((example, index) => {
            const parts = example.sentence.split(example.character);
            return <article key={`${example.character}-${example.pdfPage}-${index}`}>
              <div className="example-meta"><span>PDF 第 {example.pdfPage} 页</span><small>第 {example.wordIndex} 词</small></div>
              <blockquote>{parts.map((part, partIndex) => <span key={`${part}-${partIndex}`}>{part}{partIndex < parts.length - 1 && <mark>{example.character}</mark>}</span>)}</blockquote>
              <div className="example-answer"><span>{example.character}</span><p><small>对应义项</small><strong>{example.matchedMeaning}</strong></p><button type="button" onClick={() => openWord(example.character)}>进入实词实验室 →</button></div>
            </article>;
          })}</div>
        </> : <div className="empty-evidence"><span>课</span><h3>暂无资料</h3><p>当前筛选范围内还没有完成逐句定位的教材原句。</p></div>}
      </article>

      <aside className="random-draw-panel">
        <div className="drawer-heading"><strong>随机抽字</strong><span>课堂工具</span></div>
        <div className="random-character"><small>第 {randomWord.index} 词</small><strong>{randomWord.character}</strong><span>{randomWord.pinyin}</span></div>
        {randomRevealed ? <div className="random-answer"><span>资料义项</span><p>{randomWord.senses.slice(0, 3).map((sense) => sense.meaning).join("；")}</p><button type="button" onClick={() => openWord(randomWord.character)}>完整学习此字</button></div> : <button className="reveal-random" type="button" onClick={() => setRandomRevealed(true)}>揭晓义项</button>}
        <div className="draw-actions"><button type="button" onClick={() => drawWord(false)}>全库抽一字</button><button type="button" disabled={!activeLesson} onClick={() => drawWord(true)}>从本课抽字</button></div>
        <p className="random-note">抽字只使用已接入的 120 实词；揭晓内容来自《120实词归档版》。</p>
      </aside>
    </div>
  </section>;
}

function ExamEntryCards({ entries, sourceName }: { entries: ExamExample[]; sourceName: string }) {
  return <div className="exam-entry-cards">{entries.map((entry, index) => {
    const [lead, ...details] = entry.paragraphs;
    return <article key={`${entry.sourceItem}-${entry.sourceLabel ?? "undated"}-${index}`}>
      <div className="exam-entry-head"><span className={entry.sourceLabel ? "dated" : "undated"}>{entry.sourceLabel ?? "资料未标注年份及卷别"}</span><small>原资料第 {entry.sourceItem} 条</small></div>
      <blockquote>{lead}</blockquote>
      {details.length ? <details><summary>展开资料中的译文或补充说明</summary><div>{details.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div></details> : <div className="exam-no-translation">资料未另分译文段落，以上内容按原文件呈现。</div>}
      <footer>资料来源：《{sourceName}》</footer>
    </article>;
  })}</div>;
}

function ExamMap({ openWord }: { openWord: (character: string) => void }) {
  const [mode, setMode] = useState<"real" | "function">("real");
  const [query, setQuery] = useState("");
  const [realCharacter, setRealCharacter] = useState("爱");
  const [functionCharacter, setFunctionCharacter] = useState("而");
  const filteredRealWords = realWordExamGroups.filter((group) => [group.character, ...group.entries.flatMap((entry) => [entry.sourceLabel, ...entry.paragraphs])].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const filteredFunctionWords = functionWordExamGroups.filter((group) => [group.character, ...group.entries.flatMap((entry) => [entry.sourceLabel, ...entry.paragraphs])].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  const activeRealGroup = realWordExamGroups.find((group) => group.character === realCharacter) ?? realWordExamGroups[0];
  const activeRealWord = verifiedWords.find((word) => word.character === activeRealGroup.character);
  const activeFunctionWord = functionWordExamGroups.find((group) => group.character === functionCharacter) ?? functionWordExamGroups[0];
  const totalDated = totalDatedRealWordExamExamples + totalDatedFunctionWordExamExamples;

  return <section className="workspace-section exam-map-section">
    <div className="page-heading"><div><span className="section-kicker">第七轮 · 真题语境</span><h1>高考语义地图</h1><p>按实词和虚词浏览上传资料中的关联句、释义标注及翻译；只有资料明确给出的年份和卷别才作为真题标签显示。</p></div><span className="stage-badge">{totalRealWordExamExamples + totalFunctionWordExamExamples} 条关联 · {totalDated} 条标注年份</span></div>
    <div className="exam-summary-row"><span><strong>120</strong>个资料实词</span><span><strong>{totalRealWordExamExamples}</strong>条实词关联</span><span><strong>18</strong>个虚词</span><span><strong>{totalFunctionWordExamExamples}</strong>条虚词关联</span></div>
    <div className="exam-mode-row"><div className="lab-mode-switch"><button type="button" className={mode === "real" ? "active" : ""} onClick={() => setMode("real")}>120实词</button><button type="button" className={mode === "function" ? "active" : ""} onClick={() => setMode("function")}>18虚词</button></div><label className="fake-search exam-search"><span>⌕</span><input aria-label="搜索高考关联" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索字、年份、卷别或语句" /></label></div>
    <div className="exam-map-layout">
      <aside className="exam-word-index"><div className="drawer-heading"><strong>{mode === "real" ? "实词索引" : "虚词索引"}</strong><span>{mode === "real" ? filteredRealWords.length : filteredFunctionWords.length}</span></div>{mode === "real" ? <div>{filteredRealWords.map((group) => <button type="button" className={group.character === activeRealGroup.character ? "active" : ""} key={group.character} onClick={() => setRealCharacter(group.character)}><strong>{group.character}</strong><span>{group.entries.length} 条</span></button>)}</div> : <div>{filteredFunctionWords.map((group) => <button type="button" className={group.character === activeFunctionWord.character ? "active" : ""} key={group.character} onClick={() => setFunctionCharacter(group.character)}><strong>{group.character}</strong><span>{group.entries.length} 条</span></button>)}</div>}</aside>
      <article className="exam-map-detail">{mode === "real" ? <><header><div><span>文言实词</span><h2>{activeRealGroup.character}</h2><p>第 {activeRealGroup.sourceIndex} 词 · {activeRealGroup.entries.length} 条关联{activeRealWord ? ` · ${activeRealWord.pinyin}` : ""}</p></div>{activeRealWord && <button type="button" onClick={() => openWord(activeRealWord.character)}>进入完整实词学习 →</button>}</header><ExamEntryCards entries={activeRealGroup.entries} sourceName="120个文言实词高考真题关联句翻译辅助" />{!activeRealWord && <div className="source-anomaly"><strong>资料核对说明</strong><p>这份高考关联资料列有“{activeRealGroup.character}”，但当前120实词库没有该字，因此暂作为独立资料条目展示，不强行并入其他词。</p></div>}</> : <><header><div><span>文言虚词</span><h2>{activeFunctionWord.character}</h2><p>第 {activeFunctionWord.sourceIndex} 词 · {activeFunctionWord.entries.length} 条关联</p></div></header><ExamEntryCards entries={activeFunctionWord.entries} sourceName="18个文言虚词高考真题关联句翻译辅助" /></>}</article>
    </div>
  </section>;
}

function Resources() {
  const indexedTextbooks = new Set([
    "七年级上册（2024秋版）语文电子课本", "七年级下册（2025春版）语文电子课本", "八年级上册", "八年级下册", "九年级下册",
    "高中语文必修上", "高中语文必修下", "高中语文选择性必修上", "高中语文选择性必修中", "高中语文选择性必修下",
  ]);
  const resourceState = (item: string) => {
    if (item === "120实词归档版") return `已解析 · 120字 / ${totalVerifiedSenses}条义项已接入`;
    if (item === "文言文实词关联成语120个") return `已解析 · ${totalIdiomEntries}条关联 / 覆盖${totalIdiomCoveredWords}字`;
    if (item === "120个文言实词高考真题关联句翻译辅助") return `已解析 · ${totalExamExamples}条关联 / 覆盖${totalExamCoveredWords}字`;
    if (item === "18个文言虚词高考真题关联句翻译辅助") return `已解析 · ${totalFunctionWordExamExamples}条关联 / 18个虚词`;
    if (item.startsWith("教育部《成语典》")) return `公开授权核验源 · ${totalOfficiallyCheckedIdioms}条成语 / ${totalIdiomLinks}条字义关联已匹配`;
    if (indexedTextbooks.has(item)) return "已解析 · 教材原句索引已接入";
    return "已收录 · 待解析";
  };
  const groups = [
    { title: "文字学与汉字学", count: 7, items: researchWorks },
    { title: "专题研讨", count: 5, items: seminars },
    { title: "教材与复习", count: 18, items: teachingResources },
    { title: "公开核验源", count: 1, items: publicReferenceWorks },
  ];
  return <section className="workspace-section">
    <div className="page-heading"><div><span className="section-kicker">知识依据</span><h1>资料库</h1><p>30 项上传文件与公开核验源分开标注。正文解析、页码定位与条目核验按模块逐步进行。</p></div><span className="stage-badge">31 项资料依据</span></div>
    <div className="resource-summary"><span><strong>22</strong>PDF</span><span><strong>8</strong>DOCX</span><span><strong>1</strong>公开核验源</span><span><strong>分批</strong>正文解析</span></div>
    <div className="resource-groups">{groups.map((group) => <article className="resource-group" key={group.title}><div className="resource-group-head"><span>{group.title.slice(0, 1)}</span><div><h2>{group.title}</h2><p>{group.count} 项资料</p></div></div><ul>{group.items.map((item) => <li key={item}><span>{item}</span><small>{resourceState(item)}</small></li>)}</ul></article>)}</div>
  </section>;
}
