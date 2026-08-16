"use client";

import { useMemo, useState } from "react";
import { totalTextbookExamples, totalVerifiedSenses, verifiedWords } from "./data/verified-words";

type SectionId = "home" | "words" | "texts" | "exam" | "resources";
type Audience = "teacher" | "student";

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
  "高中语文统编版学习任务汇总", "120实词归档版", "文言文阅读十年汇编（原卷版）",
  "文言文阅读十年汇编（答案版）", "2026高考文学类文本教考衔接资料",
];

const learningPath = ["看字形", "猜本义", "理义脉", "回教材", "联成语", "对高考", "再复习"];
const textbookVolumeOrder = ["七年级上册（2024秋版）", "七年级下册（2025春版）", "八年级上册", "八年级下册", "九年级下册", "高中语文必修上", "高中语文必修下", "高中语文选择性必修上", "高中语文选择性必修中", "高中语文选择性必修下"];
const pickRandom = <T,>(items: T[], fallback: T) => items[Math.floor(Math.random() * items.length)] ?? fallback;
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
  const [audience, setAudience] = useState<Audience>("teacher");
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
          <div className="audience-switch" role="group" aria-label="使用视角">
            <button className={audience === "teacher" ? "selected" : ""} onClick={() => setAudience("teacher")} type="button">教师</button>
            <button className={audience === "student" ? "selected" : ""} onClick={() => setAudience("student")} type="button">学生</button>
          </div>
        </header>
        <div className="page-frame" key={section}>
          {section === "home" && <Dashboard audience={audience} goTo={chooseSection} />}
          {section === "words" && <WordsLab audience={audience} initialCharacter={requestedWord} />}
          {section === "texts" && <TextsReview audience={audience} openWord={openWord} />}
          {section === "exam" && <ComingSection kind="考" title="高考语义地图" round="第七轮" description="按语境、义项与设题方式整理近十年真题。年份、题干与答案未核验前不展示。" />}
          {section === "resources" && <Resources />}
        </div>
      </main>
      <nav className="mobile-nav" aria-label="移动端主要功能">
        {navItems.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => chooseSection(item.id)} type="button"><span>{item.short}</span>{item.label.replace("实验室", "").replace("语义地图", "")}</button>)}
      </nav>
    </div>
  );
}

function Dashboard({ audience, goTo }: { audience: Audience; goTo: (section: SectionId) => void }) {
  return <>
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="eyebrow"><span />第四轮 · 课文复习与随机抽字已开放</div>
        <h1>{audience === "teacher" ? "把一个字，讲成一条清楚的义脉" : "从一个字出发，真正读懂文言"}</h1>
        <p>{audience === "teacher" ? "面向课堂大屏的文言学习工作台。沿着字形、本义、义脉、教材、成语与高考语境，让讲解有据可循。" : "先观察，再推测；理解词义怎样生长，最后回到课文和题目中验证。每一步都留下复习线索。"}</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => goTo("words")} type="button">进入实词实验室 <span>→</span></button><button className="text-button" onClick={() => goTo("resources")} type="button">查看已收录资料</button></div>
      </div>
      <div className="path-card" aria-label="完整学习路径">
        <div className="path-heading"><span>认知路径</span><small>完整走一遍，才算真正认识</small></div>
        <div className="path-flow">{learningPath.map((step, index) => <div className="path-step" key={step}><span>{index + 1}</span><strong>{step}</strong></div>)}</div>
        <div className="ink-circle" aria-hidden="true">文</div>
      </div>
    </section>

    <section className="stat-row" aria-label="资料库概况">
      <div className="stat-card"><strong>27</strong><span>项已收录资料</span><small>文件已入库，正文待分批解析</small></div>
      <div className="stat-card"><strong>10</strong><span>册语文教材</span><small>初高中教材文件</small></div>
      <div className="stat-card"><strong>7</strong><span>部文字学著作</span><small>字形与本义的重要依据</small></div>
      <div className="stat-card warning"><strong>120</strong><span>个文言实词</span><small>{totalVerifiedSenses} 条带例句义项已据资料接入</small></div>
    </section>

    <div className="content-grid">
      <section className="section-card modules-card">
        <div className="section-heading"><div><span className="section-kicker">工作台</span><h2>学习模块</h2></div><span className="quiet-tag">按轮次逐步开放</span></div>
        <div className="module-grid">
          <ModuleCard glyph="实" title="实词实验室" note="观察、猜测、义项、教材分步学习" status="120词已接入" active onClick={() => goTo("words")} />
          <ModuleCard glyph="课" title="按课文复习" note="从教材原句回看重点词义" status="第四轮已开放" onClick={() => goTo("texts")} />
          <ModuleCard glyph="抽" title="随机抽字" note="课堂提问与课后自测入口" status="第四轮已开放" onClick={() => goTo("texts")} />
          <ModuleCard glyph="考" title="高考语义地图" note="连接真题语境与命题方式" status="第七轮" onClick={() => goTo("exam")} />
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

function WordsLab({ audience, initialCharacter }: { audience: Audience; initialCharacter: string }) {
  const [activeCharacter, setActiveCharacter] = useState(verifiedWords.some((word) => word.character === initialCharacter) ? initialCharacter : verifiedWords[0].character);
  const [query, setQuery] = useState("");
  const [grammar, setGrammar] = useState("全部");
  const [showTranslations, setShowTranslations] = useState(audience === "student");
  const [focusMode, setFocusMode] = useState(false);
  const [lessonWords, setLessonWords] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"journey" | "catalog">("journey");
  const [journeyStage, setJourneyStage] = useState(0);
  const [unlockedStage, setUnlockedStage] = useState(0);
  const [guessSelection, setGuessSelection] = useState<string | null>(null);
  const activeWord = verifiedWords.find((word) => word.character === activeCharacter) ?? verifiedWords[0];
  const grammarOptions = ["全部", "名词", "动词", "形容词", "其他"];
  const filteredWords = verifiedWords.filter((word) => {
    const haystack = [word.index, word.character, word.pinyin, ...word.senses.flatMap((sense) => [sense.meaning, sense.sentence, sense.reference])].join(" ");
    return haystack.toLowerCase().includes(query.trim().toLowerCase());
  });
  const visibleSenses = activeWord.senses.filter((sense) => {
    if (grammar === "全部") return true;
    if (grammar === "其他") return !["名词", "动词", "形容词"].some((item) => sense.grammar.startsWith(item));
    return sense.grammar.startsWith(grammar);
  });
  const inLesson = lessonWords.includes(activeWord.character);
  const toggleLesson = () => setLessonWords((words) => inLesson ? words.filter((word) => word !== activeWord.character) : [...words, activeWord.character]);
  const chooseWord = (character: string) => {
    setActiveCharacter(character); setGrammar("全部"); setJourneyStage(0); setUnlockedStage(0); setGuessSelection(null);
  };
  const advanceJourney = (next: number) => { setJourneyStage(next); setUnlockedStage((current) => Math.max(current, next)); };

  return <section className={`workspace-section words-workspace ${focusMode ? "focus-mode" : ""}`}>
    <div className="page-heading">
      <div><span className="section-kicker">数据补全 · 120 词全量接入</span><h1>实词实验室</h1><p>120 个实词已按上传资料顺序完整接入，可搜索字、读音、篇目、原句或义项。成语、古文字形和高考关联缺少可靠材料时不补写。</p></div>
      <span className="stage-badge">120 字 · {totalVerifiedSenses} 条义项</span>
    </div>
    <div className="lab-mode-row">
      <div className="lab-mode-switch"><button type="button" className={viewMode === "journey" ? "active" : ""} onClick={() => setViewMode("journey")}>分步探索</button><button type="button" className={viewMode === "catalog" ? "active" : ""} onClick={() => setViewMode("catalog")}>义项全览</button></div>
      <label className="mobile-word-picker"><span>选择实词</span><select aria-label="选择实词" value={activeWord.character} onChange={(event) => chooseWord(event.target.value)}>{verifiedWords.map((word) => <option key={word.character} value={word.character}>{word.index}. {word.character} · {word.pinyin}</option>)}</select></label>
      <span>当前：第 {activeWord.index} 词 · {activeWord.character} · {activeWord.pinyin}</span>
    </div>
    <div className="lab-path">{learningPath.map((step, index) => <button type="button" disabled={viewMode === "journey" && index > unlockedStage} onClick={() => viewMode === "journey" && setJourneyStage(index)} className={viewMode === "journey" && index === journeyStage ? "current" : index <= unlockedStage ? "unlocked" : ""} key={step}><i>{index + 1}</i>{step}</button>)}</div>
    <div className="lab-layout populated">
      <aside className="word-drawer">
        <div className="drawer-heading"><strong>实词目录</strong><span>{filteredWords.length} / {verifiedWords.length}</span></div>
        <label className="fake-search"><span>⌕</span><input aria-label="搜索实词" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索字、篇目或义项" /></label>
        <div className="word-list">
          {filteredWords.map((word) => <button type="button" key={word.character} className={word.character === activeWord.character ? "active" : ""} onClick={() => chooseWord(word.character)}><span>{word.character}</span><div><strong>{String(word.index).padStart(3, "0")} · {word.pinyin}</strong><small>{word.senses.length} 个义项</small></div><i>›</i></button>)}
          {filteredWords.length === 0 && <p className="no-result">120 个词条中没有匹配内容</p>}
        </div>
        <div className="drawer-foot"><span>据</span><p>资料来源<br /><strong>《120实词归档版》</strong></p></div>
      </aside>

      <article className="word-canvas">
        <header className="word-hero">
          <div className={`character-block ${focusMode ? "enlarged" : ""}`}><strong>{activeWord.character}</strong><span>{activeWord.pinyin}</span></div>
          <div className="word-meta"><h2>{activeWord.senses.length} 个义项</h2><p>{activeWord.readings ?? `读音：${activeWord.pinyin}`}</p>{activeWord.verificationNotes?.map((note) => <small className="word-verification-note" key={note}>核验：{note}</small>)}</div>
          <div className="source-status"><span>资料状态</span><strong>实词义项已录入</strong><small>教材原句 · {activeWord.textbookExamples.length ? `已核验 ${activeWord.textbookExamples.length} 条` : "暂无关联"}</small><small>古文字形 · 暂无资料</small><small>高考关联 · 暂无资料</small></div>
        </header>

        {viewMode === "journey" ? <LearningJourney word={activeWord} stage={journeyStage} advance={advanceJourney} guessSelection={guessSelection} setGuessSelection={setGuessSelection} /> : <><div className="sense-toolbar">
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
        <div className="drawer-heading"><strong>课堂工具</strong><span>{audience === "teacher" ? "教师视角" : "学生视角"}</span></div>
        <button type="button" className={focusMode ? "active" : ""} onClick={() => setFocusMode((focus) => !focus)}><span>放</span>{focusMode ? "恢复字形" : "放大字形"}</button>
        <button type="button" className={!showTranslations ? "active" : ""} onClick={() => setShowTranslations((show) => !show)}><span>隐</span>{showTranslations ? "隐藏释义" : "显示释义"}</button>
        <button type="button" className={inLesson ? "active" : ""} onClick={toggleLesson}><span>课</span>{inLesson ? "移出本课" : "加入本课"}</button>
        <div className="lesson-basket"><span>本课字篮</span><strong>{lessonWords.length}</strong><p>{lessonWords.length ? lessonWords.join(" · ") : "尚未添加实词"}</p></div>
        <div className="tool-note"><strong>资料边界</strong><p>义项演变、成语与高考关联仍待资料核验；当前不会自动补全。</p></div>
      </aside>
    </div>
  </section>;
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
    <div className="journey-heading"><span>05 · 联成语</span><h2>用熟悉的成语固定词义</h2><p>目前上传资料中尚未建立本词的成语条目与出处索引。</p></div>
    <div className="empty-evidence"><span>成</span><h3>暂无资料</h3><p>为避免编造成语出处或强行建立联系，本轮暂不显示成语。待你补充成语资料后再接入。</p></div>
    <button className="journey-next" type="button" onClick={() => advance(5)}>继续查看高考关联 <span>→</span></button>
  </div>;

  if (stage === 5) return <div className="journey-panel">
    <div className="journey-heading"><span>06 · 对高考</span><h2>把义项放进陌生语境</h2><p>已收录十年真题汇编，但本词与具体年份、题干、答案之间尚未建立可复核关联。</p></div>
    <div className="empty-evidence"><span>考</span><h3>暂无已核验真题关联</h3><p>不显示推测年份、模拟题或未经核对的真题原句。</p></div>
    <button className="journey-next" type="button" onClick={() => advance(6)}>完成本轮学习 <span>→</span></button>
  </div>;

  return <div className="journey-panel review-stage">
    <div className="journey-heading"><span>07 · 再复习</span><h2>合上答案，再说一次</h2><p>用三个问题检查自己是否真的理解，而不只是“看过”。</p></div>
    <div className="review-summary"><div><span>字</span><strong>{word.character}</strong><small>{word.pinyin}</small></div><ul><li>我能说出至少两个义项吗？</li><li>我能解释一条教材原句吗？</li><li>我知道哪些内容仍待资料核验吗？</li></ul></div>
    <div className="review-stats"><span><strong>{word.senses.length}</strong>个已录入义项</span><span><strong>{word.textbookExamples.length}</strong>条已核验教材原句</span><span><strong>0</strong>条已核验高考关联</span></div>
    <button className="journey-next secondary" type="button" onClick={() => advance(0)}>再走一遍 <span>↺</span></button>
  </div>;
}

function TextsReview({ audience, openWord }: { audience: Audience; openWord: (character: string) => void }) {
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
          <header><span>{activeLesson.volume}</span><h2>{activeLesson.title}</h2><p>{audience === "teacher" ? "可按顺序遮住义项，让学生先结合上下文判断，再点击词卡进入完整义项。" : "先读原句猜词义，再查看核验结果；点击实词可以回到完整学习路径。"}</p></header>
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

function ComingSection({ kind, title, round, description }: { kind: string; title: string; round: string; description: string }) {
  return <section className="workspace-section"><div className="page-heading"><div><span className="section-kicker">{round}计划</span><h1>{title}</h1><p>{description}</p></div><span className="stage-badge muted">待开发</span></div><div className="coming-canvas"><span className="coming-glyph">{kind}</span><div><span className="empty-label">功能占位</span><h2>框架已经预留，内容暂不显示</h2><p>后续迭代会在保留现有功能的基础上逐步加入。</p></div></div></section>;
}

function Resources() {
  const indexedTextbooks = new Set([
    "七年级上册（2024秋版）语文电子课本", "七年级下册（2025春版）语文电子课本", "八年级上册", "八年级下册", "九年级下册",
    "高中语文必修上", "高中语文必修下", "高中语文选择性必修中", "高中语文选择性必修下",
  ]);
  const resourceState = (item: string) => {
    if (item === "120实词归档版") return `已解析 · 120字 / ${totalVerifiedSenses}条义项已接入`;
    if (indexedTextbooks.has(item)) return "已解析 · 首批原句索引已接入";
    if (item === "高中语文选择性必修上") return "已扫描 · 本批暂无精确匹配";
    return "已收录 · 待解析";
  };
  const groups = [
    { title: "文字学与汉字学", count: 7, items: researchWorks },
    { title: "专题研讨", count: 5, items: seminars },
    { title: "教材与复习", count: 15, items: teachingResources },
  ];
  return <section className="workspace-section">
    <div className="page-heading"><div><span className="section-kicker">知识依据</span><h1>资料库</h1><p>这里仅显示已经收录的文件。当前完成文件级归档，正文解析、页码定位与条目核验将逐步进行。</p></div><span className="stage-badge">27 项已收录</span></div>
    <div className="resource-summary"><span><strong>22</strong>PDF</span><span><strong>5</strong>DOCX</span><span><strong>3</strong>资料分类</span><span><strong>待解析</strong>正文状态</span></div>
    <div className="resource-groups">{groups.map((group) => <article className="resource-group" key={group.title}><div className="resource-group-head"><span>{group.title.slice(0, 1)}</span><div><h2>{group.title}</h2><p>{group.count} 项资料</p></div></div><ul>{group.items.map((item) => <li key={item}><span>{item}</span><small>{resourceState(item)}</small></li>)}</ul></article>)}</div>
  </section>;
}
