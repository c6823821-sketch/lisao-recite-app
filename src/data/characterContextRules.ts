export interface CharacterContextRule {
  match?: string[];
  pronunciation?: string;
  meaning: string;
  grammar?: string;
  note?: string;
}

// These rules cover high-frequency function words and the places where a
// dictionary's first sense would be misleading in Li Sao.
export const CHARACTER_CONTEXT_RULES: Record<string, CharacterContextRule[]> = {
  兮: [{
    pronunciation: 'xī',
    meaning: '句中的语气助词，没有实在的词汇意义，用来延长声音、舒缓节奏，相当于现代汉语的“啊”“呀”。',
    grammar: '楚辞标志性的语气词，朗读时应在它前面稍作停顿。',
  }],
  之: [
    {
      match: ['之所在', '之所善', '之所厚', '之所急', '之所同', '之所居'],
      meaning: '结构助词，与后面的“所”组成名词性短语；这里不单独译成“的”。',
      grammar: '“……之所……”可理解为“……所……的地方、人、事情或目标”。',
    },
    {
      match: [
        '之不群', '之能周', '之可惩', '之数化', '之婵媛', '之偷乐', '之败绩',
        '之耿介', '之猖披', '之工巧', '之不察', '之变易', '之可贵', '之能祗',
        '之未晏', '之不谅', '之先鸣', '之偃蹇', '之难亏', '之不芳', '之不吾与',
        '之多艰', '之芜秽', '之峻茂', '之浩荡',
      ],
      meaning: '结构助词，用在主语和谓语之间，使前面的主谓短语变成整体，通常不必译出。',
      grammar: '这类“之”主要承担语法作用，不能按“到……去”理解。',
    },
    {
      match: [
        '之苗裔', '之初度', '之内美', '之修能', '之木兰', '之宿莽', '之零落',
        '之迟暮', '之九畹', '之百亩', '之落英', '之遗则', '之蛾眉', '之离合',
        '之下女', '之野', '之当', '之浪浪', '之中正', '之害', '之方壮',
      ],
      meaning: '结构助词，连接前后的修饰、领属或限定关系，通常相当于现代汉语的“的”。',
    },
    {
      meaning: '结构助词或代词。这里要根据前后成分判断它是“的”、取消句子独立性，还是指代前文的人或事物。',
      grammar: '不能把《离骚》中所有的“之”都机械翻成“的”。',
    },
  ],
  以: [
    {
      match: ['以为'],
      meaning: '与“为”组成“以为”，本句表示“把（前面的东西）作为、当作”或“认为”。',
      grammar: '“以为”要合起来理解，不能把“以”单独翻成“用”。',
    },
    {
      match: ['以嘉名', '以修能', '以蕙纕', '以揽茝', '以九死', '以此度'],
      meaning: '介词，表示动作所凭借的对象、工具或原因，可译为“用、拿、凭、因为”。',
    },
    {
      match: [
        '以驰骋', '以先后', '以掩涕', '以结茞', '以纫蕙', '以从俗', '以自娱',
        '以媮乐', '以相羊', '以来御', '以上征', '以复路', '以周流', '以自疏',
      ],
      meaning: '连词，连接前后两个动作，可译为“来、然后、因而”或不必译出。',
      grammar: '这里主要表示动作的方式、目的或承接关系。',
    },
    {
      meaning: '介词或连词。本句要按它前后的动作关系理解，可能是“用、凭、把”，也可能是“来、然后、因而”。',
    },
  ],
  而: [{
    meaning: '连词，连接前后的动作或状态；本句可按关系译为“然后、却、因而、来”，也可能不必译出。',
    grammar: '它不是“胡须”的意思，也不能单独当成现代汉语里的实词。',
  }],
  贞: [{
    match: ['摄提贞于孟陬'],
    pronunciation: 'zhēn',
    meaning: '正、正当；这里说岁星正当孟陬所在的寅年。',
    grammar: '不能按现代汉语“贞洁”理解。',
  }],
  嘉: [{
    match: ['嘉名'],
    pronunciation: 'jiā',
    meaning: '美好、美善；“嘉名”就是美好的名字。',
  }],
  重: [{
    match: ['重之以修能'],
    pronunciation: 'chóng',
    meaning: '再加上、增添；这里说在“内美”之外又加上后天修养。',
  }],
  帝: [{
    match: ['帝高阳'],
    pronunciation: 'dì',
    meaning: '古帝、天帝；这里“帝高阳”指古帝高阳氏。',
  }],
  伯: [{
    match: ['伯庸'],
    pronunciation: 'bó',
    meaning: '“伯庸”是屈原父亲的字；这里的“伯”是名字的一部分，不按“伯父、排行第一”硬解。',
  }],
  庸: [{
    match: ['伯庸'],
    pronunciation: 'yōng',
    meaning: '“庸”是屈原父亲字“伯庸”的组成部分，这里是专名用字。',
  }],
  彼: [{
    pronunciation: 'bǐ',
    meaning: '指示代词，那、那些；本句用来指前面的尧、舜。',
  }],
  尧: [{
    pronunciation: 'yáo',
    meaning: '传说中的上古贤君帝尧；“尧、舜”在这里代表清明政治。',
  }],
  舜: [{
    pronunciation: 'shùn',
    meaning: '传说中的上古贤君虞舜；不是木槿。',
  }],
  若: [{
    match: ['若将不及'],
    meaning: '好像、如同；这里说时光流逝，自己好像追赶不上。',
  }],
  岁: [{
    match: ['年岁'],
    pronunciation: 'suì',
    meaning: '年岁、岁月；“年岁之不吾与”指岁月不等待我。',
  }, {
    pronunciation: 'suì',
    meaning: '年、岁月；在“摄提”等纪年语境中也与岁星纪年有关。',
  }],
  余: [{
    pronunciation: 'yú',
    meaning: '第一人称代词，我；在“余马”“余冠”“余佩”等结构中相当于“我的”。',
  }],
  吾: [{
    pronunciation: 'wú',
    meaning: '第一人称代词，我或我的。',
  }],
  不: [{
    pronunciation: 'bù',
    meaning: '否定副词，不、没有；与后面的动词或形容词一起构成否定。',
  }],
  其: [
    {
      match: ['其叶', '其根', '其家', '其书', '其志', '其名', '其美', '其言'],
      meaning: '第三人称代词，他的、她的、它的或他们的。',
    },
    {
      meaning: '代词或语气副词。这里可能指“他的/它的/那”，也可能只用来加强语气，要结合后面的谓语判断。',
      grammar: '《离骚》中的“其”常出现在句中调节语气，不能一律译成“他的”。',
    },
  ],
  为: [
    {
      match: ['为余', '为之', '为媒', '为理'],
      pronunciation: 'wèi',
      meaning: '介词，给、替、为了或因为；后面的名词是动作服务的对象。',
    },
    {
      match: ['为佩', '为衣', '为裳', '为度', '为常', '为患'],
      pronunciation: 'wéi',
      meaning: '动词，做、成为、作为或当作。',
    },
    {
      pronunciation: 'wéi',
      meaning: '动词或介词，具体是“做、成为、作为”还是“替、为了”，要看它后面接的是动作还是对象。',
    },
  ],
  夫: [
    {
      match: ['仆夫'],
      pronunciation: 'fū',
      meaning: '成年男子；这里“仆夫”指驾车或随行的仆从。',
    },
    {
      match: ['夫惟', '夫唯', '夫何', '夫孰', '夫维'],
      pronunciation: 'fú',
      meaning: '句首语气词，用来引出议论或加强语气，通常不必译出。',
    },
    {
      pronunciation: 'fú',
      meaning: '指示代词“那”或句首、句末语气词；本句不是“丈夫”的意思。',
    },
  ],
  修: [
    { match: ['修能'], meaning: '美好、修美的，与“能”合起来指后天修养形成的才能。' },
    { match: ['修名'], meaning: '美好的名声。' },
    { match: ['修姱'], meaning: '修洁美好，这里写屈原重视自身品德与仪范。' },
    { match: ['好修'], meaning: '爱好修身、修洁，即重视后天的品德修养。' },
    { match: ['修远'], meaning: '漫长、遥远。', pronunciation: 'xiū' },
    { match: ['前修'], meaning: '前代有德行、有修养的贤人。' },
    { match: ['修吾初服'], meaning: '整治、整理我当初的服饰，比喻重新坚持本志。' },
    { meaning: '修养、修洁或美好；本句取哪一层要看它修饰的对象。' },
  ],
  乎: [{
    meaning: '介词或语气词。此处可能相当于“于（在、到、向）”或表示感叹、反问；要按它后面的成分判断。',
  }],
  何: [{
    meaning: '疑问代词或副词，什么、为什么、哪里、多么；本句是在发问或感叹。',
  }],
  此: [{
    meaning: '指示代词，这、这个、这种；具体所指要回看前一句。',
  }],
  将: [{
    meaning: '副词，将要、快要；有时也作动词“带、拿”。本句按后面的动作判断。',
  }],
  芳: [{
    meaning: '芳香；在《离骚》中也常由草木芳香引申为美好的品德、声誉或贤才。',
  }],
  又: [{
    meaning: '副词，又、再、而且；表示动作或状态在前一层意思上继续增加。',
  }],
  与: [
    { match: ['不吾与'], meaning: '等待；“不与吾”是“不等待我”。', pronunciation: 'yǔ' },
    { match: ['与辟芷', '与菌桂', '与芳芷', '与揭车', '与江离'], meaning: '连词，和、同。', pronunciation: 'yǔ' },
    { meaning: '连词“和”，介词“同、跟”，或动词“给予、等待”；本句要看前后成分。', pronunciation: 'yǔ' },
  ],
  既: [{
    meaning: '副词，已经、既然；表示动作完成或前提已经成立。',
  }],
  美: [{
    meaning: '美好；在《离骚》中可指容貌、品德、政治理想或美好的人。',
  }],
  未: [{
    meaning: '副词，还没有、不曾；有时表示“不”。',
  }],
  离: [
    { match: ['江离'], meaning: '香草名；这里“离”不能解释成“离开”。', pronunciation: 'lí' },
    { match: ['陆离'], meaning: '“陆离”合起来形容佩饰繁盛、光彩斑斓或长长的样子。', pronunciation: 'lí' },
    { match: ['离尤'], meaning: '通“罹”，遭受；“离尤”即遭遇罪过、获罪。', pronunciation: 'lí' },
    { match: ['离别'], meaning: '分离、离别。', pronunciation: 'lí' },
    { meaning: '分开、离开；若是“江离”则指香草，若是“离尤”则通“罹”。', pronunciation: 'lí' },
  ],
  所: [{
    meaning: '与后面的动词组成“所……”名词性结构，表示“所……的人、事物、地方或目标”。',
  }],
  好: [
    { match: ['好修', '好朋', '好蔽美', '好恶'], pronunciation: 'hào', meaning: '喜爱、偏好；“好修”即喜爱修身。' },
    { pronunciation: 'hǎo', meaning: '美好、良好。' },
  ],
  可: [{
    meaning: '可以、能够；在反问句中仍表示“能够、值得”。',
  }],
  皇: [
    { match: ['皇考'], meaning: '对已故父亲的尊称。', pronunciation: 'huáng' },
    { match: ['皇天'], meaning: '上天、天帝。', pronunciation: 'huáng' },
    { match: ['皇舆'], meaning: '君王所乘的车，本句象征国家政权。', pronunciation: 'huáng' },
    { meaning: '大、伟大，或对先辈、神灵的尊称。', pronunciation: 'huáng' },
  ],
  于: [{
    meaning: '介词，在、到、从、向、对于或被；本句要按后面的地点、时间或对象理解。',
  }],
  惟: [
    { match: ['惟庚寅', '惟夫党人', '惟草木'], meaning: '句首语气词，引出时间、对象或议论，通常不必译出。' },
    { match: ['惟此党人', '惟兹佩'], meaning: '只、只有。' },
    { match: ['岂惟'], meaning: '只、仅仅；“岂惟”即哪里只是。' },
    { meaning: '思考、只、仅仅，或句首语气词；本句不能一律译成“思考”。' },
  ],
  忽: [{
    meaning: '忽然、迅速；也可表示不经意。本句多指时间或动作来得快。',
  }],
  犹: [{
    meaning: '仍然、还；有时表示“尚且”或“好像”。',
  }],
  曰: [{
    meaning: '说、叫作；本句是在引出人物的话，或解释名称。',
  }],
  灵: [{
    meaning: '神灵、灵秀、灵验；在“灵修”“灵氛”等专名中要合起来理解。',
  }],
  能: [{
    meaning: '能够；作名词时指才能、能力。',
  }],
  佩: [{
    meaning: '佩带；作名词时指系在衣带上的佩饰。',
  }],
  日: [{
    meaning: '太阳、白天或时光；本句多借太阳运行写时间流逝。',
  }],
  路: [{
    meaning: '道路；在政治语境中常比喻治国路线、人生道路或政治前途。',
  }],
  固: [{
    meaning: '本来、固然，或坚固、固执；本句多用作语气副词。',
  }],
  周: [
    { match: ['能周', '周容'], meaning: '合、相合；或“苟合取容”。' },
    { match: ['周流'], meaning: '周游、四处流转。' },
    { match: ['周论道'], meaning: '周全地讲论。' },
    { meaning: '合、周全、周游；本句要按搭配判断。' },
  ],
  无: [{
    meaning: '没有；也可作否定副词“不、不要”。',
  }],
  有: [{
    meaning: '拥有、存在；与“无”相对。',
  }],
  恐: [{
    meaning: '担心、恐怕；《离骚》中常表示诗人对时光、国事或理想的忧惧。',
  }],
  众: [{
    meaning: '众多；作名词时指众人，常特指楚国结党营私的群小。',
  }],
  前: [{
    meaning: '前面、先前；作动词时可指上前、走在前面。',
  }],
  九: [{
    meaning: '数字九；古诗中常泛指极多、极深或反复。',
  }],
  时: [{
    meaning: '时节、时代、时机或时光。',
  }],
  求: [{
    meaning: '寻求、追求、要求；本句要根据后面的对象判断。',
  }],
  女: [
    { match: ['女媭'], pronunciation: 'nǚ', meaning: '女性亲属；“女媭”是屈原的女伴或姐姐一类人物。' },
    { match: ['释女'], pronunciation: 'rǔ', meaning: '通“汝”，你。' },
    { pronunciation: 'nǚ', meaning: '女子、女性；诗中有的“女”指美女，也有的象征理想或贤才。' },
  ],
  流: [{
    meaning: '流动、水流；也可表示流放、流传。',
  }],
  孰: [{
    meaning: '疑问代词，谁、哪一个；有时通“熟”，但本句多是“谁”。',
  }],
  远: [{
    meaning: '遥远；也可作动词，表示远离、疏远。',
  }],
  及: [{
    meaning: '赶上、等到、趁；本句要根据后面的时间或对象理解。',
  }],
  朝: [
    { match: ['朝夕', '朝饮', '朝搴', '朝发', '朝吾', '朝濯'], pronunciation: 'zhāo', meaning: '早晨。' },
    { pronunciation: 'zhāo', meaning: '早晨；若读 cháo 才表示朝见、朝廷。' },
  ],
  夕: [{
    pronunciation: 'xī',
    meaning: '傍晚、晚上；与“朝”对举时表示一天中的两个时段。',
  }],
  人: [{
    meaning: '人、人民、别人或人才；本句具体指哪一类人要看上下文。',
  }],
  道: [
    { match: ['道夫先路'], pronunciation: 'dǎo', meaning: '通“导”，引导、带路。' },
    { match: ['遵道', '论道', '异道'], pronunciation: 'dào', meaning: '正道、治国之道或政治主张。' },
    { pronunciation: 'dào', meaning: '道路，也可引申为途径、法度或政治理想。' },
  ],
  后: [
    { match: ['先后'], meaning: '后面、前后之间。' },
    { match: ['图后'], meaning: '以后、后事。' },
    { match: ['后辛'], meaning: '商纣王。' },
    { meaning: '后面、以后，或君主；不能一律理解成现代汉语的“皇后”。' },
  ],
  中: [
    { match: ['中情', '中正'], meaning: '内心、内中；或公正中正。' },
    { match: ['中道'], meaning: '中途、半路。' },
    { meaning: '里面、中间，或符合、射中；本句要按搭配判断。' },
  ],
  独: [{
    meaning: '独自、唯独；“独”在《离骚》中常突出屈原与世俗不合。',
  }],
  相: [
    { match: ['相道', '相观'], pronunciation: 'xiàng', meaning: '观察、察看。' },
    { match: ['相安', '相羊'], pronunciation: 'xiāng', meaning: '互相；或“相羊”通“徜徉”，自由徘徊。' },
    { pronunciation: 'xiàng', meaning: '观察；也可读 xiāng，表示互相。' },
  ],
  用: [{
    meaning: '使用、任用；本句多指君主是否采用人才或主张。',
  }],
  下: [{
    meaning: '下面、向下，或下界；本句要根据空间和动作判断。',
  }],
  高: [{
    meaning: '高、崇高；作动词时也可表示抬高。',
  }],
  览: [{
    meaning: '观看、观察、纵观；不是单纯的“阅读”。',
  }],
  纷: [{
    meaning: '众多、纷繁；在句首有时是楚辞的语助词，用来领起下文。',
  }],
  木: [{
    meaning: '树、木材；在“木兰”“若木”等专名中要合起来理解。',
  }],
  先: [{
    meaning: '先、在前面；作动词时可表示走在前面。',
  }],
  岂: [{
    meaning: '难道、哪里；用于反问，不是普通的否定词。',
  }],
  得: [{
    meaning: '得到、能够、适合；本句要根据后面的动词判断。',
  }],
  情: [{
    meaning: '情感、心意、真实情况；本句多指内心真情。',
  }],
  謇: [{
    meaning: '正直、忠直；也可指说话正直。诗中常用来写屈原的品格。',
  }],
  虽: [{
    meaning: '虽然、即使；用于让步，表示后文不受前面条件影响。',
  }],
  世: [{
    meaning: '世道、世俗、时代；本句多指当时的社会风气。',
  }],
  服: [{
    meaning: '佩带、使用、从事或服从；本句要按搭配判断。',
  }],
  民: [{
    meaning: '人、人民、百姓；《离骚》中有时“民生”指人生或诗人自身。',
  }],
  自: [{
    meaning: '自己、亲自；也可表示从、自从。',
  }],
  行: [{
    meaning: '行走、实行、品行；本句要根据搭配判断。',
  }],
  游: [{
    meaning: '游历、漫游、游乐；本句常写屈原的远游想象。',
  }],
  云: [{
    meaning: '说；也可是云气、云彩。',
  }],
  欲: [{
    meaning: '想要、将要；表示意愿或趋势。',
  }],
  令: [{
    meaning: '命令、让、使；本句后面通常跟着被命令的对象。',
  }],
  使: [{
    meaning: '让、命令、派遣；本句要根据后面的动作判断。',
  }],
  忍: [{
    meaning: '忍受、容忍、克制；本句不是“忍心”的现代口语义。',
  }],
  亦: [{
    meaning: '也、又；有时用于加强语气。',
  }],
  苟: [{
    meaning: '如果、只要；也可表示苟且。本句要根据后文判断。',
  }],
  长: [
    { match: ['长太息', '长顑颔', '长余佩'], pronunciation: 'cháng', meaning: '长、长久；或把……加长。' },
    { pronunciation: 'cháng', meaning: '长、长久、高；读 zhǎng 时才表示生长或年长。' },
  ],
  顾: [{
    meaning: '回头看、看顾；本句多写回望故乡或回顾自身。',
  }],
  厥: [{
    meaning: '他的、他们的，或那、那个。',
  }],
  望: [{
    meaning: '远望、盼望、希望；本句要根据动作对象判断。',
  }],
  怀: [{
    meaning: '怀藏、怀念、心怀；本句多指心中怀抱某种情感或理想。',
  }],
  初: [{
    meaning: '开始、当初；在“初度”中指初生之时。',
  }],
  度: [
    { match: ['初度'], pronunciation: 'dù', meaning: '气度、时节；这里指初生时的气度。' },
    { match: ['此度', '为度'], pronunciation: 'dù', meaning: '法度、尺度、标准。' },
    { pronunciation: 'duó', meaning: '量长短，或估计、衡量。' },
  ],
  正: [{
    meaning: '正直、公正；作动词时可表示纠正。',
  }],
  落: [{
    meaning: '落下、凋落；在“落英”中指初开的花。',
  }],
  改: [{
    meaning: '改变、改正；“改错”在这里是改变法度、安排。',
  }],
  杂: [{
    meaning: '混杂、交错、掺杂；本句多指把不同香草或人才并用。',
  }],
  幽: [{
    meaning: '幽深、幽暗、幽静；本句常借环境写心境或政治环境。',
  }],
  身: [{
    meaning: '自身、身体；本句多与个人祸福、志向相对。',
  }],
  反: [{
    meaning: '返回、反过来、违背；本句具体取哪一义要看后面的动作。',
  }],
  天: [{
    meaning: '天空、上天、天命；本句要在自然、神灵或命运意义之间判断。',
  }],
  悔: [{
    meaning: '后悔、悔悟；本句多是诗人对道路选择的反思。',
  }],
  难: [
    { match: ['多艰', '难迁', '难亏'], pronunciation: 'nán', meaning: '困难、难以。' },
    { pronunciation: 'nàn', meaning: '灾难、祸患；也可作动词表示责难。' },
  ],
  年: [{
    match: ['年岁'],
    pronunciation: 'nián',
    meaning: '年、年份；“年岁”在本句合起来指岁月、时光。',
  }],
  春: [{
    match: ['春与秋'],
    pronunciation: 'chūn',
    meaning: '春季；与“秋”对举，表示四时流转、岁月更替。',
  }],
  秋: [
    { match: ['春与秋'], pronunciation: 'qiū', meaning: '秋季；与“春”对举，表示时序交替。' },
    { match: ['秋菊', '秋兰'], pronunciation: 'qiū', meaning: '秋天；这里修饰后面的花木，不是“年成、收成”。' },
    { pronunciation: 'qiū', meaning: '秋季；不要误取“年成、收成”这一僻义。' },
  ],
  零: [{
    match: ['零落'],
    pronunciation: 'líng',
    meaning: '凋零、飘落；“草木之零落”就是草木凋谢。',
  }],
  抚: [{
    match: ['抚壮'],
    pronunciation: 'fǔ',
    meaning: '把握、趁着；“抚壮”即趁年富力强的时候。',
  }],
  壮: [{
    match: ['抚壮'],
    pronunciation: 'zhuàng',
    meaning: '壮年、年富力强的时候。',
  }],
  秽: [{
    match: ['弃秽'],
    pronunciation: 'huì',
    meaning: '污秽、秽恶，比喻政治和品行上的污浊。',
  }],
  乘: [{
    match: ['乘骐骥', '乘云', '乘鹥'],
    pronunciation: 'chéng',
    meaning: '乘坐、驾驭；不是“登高”的“升”。',
  }, {
    match: ['千乘'],
    pronunciation: 'shèng',
    meaning: '古代兵车计量单位，一车四马为一乘；“千乘”就是千辆兵车。',
  }],
  纯: [{
    match: ['纯粹'],
    pronunciation: 'chún',
    meaning: '纯正、精纯，没有杂质；“纯粹”在诗中形容德行美善。',
  }],
  桀: [{
    match: ['桀纣', '夏桀'],
    pronunciation: 'jié',
    meaning: '夏桀，夏朝末代暴君；这里不是“鸡栖的木桩”。',
  }, {
    match: ['桀鹥'],
    pronunciation: 'jié',
    meaning: '本句有版本异文，通常写作“乘鹥”；这里应理解为驾乘凤凰一类的神鸟，不按夏桀理解。',
  }],
  乐: [
    { match: ['偷乐', '康娱', '媮乐'], pronunciation: 'lè', meaning: '享乐、安乐；本句不是音乐。' },
    { pronunciation: 'lè', meaning: '快乐、享乐；读 yuè 时才表示音乐。' },
  ],
  绩: [{
    match: ['败绩'],
    pronunciation: 'jì',
    meaning: '“败绩”合起来指军队大败、事业倾覆；这里不是缉麻。',
  }],
  信: [
    { match: ['信谗'], pronunciation: 'xìn', meaning: '相信、听信；“信谗”就是听信谗言。' },
    { match: ['信姱', '信芳', '信美', '信修'], pronunciation: 'xìn', meaning: '确实、真正；用来加强后面的美好判断。' },
    { pronunciation: 'xìn', meaning: '相信、真实、确实；本句根据搭配判断，不能一律解作“诚实”。' },
  ],
  指: [{
    match: ['指九天', '指西海'],
    pronunciation: 'zhǐ',
    meaning: '指向、用手指着；这里是动作，不是名词“手指”。',
  }],
  故: [
    { match: ['故宇', '故都'], meaning: '旧的、原来的；故国、旧居。' },
    { match: ['之故', '何故', '吉故'], meaning: '缘故、原因、道理。' },
    { meaning: '缘故、原因，或旧的、原来的；不能一律解作“事故”。' },
  ],
  羌: [{
    pronunciation: 'qiāng',
    meaning: '楚辞中的句首语气词，常表示转折、反问或强调，可译为“却、竟、为什么”；不是西方的羌族。',
  }],
  数: [{
    match: ['数化'],
    pronunciation: 'shuò',
    meaning: '屡次、反复；“数化”就是反复改变主意。',
  }],
  量: [{
    match: ['量人'],
    pronunciation: 'liáng',
    meaning: '衡量、揣度；“以量人”指用自己的心思去猜度别人。',
  }],
  心: [{
    pronunciation: 'xīn',
    meaning: '内心、心意；古人以心为思考和情感的器官，本句不是单指生理上的心脏。',
  }],
  急: [{
    match: ['之所急'],
    pronunciation: 'jí',
    meaning: '急迫、重要；“非余心之所急”即不是我内心所急着追求的事。',
  }],
  练: [{
    match: ['练要'],
    pronunciation: 'liàn',
    meaning: '精练、精粹；“练要”指精纯而切要。',
  }],
  要: [
    { match: ['练要'], pronunciation: 'yào', meaning: '切要、精要。' },
    { match: ['盈要'], pronunciation: 'yāo', meaning: '同“腰”，腰部。' },
    { match: ['要之'], pronunciation: 'yāo', meaning: '邀请、迎候。' },
    { pronunciation: 'yào', meaning: '要点、重要，或邀请；本句要按搭配判断。' },
  ],
  愿: [{
    pronunciation: 'yuàn',
    meaning: '希望、愿意；不是“老实”。',
  }],
  遗: [
    { match: ['遗则'], pronunciation: 'yí', meaning: '遗留、传下；“遗则”就是留下的准则。' },
    { pronunciation: 'yí', meaning: '遗留、留下；也可表示遗失，本句要看后面的对象。' },
  ],
  终: [{
    pronunciation: 'zhōng',
    meaning: '终究、始终；“终不察”即始终不能体察。',
  }],
  谓: [
    { match: ['谓余'], pronunciation: 'wèi', meaning: '说、认为；“谓余以善淫”即说我善于淫邪。' },
    { pronunciation: 'wèi', meaning: '说、称为、认为；不是“告诉”一义优先。' },
  ],
  淫: [{
    match: ['善淫', '淫游'],
    pronunciation: 'yín',
    meaning: '过度、放纵；在本句指淫邪或沉溺游乐，不是“浸渍”。',
  }],
  工: [{
    match: ['工巧'],
    pronunciation: 'gōng',
    meaning: '善于、擅长；“工巧”在本句带贬义，指善于取巧。',
  }],
  巧: [{
    match: ['工巧', '佻巧'],
    pronunciation: 'qiǎo',
    meaning: '取巧、巧诈；“工巧”“佻巧”在本句都不是赞美的工艺技巧。',
  }],
  非: [{
    pronunciation: 'fēi',
    meaning: '不是、不对；本句用来否定后面的判断。',
  }],
  立: [{
    match: ['之不立'],
    pronunciation: 'lì',
    meaning: '树立、建立；“修名之不立”即美好的名声不能树立。',
  }],
  焉: [
    { match: ['且焉止息'], pronunciation: 'yān', meaning: '于此、在那里；“且焉止息”就是暂且在那里休息。' },
    { match: ['焉能'], pronunciation: 'yān', meaning: '怎么、哪里，用于反问。' },
    { pronunciation: 'yān', meaning: '于此、怎么或语气助词；本句不是问“哪里”时要看前后动作。' },
  ],
  上: [
    { match: ['上下而求索', '升降以上下'], meaning: '上天下地、上下四方；表示周遍求索。' },
    { match: ['上征'], meaning: '向上升起、升天。' },
    { meaning: '上面、向上或高位；本句要根据空间和动作判断。' },
  ],
  恶: [{
    match: ['恶其佻巧'],
    pronunciation: 'wù',
    meaning: '厌恶、不喜欢；不是“嫉妒”。',
  }],
  然: [
    { match: ['固然', '然'], pronunciation: 'rán', meaning: '这样、如此；“固然”即本来就是这样。' },
    { pronunciation: 'rán', meaning: '这样、如此，或表示转折“然而”；不是“燃烧”。' },
  ],
  家: [{
    match: ['家衖'],
    pronunciation: 'jiā',
    meaning: '家国、家族；“家衖”在本句借指国家和王室内部。',
  }],
  发: [
    { match: ['濯发'], pronunciation: 'fà', meaning: '头发；“濯发”就是洗头发。' },
    { match: ['发轫'], pronunciation: 'fā', meaning: '出发、启程。' },
    { pronunciation: 'fā', meaning: '发出、出发；读 fà 时指头发。' },
  ],
  止: [
    { match: ['止息'], pronunciation: 'zhǐ', meaning: '停下、休息；“止息”合起来就是停下来歇息。' },
    { match: ['所止'], pronunciation: 'zhǐ', meaning: '停留、安身的地方。' },
    { pronunciation: 'zhǐ', meaning: '停止、停留；不是“脚”。' },
  ],
  历: [
    { match: ['历兹'], pronunciation: 'lì', meaning: '经历、走到如今。' },
    { match: ['历吉日'], pronunciation: 'lì', meaning: '选择、经过；“历吉日”即选定吉日。' },
    { pronunciation: 'lì', meaning: '经过、经历或选择；不是“历书”。' },
  ],
  纵: [{
    match: ['自纵'],
    pronunciation: 'zòng',
    meaning: '放纵、任性；“自纵”即放纵自己。',
  }],
  弭: [{
    match: ['弭节'],
    pronunciation: 'mǐ',
    meaning: '止住、控制；“弭节”指停鞭缓行，不是弓的两端。',
  }],
  节: [{
    match: ['弭节'],
    pronunciation: 'jié',
    meaning: '节拍、行车的节奏；“弭节”指停鞭缓行。',
  }],
  来: [
    { match: ['来吾'], pronunciation: 'lái', meaning: '来吧；这里是招呼、号召对方前来的语气。' },
    { match: ['而来御'], pronunciation: 'lái', meaning: '前来、来到。' },
    { pronunciation: 'lái', meaning: '来到、前来；不是“麦子”。' },
  ],
  理: [
    { match: ['以为理'], pronunciation: 'lǐ', meaning: '媒人、说合的人；“吾令謇修以为理”即让謇修去作媒。' },
    { pronunciation: 'lǐ', meaning: '治理、道理，或媒人；本句不是雕琢玉石。' },
  ],
  并: [{
    match: ['并迎', '并驰'],
    pronunciation: 'bìng',
    meaning: '一起、一同；“并迎”就是一同迎接，“并驰”就是并排奔驰。',
  }],
  升: [{
    match: ['升降', '升皇'],
    pronunciation: 'shēng',
    meaning: '上升、登升；不是容量单位。',
  }],
  齐: [
    { match: ['齐桓'], pronunciation: 'qí', meaning: '齐国；“齐桓”指齐桓公。' },
    { match: ['齐玉轪'], pronunciation: 'qí', meaning: '使整齐、对齐。' },
    { pronunciation: 'qí', meaning: '整齐、相同，或齐国；本句看专名和动作判断。' },
  ],
  委: [
    { match: ['委厥美'], pronunciation: 'wěi', meaning: '抛弃、委弃；“委厥美”即抛弃自己美好的品质。' },
    { match: ['委蛇'], pronunciation: 'wēi', meaning: '同“逶迤”，曲折绵延、随风摆动的样子。' },
    { pronunciation: 'wěi', meaning: '委弃、托付；本句不是“积聚”。' },
  ],
  汝: [{
    match: ['汝何'],
    pronunciation: 'rǔ',
    meaning: '第二人称代词，你；不是河流名。',
  }],
  南: [{
    match: ['以南征'],
    pronunciation: 'nán',
    meaning: '南方、向南；这里指向南远行。',
  }],
  鲜: [{
    match: ['鲜终'],
    pronunciation: 'xiǎn',
    meaning: '少、少有；“鲜终”即少有善终。',
  }],
  夏: [{
    match: ['夏桀', '夏康娱'],
    pronunciation: 'xià',
    meaning: '夏朝；“夏桀”指夏朝末代君主桀。',
  }],
  殷: [{
    match: ['殷宗'],
    pronunciation: 'yīn',
    meaning: '殷朝、商朝；“殷宗”指殷商王朝的宗庙和国家。',
  }],
  维: [{
    match: ['夫维'],
    pronunciation: 'wéi',
    meaning: '句首语气词，用来引出判断或议论；不是“系物的大绳子”。',
  }],
  危: [{
    match: ['危死'],
    pronunciation: 'wēi',
    meaning: '危险、濒临死亡；“危死”即身临险境、几乎死去。',
  }],
  曾: [{
    match: ['曾歔欷'],
    pronunciation: 'zēng',
    meaning: '一次又一次、更加；这里写悲叹抽泣不断。',
  }],
  辞: [{
    match: ['陈辞', '敶词', '陈词'],
    pronunciation: 'cí',
    meaning: '言辞、陈说；“陈辞”即陈述自己的心意。',
  }],
  少: [{
    match: ['少留'],
    pronunciation: 'shǎo',
    meaning: '稍微、短暂地；“少留”就是稍作停留。',
  }],
  师: [{
    match: ['雷师'],
    pronunciation: 'shī',
    meaning: '掌管某种事务的神或职官；“雷师”即雷神。',
  }],
  御: [{
    match: ['来御'],
    pronunciation: 'yù',
    meaning: '迎接、护卫；“帅云霓而来御”即率领云霓前来迎接。',
  }],
  罢: [{
    match: ['将罢'],
    pronunciation: 'bà',
    meaning: '结束、将尽；“时将罢”指天色将晚、时光将尽。',
  }],
  丘: [{
    match: ['高丘'],
    pronunciation: 'qiū',
    meaning: '高丘、高处的土山；不是田亩单位。',
  }],
  迁: [{
    match: ['难迁'],
    pronunciation: 'qiān',
    meaning: '改变、迁就；“难迁”指心思乖戾、难以改变。',
  }],
  归: [{
    match: ['夕归次'],
    pronunciation: 'guī',
    meaning: '返回、回去；“夕归次于穷石”即晚上回去住在穷石。',
  }],
  保: [{
    match: ['保厥美'],
    pronunciation: 'bǎo',
    meaning: '保持、仗恃；“保厥美”即仗恃自己的美貌。',
  }],
  骄: [{
    match: ['骄傲'],
    pronunciation: 'jiāo',
    meaning: '骄傲、自恃；“骄傲”在句中写宓妃仗美自矜。',
  }],
  佚: [{
    match: ['佚女'],
    pronunciation: 'yì',
    meaning: '美好、美丽；“佚女”指美丽的女子。',
  }],
  虞: [{
    match: ['有虞'],
    pronunciation: 'yú',
    meaning: '有虞氏，古代部族；“有虞之二姚”指有虞氏的两位姚姓女子。',
  }],
  称: [{
    match: ['称恶'],
    pronunciation: 'chēng',
    meaning: '称扬、宣扬；“称恶”即称赞、宣扬恶行。',
  }],
  寤: [{
    match: ['又不寤'],
    pronunciation: 'wù',
    meaning: '醒悟、明白；“哲王又不寤”即明智的君王仍不觉悟。',
  }],
  古: [{
    match: ['终古'],
    pronunciation: 'gǔ',
    meaning: '“终古”合起来表示永远、直到永久，不是单指古代。',
  }],
  合: [{
    match: ['必合'],
    pronunciation: 'hé',
    meaning: '结合、聚合；“两美其必合”指双方美好必然结合。',
  }],
  州: [{
    match: ['九州'],
    pronunciation: 'zhōu',
    meaning: '古代对天下地域的划分；“九州”泛指天下、全国。',
  }],
  异: [{
    match: ['独异'],
    pronunciation: 'yì',
    meaning: '不同、特殊；“独异”即格外不同。',
  }],
  豫: [{
    match: ['犹豫'],
    pronunciation: 'yù',
    meaning: '“犹豫”合起来表示迟疑不决；不是“安乐”。',
  }],
  易: [{
    match: ['变易'],
    pronunciation: 'yì',
    meaning: '改变、变化；“变易”即变动不居。',
  }],
  实: [{
    match: ['无实'],
    pronunciation: 'shí',
    meaning: '实质、真实内容；“无实而容长”即没有内在实质，只徒有外表。',
  }],
  列: [{
    match: ['列乎众芳'],
    pronunciation: 'liè',
    meaning: '排列、列入；“列乎众芳”即跻身众芳之列。',
  }],
  专: [{
    match: ['专佞'],
    pronunciation: 'zhuān',
    meaning: '专横、专擅；“专佞”指专横而又谄媚。',
  }],
  汤: [{
    match: ['汤禹', '汤、禹'],
    pronunciation: 'tāng',
    meaning: '商汤，商朝开国君主；不是热水。',
  }],
  挚: [{
    match: ['挚、咎繇', '挚咎繇'],
    pronunciation: 'zhì',
    meaning: '伊尹之名；“挚、咎繇”是辅佐商汤、夏禹的贤臣。',
  }],
  傅: [{
    match: ['傅岩'],
    pronunciation: 'fù',
    meaning: '地名用字；“傅岩”是傅说曾经劳作的地方。',
  }],
  文: [{
    match: ['周文'],
    pronunciation: 'wén',
    meaning: '周文王；“周文”是专名简称，不是花纹。',
  }],
  桓: [{
    match: ['齐桓'],
    pronunciation: 'huán',
    meaning: '齐桓公的谥号用字；“齐桓”即齐桓公。',
  }],
  该: [{
    match: ['该辅'],
    pronunciation: 'gāi',
    meaning: '具备、充任；“该辅”指担任辅佐之臣。',
  }],
  说: [{
    match: ['说操筑'],
    pronunciation: 'yuè',
    meaning: '同“悦”，这里指傅说，商王武丁任用的贤臣；不是“说话”。',
  }],
  干: [{
    match: ['干进'],
    pronunciation: 'gān',
    meaning: '谋求、钻营；“干进”即谋求进身、追逐权位；不是盾牌。',
  }],
  沬: [{
    match: ['未沬'],
    pronunciation: 'mèi',
    meaning: '消散、衰微；“芬至今犹未沬”即芳香至今仍未消散。',
  }],
  方: [{
    match: ['方圜', '何方'],
    pronunciation: 'fāng',
    meaning: '方形；“方圜”就是方和圆，比喻性质相反、难以相合。',
  }, {
    match: ['方壮'],
    pronunciation: 'fāng',
    meaning: '正当、正在；“及余饰之方壮”即趁我的佩饰正盛美的时候。',
  }],
  麾: [{
    match: ['麾蛟龙'],
    pronunciation: 'huī',
    meaning: '指挥、挥令；“麾蛟龙”即指挥蛟龙架桥。',
  }],
  诏: [{
    match: ['诏西皇'],
    pronunciation: 'zhào',
    meaning: '命令、告诉；“诏西皇”即命令西皇。',
  }],
  左: [{
    match: ['左转'],
    pronunciation: 'zuǒ',
    meaning: '左边、向左；“左转”就是向左转。',
  }],
  转: [{
    match: ['左转'],
    pronunciation: 'zhuǎn',
    meaning: '转向、转弯。',
  }],
  载: [{
    match: ['载云旗'],
    pronunciation: 'zài',
    meaning: '承载、举起；“载云旗”即车上承载、高举云旗。',
  }, {
    pronunciation: 'zài',
    meaning: '承载、装载；不是名词“车子”。',
  }],
  奏: [{
    match: ['奏《九歌》'],
    pronunciation: 'zòu',
    meaning: '演奏、奏乐。',
  }],
  赫: [{
    match: ['赫戏'],
    pronunciation: 'hè',
    meaning: '光明盛大；“赫戏”形容光辉灿烂。',
  }],
  戏: [{
    match: ['赫戏'],
    pronunciation: 'xī',
    meaning: '“赫戏”是光明盛大、辉煌灿烂的样子，不是游戏。',
  }],
  睨: [{
    match: ['临睨'],
    pronunciation: 'nì',
    meaning: '斜视、俯视；“临睨旧乡”即从高处俯视故乡。',
  }],
  足: [{
    match: ['莫足与'],
    pronunciation: 'zú',
    meaning: '值得、足以；“莫足与为美政”即没有值得共同推行美政的人。',
  }],
};
