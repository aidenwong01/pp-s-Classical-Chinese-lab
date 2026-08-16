"use client";

import { useMemo, useState } from "react";
import { verifiedWords } from "./data/verified-words";

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

export default function Home() {
  const [section, setSection] = useState<SectionId>("home");
  const [audience, setAudience] = useState<Audience>("teacher");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const current = useMemo(() => navItems.find((item) => item.id === section) ?? navItems[0], [section]);
  const chooseSection = (next: SectionId) => {
    setSection(next); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          {section === "words" && <WordsLab audience={audience} />}
          {section === "texts" && <ComingSection kind="课" title="按课文复习" round="第四轮" description="从教材篇目进入，串联实词、句式与相关练习。课文原句将在完成教材解析与人工核验后显示。" />}
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
        <div className="eyebrow"><span />第二轮 · 实词实验室已开放</div>
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
      <div className="stat-card warning"><strong>6</strong><span>个首批实词</span><small>35个义项已据上传资料录入</small></div>
    </section>

    <div className="content-grid">
      <section className="section-card modules-card">
        <div className="section-heading"><div><span className="section-kicker">工作台</span><h2>学习模块</h2></div><span className="quiet-tag">按轮次逐步开放</span></div>
        <div className="module-grid">
          <ModuleCard glyph="实" title="实词实验室" note="首批6字、35个义项已接入" status="现在可用" active onClick={() => goTo("words")} />
          <ModuleCard glyph="课" title="按课文复习" note="从教材原句回看重点词义" status="第四轮" onClick={() => goTo("texts")} />
          <ModuleCard glyph="抽" title="随机抽字" note="课堂提问与课后自测入口" status="第四轮" />
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

function WordsLab({ audience }: { audience: Audience }) {
  const [activeCharacter, setActiveCharacter] = useState(verifiedWords[0].character);
  const [query, setQuery] = useState("");
  const [grammar, setGrammar] = useState("全部");
  const [showTranslations, setShowTranslations] = useState(audience === "student");
  const [focusMode, setFocusMode] = useState(false);
  const [lessonWords, setLessonWords] = useState<string[]>([]);
  const activeWord = verifiedWords.find((word) => word.character === activeCharacter) ?? verifiedWords[0];
  const grammarOptions = ["全部", "名词", "动词", "形容词", "其他"];
  const filteredWords = verifiedWords.filter((word) => {
    const haystack = [word.character, word.pinyin, ...word.senses.flatMap((sense) => [sense.meaning, sense.reference])].join(" ");
    return haystack.toLowerCase().includes(query.trim().toLowerCase());
  });
  const visibleSenses = activeWord.senses.filter((sense) => {
    if (grammar === "全部") return true;
    if (grammar === "其他") return !["名词", "动词", "形容词"].some((item) => sense.grammar.startsWith(item));
    return sense.grammar.startsWith(grammar);
  });
  const inLesson = lessonWords.includes(activeWord.character);
  const toggleLesson = () => setLessonWords((words) => inLesson ? words.filter((word) => word !== activeWord.character) : [...words, activeWord.character]);

  return <section className={`workspace-section words-workspace ${focusMode ? "focus-mode" : ""}`}>
    <div className="page-heading">
      <div><span className="section-kicker">第二轮 · 首批资料已接入</span><h1>实词实验室</h1><p>首批 6 个实词、35 个义项均据你上传的《120实词归档版》录入。教材页码、古文字形与高考关联尚未交叉核验，暂不展示。</p></div>
      <span className="stage-badge">6 字 · 35 义项</span>
    </div>
    <div className="lab-path">{learningPath.map((step, index) => <span className={index === 0 ? "current" : ""} key={step}><i>{index + 1}</i>{step}</span>)}</div>
    <div className="lab-layout populated">
      <aside className="word-drawer">
        <div className="drawer-heading"><strong>实词目录</strong><span>{filteredWords.length} / {verifiedWords.length}</span></div>
        <label className="fake-search"><span>⌕</span><input aria-label="搜索实词" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索字、篇目或义项" /></label>
        <div className="word-list" role="list">
          {filteredWords.map((word) => <button type="button" role="listitem" key={word.character} className={word.character === activeWord.character ? "active" : ""} onClick={() => { setActiveCharacter(word.character); setGrammar("全部"); }}><span>{word.character}</span><div><strong>{word.pinyin}</strong><small>{word.senses.length} 个义项</small></div><i>›</i></button>)}
          {filteredWords.length === 0 && <p className="no-result">首批词条中没有匹配内容</p>}
        </div>
        <div className="drawer-foot"><span>据</span><p>资料来源<br /><strong>《120实词归档版》</strong></p></div>
      </aside>

      <article className="word-canvas">
        <header className="word-hero">
          <div className={`character-block ${focusMode ? "enlarged" : ""}`}><strong>{activeWord.character}</strong><span>{activeWord.pinyin}</span></div>
          <div className="word-meta"><span className="verified-label">已据上传资料录入</span><h2>{activeWord.senses.length} 个义项</h2><p>{activeWord.readings ?? `读音：${activeWord.pinyin}`}</p></div>
          <div className="source-status"><span>资料原文</span><strong>已录入</strong><small>教材页码 · 待核验</small><small>古文字形 · 暂无资料</small><small>高考关联 · 暂无资料</small></div>
        </header>

        <div className="sense-toolbar">
          <div className="grammar-tabs" role="group" aria-label="按词性筛选">{grammarOptions.map((item) => <button type="button" key={item} onClick={() => setGrammar(item)} className={grammar === item ? "active" : ""}>{item}</button>)}</div>
          <button type="button" className="translation-toggle" onClick={() => setShowTranslations((show) => !show)}>{showTranslations ? "收起译文" : "展开译文"}</button>
        </div>

        <div className="sense-list">
          {visibleSenses.map((sense, index) => <article className="sense-card" key={`${sense.grammar}-${sense.meaning}`}>
            <div className="sense-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="sense-body">
              <div className="sense-title"><span>{sense.grammar}</span><h3>{showTranslations ? sense.meaning : "释义已隐藏"}</h3>{sense.sourceMarksOriginal && <small>资料标注“本意”</small>}</div>
              <blockquote>{sense.sentence}</blockquote>
              <div className="sentence-source">— {sense.reference}</div>
              {showTranslations ? <p className="translation"><span>译</span>{sense.translation}</p> : <button type="button" className="reveal-one" onClick={() => setShowTranslations(true)}>点击揭晓释义与译文</button>}
            </div>
          </article>)}
          {visibleSenses.length === 0 && <div className="no-sense"><span>暂无</span><p>该词在上传资料中没有此词性义项。</p></div>}
        </div>
      </article>

      <aside className="lesson-panel active-tools">
        <div className="drawer-heading"><strong>课堂工具</strong><span>{audience === "teacher" ? "教师视角" : "学生视角"}</span></div>
        <button type="button" className={focusMode ? "active" : ""} onClick={() => setFocusMode((focus) => !focus)}><span>放</span>{focusMode ? "恢复字形" : "放大字形"}</button>
        <button type="button" className={!showTranslations ? "active" : ""} onClick={() => setShowTranslations((show) => !show)}><span>隐</span>{showTranslations ? "隐藏释义" : "显示释义"}</button>
        <button type="button" className={inLesson ? "active" : ""} onClick={toggleLesson}><span>课</span>{inLesson ? "移出本课" : "加入本课"}</button>
        <div className="lesson-basket"><span>本课字篮</span><strong>{lessonWords.length}</strong><p>{lessonWords.length ? lessonWords.join(" · ") : "尚未添加实词"}</p></div>
        <div className="tool-note"><strong>下一轮</strong><p>加入“猜本义—展开义脉—教材/成语/高考”分步交互。</p></div>
      </aside>
    </div>
  </section>;
}

function ComingSection({ kind, title, round, description }: { kind: string; title: string; round: string; description: string }) {
  return <section className="workspace-section"><div className="page-heading"><div><span className="section-kicker">{round}计划</span><h1>{title}</h1><p>{description}</p></div><span className="stage-badge muted">待开发</span></div><div className="coming-canvas"><span className="coming-glyph">{kind}</span><div><span className="empty-label">功能占位</span><h2>框架已经预留，内容暂不显示</h2><p>后续迭代会在保留现有功能的基础上逐步加入。</p></div></div></section>;
}

function Resources() {
  const groups = [
    { title: "文字学与汉字学", count: 7, items: researchWorks },
    { title: "专题研讨", count: 5, items: seminars },
    { title: "教材与复习", count: 15, items: teachingResources },
  ];
  return <section className="workspace-section">
    <div className="page-heading"><div><span className="section-kicker">知识依据</span><h1>资料库</h1><p>这里仅显示已经收录的文件。当前完成文件级归档，正文解析、页码定位与条目核验将逐步进行。</p></div><span className="stage-badge">27 项已收录</span></div>
    <div className="resource-summary"><span><strong>22</strong>PDF</span><span><strong>5</strong>DOCX</span><span><strong>3</strong>资料分类</span><span><strong>待解析</strong>正文状态</span></div>
    <div className="resource-groups">{groups.map((group) => <article className="resource-group" key={group.title}><div className="resource-group-head"><span>{group.title.slice(0, 1)}</span><div><h2>{group.title}</h2><p>{group.count} 项资料</p></div></div><ul>{group.items.map((item) => <li key={item}><span>{item}</span><small>{item === "120实词归档版" ? "已解析 · 首批6字已接入" : "已收录 · 待解析"}</small></li>)}</ul></article>)}</div>
  </section>;
}
