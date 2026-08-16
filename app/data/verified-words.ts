export type WordSense = {
  grammar: string;
  meaning: string;
  sentence: string;
  reference: string;
  translation: string;
  sourceMarksOriginal?: boolean;
};

export type VerifiedWord = {
  character: string;
  pinyin: string;
  readings?: string;
  senses: WordSense[];
};

// 第二轮首批词条。全部逐项录自用户上传的《120实词归档版》；
// 尚未完成与现行教材页码、文字学著作及高考真题的交叉核验。
export const verifiedWords: VerifiedWord[] = [
  {
    character: "爱",
    pinyin: "ài",
    senses: [
      { grammar: "名词", meaning: "恩惠", sentence: "及子产卒，仲尼闻之，出涕曰：‘古之遗爱也。’", reference: "《左传·昭公二十年》", translation: "等到子产死去，孔子听说这件事后，流着眼泪说：‘他是古代为我们留下来的恩惠啊。’" },
      { grammar: "动词", meaning: "给人恩惠", sentence: "吴广素爱人，士卒多为用者。", reference: "《史记·陈涉世家》", translation: "吴广平素给人恩惠，士兵有很多肯为他所用。" },
      { grammar: "动词", meaning: "喜爱", sentence: "爱其子，择师而教之。", reference: "韩愈《师说》", translation: "喜爱他的儿子，选择良师教他们。", sourceMarksOriginal: true },
      { grammar: "动词", meaning: "怜惜，同情", sentence: "爱其二毛，则如服焉。", reference: "《左传·子鱼论战》", translation: "怜惜那些鬓发斑白的老人，还不如向他们投降。" },
      { grammar: "动词", meaning: "吝惜，舍不得", sentence: "齐国虽褊小，我何爱一牛？", reference: "《孟子·齐桓晋文之事》", translation: "齐国虽然不算广大富裕，但我怎么会吝惜一头牛呢？" },
      { grammar: "形容词", meaning: "吝啬", sentence: "百姓皆以王为爱也。", reference: "《孟子·齐桓晋文之事》", translation: "百姓都认为您是吝啬啊。" },
    ],
  },
  {
    character: "安",
    pinyin: "ān",
    senses: [
      { grammar: "形容词", meaning: "安全，平安", sentence: "谢庄遂安。", reference: "《冯婉贞》", translation: "谢庄于是就安全了。" },
      { grammar: "形容词", meaning: "安稳", sentence: "风雨不动安如山。", reference: "《茅屋为秋风所破歌》", translation: "在风雨中像大山一样安稳。" },
      { grammar: "形容词", meaning: "安定，舒适", sentence: "不患寡而患不均，不患贫而患不安。", reference: "《季氏将伐颛臾》", translation: "不担忧东西少而担忧分配得不均匀，不担忧贫穷而担忧社会不安定。" },
      { grammar: "动词", meaning: "安身", sentence: "衣食所安，弗敢专也，必以分人。", reference: "《左传·曹刿论战》", translation: "使人安身立命的衣物食品，不敢独自占有，一定拿出来分给别人。" },
      { grammar: "动词", meaning: "使……安定", sentence: "既来之，则安之。", reference: "《季氏将伐颛臾》", translation: "使他们到来之后，就要使他们安定下来。" },
      { grammar: "疑问代词", meaning: "怎么，哪里", sentence: "臣死且不避，卮酒安足辞？", reference: "《史记·鸿门宴》", translation: "我对死尚且不躲避，一杯酒哪里值得推辞呢？" },
    ],
  },
  {
    character: "被",
    pinyin: "bèi / pī",
    readings: "bèi；pī（通‘披’）",
    senses: [
      { grammar: "名词", meaning: "被子", sentence: "外人颇有公孙布被之讥。", reference: "《训俭示康》", translation: "外面很有一些人讥笑您，说您就像公孙弘盖布被子一样做假骗人。" },
      { grammar: "动词", meaning: "覆盖", sentence: "大雪逾岭，被南越中数州。", reference: "《答韦中立论师道书》", translation: "大雪飘过岭南，覆盖了南越一带好几个州。" },
      { grammar: "动词", meaning: "遭受", sentence: "世之有饥穰，天之行也，禹汤被之矣。", reference: "《论积贮疏》", translation: "世上有灾年和丰年，是自然界的规律，禹、汤这样的贤君也曾遭受过。" },
      { grammar: "介词", meaning: "表示被动", sentence: "信而见疑，忠而被谤，能无怨乎？", reference: "《史记·屈原列传》", translation: "诚信却被怀疑，忠贞却被诽谤，能没有怨恨吗？" },
      { grammar: "动词（pī）", meaning: "穿在身上或披在身上", sentence: "将军身被坚执锐，伐无道，诛暴秦。", reference: "《史记·陈涉世家》", translation: "将军您亲身穿着坚固的铠甲，拿着锐利的兵器，攻打无道暴虐的秦王朝。" },
      { grammar: "动词（pī）", meaning: "披散", sentence: "屈原至于江滨，被发行吟泽畔。", reference: "《史记·屈原列传》", translation: "屈原来到江边，披散着头发，在水边一边走一边吟咏诗句。" },
    ],
  },
  {
    character: "倍",
    pinyin: "bèi",
    senses: [
      { grammar: "动词", meaning: "背向，背着", sentence: "兵法右倍山陵，前左水泽。", reference: "《史记·淮阴侯列传》", translation: "按照兵法，布阵时应当右面靠着山陵，前方和左面靠着水泽。" },
      { grammar: "动词", meaning: "违背，背叛", sentence: "愿伯具言臣之不敢倍德也。", reference: "《史记·鸿门宴》", translation: "希望您详细地对项王说明我是不敢背弃他的恩德的。" },
      { grammar: "动词", meaning: "加倍", sentence: "虽倍赏累罚而不免于乱。", reference: "《五蠹》", translation: "即使加倍赏赐，屡次惩罚，也还是不能避免祸乱。" },
      { grammar: "数词", meaning: "一倍", sentence: "十则围之，五则攻之，倍则分之。", reference: "《孙子·谋攻》", translation: "十倍于敌就包围他们，五倍于敌就攻打他们，一倍于敌就设法分散他们的力量。" },
      { grammar: "量词", meaning: "照原数加一次", sentence: "然言其户口，则视三十年以前增五倍焉。", reference: "《治平篇》", translation: "可是说到住户和人口，就比三十年以前增加了五倍。" },
      { grammar: "副词", meaning: "更加，倍加", sentence: "独在异乡为异客，每逢佳节倍思亲。", reference: "《九月九日忆山东兄弟》", translation: "独自一人在异地客居，每到佳节更加思念亲人。" },
    ],
  },
  {
    character: "本",
    pinyin: "běn",
    senses: [
      { grammar: "名词", meaning: "草木的根", sentence: "求木之长者，必固其根本。", reference: "《谏太宗十思疏》", translation: "希望树木长得高的，一定要使它的根扎得稳固。" },
      { grammar: "名词", meaning: "根本，基础", sentence: "王欲行之，则盍反其本矣？", reference: "《齐桓晋文之事》", translation: "如果您要实行仁政，为什么不回到根本上求得解决呢？" },
      { grammar: "名词", meaning: "本业，常代指农业", sentence: "今殴民而归之农，皆著于本。", reference: "《论积贮疏》", translation: "如果督促那些弃农经商的百姓回到农业上来，都从事农业生产。" },
      { grammar: "名词", meaning: "书本，稿本，版本", sentence: "今存其本不忍废。", reference: "《〈指南录〉后序》", translation: "现在还保存那底稿，舍不得丢掉。" },
      { grammar: "量词", meaning: "书籍、印刷品的计量单位", sentence: "若印数十百千本，则极为神速。", reference: "《活板》", translation: "如果印几十、几百、几千本，就非常快了。" },
      { grammar: "动词", meaning: "推究本源，考查", sentence: "抑本其成败之迹，而皆自于人欤？", reference: "《伶官传序》", translation: "还是推究他成功与失败的事迹，都由于人为的原因呢？" },
      { grammar: "副词", meaning: "本来", sentence: "臣本布衣，躬耕南阳。", reference: "《出师表》", translation: "我本来是平民百姓，在南阳种地为生。" },
    ],
  },
  {
    character: "鄙",
    pinyin: "bǐ",
    senses: [
      { grammar: "名词", meaning: "边界，边远的地方", sentence: "蜀之鄙，有二僧。", reference: "《为学》", translation: "蜀地的边邑有两个僧人。" },
      { grammar: "动词", meaning: "以……为边界（边邑）", sentence: "越国以鄙远，君知其难也。", reference: "《烛之武退秦师》", translation: "越过别的国家，把遥远的地方当作自己的边邑，您知道那是很难的。" },
      { grammar: "动词", meaning: "轻视，瞧不起", sentence: "孔子鄙其小器。", reference: "《训俭示康》", translation: "孔子瞧不起他的器量狭小。" },
      { grammar: "形容词", meaning: "鄙陋，见识浅，庸俗", sentence: "肉食者鄙，未能远谋。", reference: "《曹刿论战》", translation: "那些做官的人见识短浅，不能深谋远虑。" },
    ],
  },
];
