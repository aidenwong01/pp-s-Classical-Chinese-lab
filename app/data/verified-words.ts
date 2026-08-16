import sourceWords from "./all-words.json";
import exactTextbookLinks from "./textbook-links.json";

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

export type VerifiedWord = {
  index: number;
  character: string;
  pinyin: string;
  readings?: string;
  senses: WordSense[];
  textbookExamples: TextbookExample[];
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

const pinyinCorrections: Partial<Record<string, { pinyin: string; readings: string; note: string }>> = {
  度: { pinyin: "dù / duó", readings: "读音一：dù；读音二：duó", note: "原资料拼音作“dúo”，已按汉语拼音声调标注规则校为“duó”。" },
  数: { pinyin: "shù / shǔ / shuò / cù", readings: "读音一：shù；读音二：shǔ；读音三：shuò；读音四：cù", note: "原资料拼音作“shùo”，已按汉语拼音声调标注规则校为“shuò”。" },
  说: { pinyin: "shuō / shuì / yuè", readings: "读音一：shuō；读音二：shuì；读音三：yuè（通“悦”）", note: "原资料拼音作“shūo、shùi”，已按汉语拼音声调标注规则校为“shuō、shuì”。" },
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
    return sense;
  });

  return {
    index: sourceWord.index,
    character: sourceWord.character,
    pinyin: pinyinCorrection?.pinyin ?? sourceWord.pinyin,
    readings: pinyinCorrection?.readings ?? sourceWord.readings,
    senses,
    textbookExamples: examplesFor(sourceWord.character),
    verificationNotes: pinyinCorrection ? [pinyinCorrection.note] : undefined,
  };
});

export const totalVerifiedSenses = verifiedWords.reduce((total, word) => total + word.senses.length, 0);
export const totalTextbookExamples = verifiedWords.reduce((total, word) => total + word.textbookExamples.length, 0);
