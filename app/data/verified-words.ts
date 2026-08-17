import sourceWords from "./all-words.json";
import exactTextbookLinks from "./textbook-links.json";
import officialIdiomLinks from "./idiom-links.json";

export type WordSense = {
  grammar: string;
  meaning: string;
  sentence: string;
  reference: string;
  translation: string;
  sourceMarksOriginal?: boolean;
  reading?: string;
  verificationNote?: string;
};

export type TextbookExample = {
  sentence: string;
  title: string;
  volume: string;
  pdfPage: number;
  matchedMeaning: string;
};

export type IdiomExample = {
  idiom: string;
  traditional: string;
  pinyin: string;
  officialMeaning: string;
  sourceTitle: string;
  sourceLabel: string;
  sourceUrl: string;
  matchedMeaning: string;
};

export type VerifiedWord = {
  index: number;
  character: string;
  pinyin: string;
  readings?: string;
  senses: WordSense[];
  textbookExamples: TextbookExample[];
  idiomExamples: IdiomExample[];
  verificationNotes?: string[];
};

// 全部 120 词、797 条带例句义项均按用户上传的《120实词归档版》顺序抽取。
// 教材关联只保留已在上传教材 PDF 中逐句核验的条目；其余不自动推断。
const manualTextbookExamples: Partial<Record<string, TextbookExample[]>> = {
  爱: [
    { sentence: "爱其子，择师而教之；于其身也，则耻师焉，惑矣。", title: "《师说》", volume: "高中语文必修上", pdfPage: 93, matchedMeaning: "喜爱" },
    { sentence: "齐国虽褊小，吾何爱一牛？", title: "《齐桓晋文之事》", volume: "高中语文必修下", pdfPage: 11, matchedMeaning: "吝惜，舍不得" },
  ],
  安: [
    { sentence: "衣食所安，弗敢专也，必以分人。", title: "《曹刿论战》", volume: "九年级下册", pdfPage: 131, matchedMeaning: "安身" },
    { sentence: "思国之安者，必积其德义。", title: "《谏太宗十思疏》", volume: "高中语文必修下", pdfPage: 151, matchedMeaning: "安定" },
  ],
  本: [
    { sentence: "臣闻求木之长者，必固其根本。", title: "《谏太宗十思疏》", volume: "高中语文必修下", pdfPage: 151, matchedMeaning: "草木的根" },
    { sentence: "臣本布衣，躬耕于南阳。", title: "《出师表》", volume: "九年级下册", pdfPage: 141, matchedMeaning: "本来" },
  ],
  鄙: [
    { sentence: "越国以鄙远，君知其难也。", title: "《烛之武退秦师》", volume: "高中语文必修下", pdfPage: 18, matchedMeaning: "以……为边邑" },
    { sentence: "肉食者鄙，未能远谋。", title: "《曹刿论战》", volume: "九年级下册", pdfPage: 131, matchedMeaning: "鄙陋，见识浅" },
  ],
  患: [
    { sentence: "惠王患之，乃令张仪详去秦。", title: "《屈原列传》", volume: "高中语文选择性必修中", pdfPage: 88, matchedMeaning: "担忧，忧虑" },
  ],
  克: [
    { sentence: "克己复礼为仁。", title: "《〈论语〉十二章》", volume: "高中语文选择性必修上", pdfPage: 50, matchedMeaning: "克制，约束" },
  ],
  孰: [
    { sentence: "人非生而知之者，孰能无惑？", title: "《师说》", volume: "高中语文必修上", pdfPage: 92, matchedMeaning: "谁、什么、哪一个" },
  ],
  涕: [
    { sentence: "儿涕而出。", title: "《促织》", volume: "高中语文必修下", pdfPage: 127, matchedMeaning: "流眼泪，哭泣" },
  ],
  宜: [
    { sentence: "诚宜开张圣听，以光先帝遗德，恢弘志士之气。", title: "《出师表》", volume: "九年级下册", pdfPage: 140, matchedMeaning: "应该，应当" },
  ],
  易: [
    { sentence: "寒暑易节，始一反焉。", title: "《愚公移山》", volume: "八年级上册", pdfPage: 148, matchedMeaning: "改变，更换" },
  ],
  诸: [
    { sentence: "投诸渤海之尾，隐土之北。", title: "《愚公移山》", volume: "八年级上册", pdfPage: 148, matchedMeaning: "相当于‘之于’" },
  ],
};

const exactTextbookExamples = exactTextbookLinks.reduce<Partial<Record<string, TextbookExample[]>>>((index, link) => {
  const examples = index[link.character] ?? [];
  examples.push({
    sentence: link.sentence,
    title: link.title,
    volume: link.volume,
    pdfPage: link.pdfPage,
    matchedMeaning: link.matchedMeaning,
  });
  index[link.character] = examples;
  return index;
}, {});

function examplesFor(character: string) {
  const combined = [...(manualTextbookExamples[character] ?? []), ...(exactTextbookExamples[character] ?? [])];
  const seen = new Set<string>();
  return combined.filter((example) => {
    const key = `${example.volume}|${example.pdfPage}|${example.matchedMeaning}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function idiomsFor(character: string, senses: WordSense[]): IdiomExample[] {
  return officialIdiomLinks.flatMap((entry) => entry.links
    .filter((link) => link.character === character)
    .map((link) => ({
      idiom: entry.idiom,
      traditional: entry.traditional,
      pinyin: entry.pinyin,
      officialMeaning: entry.officialMeaning,
      sourceTitle: entry.sourceTitle,
      sourceLabel: entry.sourceLabel,
      sourceUrl: entry.sourceUrl,
      matchedMeaning: senses[link.senseIndex]?.meaning ?? "暂无资料",
    })));
}

const pinyinCorrections: Partial<Record<string, { pinyin: string; readings: string; note: string }>> = {
  度: { pinyin: "dù / duó", readings: "读音一：dù；读音二：duó", note: "原资料拼音作“dúo”，已按汉语拼音声调标注规则校为“duó”。" },
  期: { pinyin: "qī / jī", readings: "读音一：qī；读音二：jī", note: "“期年”读 jī；上传教材注为“满一年”。" },
  数: { pinyin: "shù / shǔ / shuò / cù", readings: "读音一：shù；读音二：shǔ；读音三：shuò；读音四：cù", note: "原资料拼音作“shùo”，已按汉语拼音声调标注规则校为“shuò”。" },
  说: { pinyin: "shuō / shuì / yuè", readings: "读音一：shuō；读音二：shuì；读音三：yuè（通“悦”）", note: "原资料拼音作“shūo、shùi”，已按汉语拼音声调标注规则校为“shuō、shuì”。" },
};

const sourceVerificationNotes: Partial<Record<string, string[]>> = {
  克: ["原资料作“克已复礼”，据上传教材核为“克己复礼”。"],
  类: ["“举类迩而见义远”中，原资料释“事例”，上传教材注“类”为“事物”；页面保留原资料义项并标出差异。"],
  迁: ["“迁谪”应指贬官；“迁灭”在《六国论》语境中整体释为灭亡，教材关联卡已据上传教材校正。"],
  涕: ["原资料作“儿涕而去”，据上传教材《促织》核为“儿涕而出”。"],
  或: ["原资料将“或王命急宣”的“或”标为“如果”；据上传教材语境核为“有时”。"],
};

export const verifiedWords: VerifiedWord[] = sourceWords.map((sourceWord) => {
  const pinyinCorrection = pinyinCorrections[sourceWord.character];
  const senses: WordSense[] = sourceWord.senses.map((sense) => {
    if (sourceWord.character === "爱" && sense.sentence.includes("我何爱一牛")) {
      return {
        ...sense,
        sentence: sense.sentence.replace("我何爱一牛", "吾何爱一牛"),
        verificationNote: "原资料作“我何爱一牛”，据上传教材核为“吾何爱一牛”。",
      };
    }
    if (sourceWord.character === "克" && sense.sentence.includes("克已复礼")) {
      return {
        ...sense,
        sentence: sense.sentence.replace("克已复礼", "克己复礼"),
        verificationNote: "原资料作“克已复礼”，据上传教材核为“克己复礼”。",
      };
    }
    if (sourceWord.character === "涕" && sense.sentence.includes("儿涕而去")) {
      return {
        ...sense,
        sentence: sense.sentence.replace("儿涕而去", "儿涕而出"),
        verificationNote: "原资料作“儿涕而去”，据上传教材《促织》核为“儿涕而出”。",
      };
    }
    if (sourceWord.character === "类" && sense.sentence.includes("举类迩而见义远")) {
      return {
        ...sense,
        verificationNote: "原资料释“事例”；上传教材注“类”为“事物”。",
      };
    }
    if (sourceWord.character === "迁" && sense.sentence.includes("迁谪意")) {
      return {
        ...sense,
        meaning: "贬官，降职",
        verificationNote: "原资料误列为“升官”，据“迁谪”语境校正。",
      };
    }
    if (sourceWord.character === "迁" && sense.sentence.includes("五国迁灭")) {
      return {
        ...sense,
        verificationNote: "本义项可联系“改变，改动”；但例句中的“迁灭”在上传教材《六国论》语境中整体释为“灭亡”。",
      };
    }
    if (sourceWord.character === "或" && sense.sentence.includes("或王命急宣")) {
      return {
        ...sense,
        grammar: "副词",
        meaning: "有时",
        translation: "有时皇帝的命令急速传达，早晨从白帝城出发，晚上就到了江陵。",
        verificationNote: "原资料标为“如果，假如”，据上传教材语境核为“有时”。",
      };
    }
    if (sourceWord.character === "期" && sense.sentence.includes("期年之后")) {
      return {
        ...sense,
        meaning: "满一年",
        verificationNote: "原资料释义文字混杂，据上传教材注“期年”为“满一年”。",
      };
    }
    return sense;
  });

  const verificationNotes = [
    ...(pinyinCorrection ? [pinyinCorrection.note] : []),
    ...(sourceVerificationNotes[sourceWord.character] ?? []),
  ];

  return {
    index: sourceWord.index,
    character: sourceWord.character,
    pinyin: pinyinCorrection?.pinyin ?? sourceWord.pinyin,
    readings: pinyinCorrection?.readings ?? sourceWord.readings,
    senses,
    textbookExamples: examplesFor(sourceWord.character),
    idiomExamples: idiomsFor(sourceWord.character, senses),
    verificationNotes: verificationNotes.length ? verificationNotes : undefined,
  };
});

export const totalVerifiedSenses = verifiedWords.reduce((total, word) => total + word.senses.length, 0);
export const totalTextbookExamples = verifiedWords.reduce((total, word) => total + word.textbookExamples.length, 0);
export const totalVerifiedIdioms = new Set(verifiedWords.flatMap((word) => word.idiomExamples.map((example) => example.idiom))).size;
export const totalIdiomLinks = verifiedWords.reduce((total, word) => total + word.idiomExamples.length, 0);
