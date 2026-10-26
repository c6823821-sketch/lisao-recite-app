import { LISAO_LINES } from './lisao';

export const LISAO_RECITATION_LINES: string[] = LISAO_LINES.flatMap((line) => (
  line.match(/[^\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A]+[\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A]?/g)
    ?.map((part) => part.trim())
    .filter(Boolean) ?? [line]
));

export interface LisaoUnit {
  id: string;
  sectionId: string;
  startLine: number;
  endLine: number;
  lines: string[];
  text: string;
  translation: string;
}

export interface LisaoSection {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  overview: string;
  insight: string;
  memoryGuide: string;
  notes: string[];
  units: LisaoUnit[];
}

interface UnitSpec {
  start: number;
  end: number;
  translation: string;
}

interface SectionSpec {
  id: string;
  title: string;
  subtitle: string;
  overview: string;
  insight: string;
  memoryGuide: string;
  notes: string[];
  units: UnitSpec[];
}

const SPECS: SectionSpec[] = [
  {
    id: 'origin',
    title: '一、世系与初心',
    subtitle: '高阳之后，内美修能',
    overview: '《离骚》先交代屈原高贵的世系、奇异的诞辰和父亲赐名，再把“内美”与后天修养并置：出身只是起点，真正决定人格的是持续自修。',
    insight: '“正则”“灵均”不是普通名字，而是把公正、法度、灵秀与均衡写进人生理想。香草佩饰则成为全篇反复出现的品格象征。',
    memoryGuide: '先记“我是谁—何时生—叫什么—如何修”，再记日月流逝和乘骐骥引路的转折。',
    notes: [
      '高阳：传说中颛顼的称号，屈原借世系强调自己与楚王同源。',
      '苗裔：远代子孙。',
      '摄提、孟陬、庚寅：分别指岁星纪年、农历正月和干支日，用来标记屈原自述的出生时刻。',
      '正则、灵均：屈原在诗中的名与字，含有公正、法度、灵秀、均衡的理想意味。',
      '江离、辟芷、秋兰：香草意象。屈原以佩香草写自我修养与人格洁净。',
    ],
    units: [
      { start: 0, end: 1, translation: '我是古帝高阳氏的远代子孙，我已故的父亲名叫伯庸。' },
      { start: 2, end: 3, translation: '岁星正好在摄提格之年，时值孟陬正月，我又在庚寅这一天降生。' },
      { start: 4, end: 5, translation: '父亲仔细观察我初生时的气度，开始赐给我美好的名字。' },
      { start: 6, end: 7, translation: '他给我取名为“正则”，又给我取字为“灵均”。' },
      { start: 8, end: 9, translation: '我既拥有这些内在的美好品质，又不断加上后天的修养和才能。' },
      { start: 10, end: 11, translation: '我披着江离与幽僻处的白芷，又把秋兰连缀起来作为佩饰。' },
      { start: 12, end: 13, translation: '时光像流水般追赶不及，我担心岁月不肯等待我。' },
      { start: 14, end: 15, translation: '清晨我攀上山冈采木兰，傍晚又在沙洲采摘宿莽。' },
      { start: 16, end: 17, translation: '日月匆匆不肯停留，春与秋依次交替。' },
      { start: 18, end: 19, translation: '想到草木都会零落，我也担心心中的“美人”终将迟暮。' },
      { start: 20, end: 21, translation: '为什么不肯趁年富力强时抛弃秽恶，改变眼前这不合理的法度？' },
      { start: 22, end: 23, translation: '骑上骏马尽情奔驰吧，我愿意在前面为你引路。' },
    ],
  },
  {
    id: 'three-kings',
    title: '二、先王之道与党人之祸',
    subtitle: '尧舜遵道，桀纣窘步',
    overview: '屈原把三代明君与桀纣、党人并列，建立“用贤循道则兴，结党走捷径则败”的政治判断，也第一次表明自己忧虑的不是个人祸福，而是国家倾覆。',
    insight: '香草不再只是装饰，而是贤才与善政的集合象征；捷径则对应苟且偷安、破坏法度的政治路径。',
    memoryGuide: '记住三组对照：三后众芳、尧舜得路、桀纣窘步；最后落到党人偷乐和“皇舆败绩”。',
    notes: [
      '三后：通常指楚先王或古代三位贤君；此处强调政治清明与群贤汇聚。',
      '申椒、菌桂、蕙、茝：皆为香木香草，对应贤才与美政。',
      '捷径：不是现代意义的效率道路，而是偏邪苟且、绕开正道的政治方式。',
      '皇舆：君王所乘之车，象征国家政权。',
      '灵修：诗中多指君王，也兼有“神明、美善”的象征色彩。',
    ],
    units: [
      { start: 24, end: 25, translation: '从前三位贤君德行纯美，所以众多贤才都聚集在他们身边。' },
      { start: 26, end: 27, translation: '他们杂用申椒、菌桂，哪里只限于蕙草和白芷呢？' },
      { start: 28, end: 29, translation: '尧、舜光明正大，遵循正道而找到了治国的通途。' },
      { start: 30, end: 31, translation: '桀、纣为何如此猖狂偏邪？正因专走捷径，才把自己逼入困境。' },
      { start: 32, end: 33, translation: '那些结党营私的人苟且偷乐，使国家道路幽暗而危险。' },
      { start: 34, end: 35, translation: '我难道害怕自身遭受祸殃吗？我担心的是君王的车驾倾覆、国家败亡。' },
      { start: 36, end: 37, translation: '我匆匆奔走在君王前后，只想追上前代圣王的足迹。' },
      { start: 38, end: 39, translation: '可君王不体察我的忠心，反而听信谗言，对我大发怒意。' },
      { start: 40, end: 41, translation: '我本来知道直言进谏容易招祸，却仍忍不住沉默不说。' },
      { start: 42, end: 43, translation: '我指着九天为证，这一切都只是为了君王。' },
      { start: 44, end: 45, translation: '本来说好以黄昏为相会之期，为什么走到半路却改变方向？' },
      { start: 46, end: 47, translation: '当初君王既已与我约定，后来又翻悔回避，另作打算。' },
      { start: 48, end: 49, translation: '我并非不能承受离别，只伤心君王的反复无常。' },
    ],
  },
  {
    id: 'fragrant-field',
    title: '三、滋兰树蕙与群芳芜秽',
    subtitle: '理想栽培，反成荒草',
    overview: '屈原把自己培养人才、经营理想政治的努力比作种植九畹兰、百亩蕙。他并不怕自己枯萎，真正痛心的是辛苦栽培的群芳竟被世俗的贪婪和嫉妒污染。',
    insight: '这一段从政治栽培转入人才变质。芳草一旦失去修养，也会荒秽；这正是屈原后来反复追问“芳草为何变萧艾”的前奏。',
    memoryGuide: '用“种—盼—伤—被逐—九死未悔”串起：先种芳草，再盼收获，随后哀其芜秽，最后写自己的坚守。',
    notes: [
      '九畹、百亩：并非精确土地数字，而是极言种植之广。',
      '留夷、揭车、杜衡、芳芷：多种香草，象征不同类型的人才。',
      '芜秽：荒废污秽，指人才变质或政治环境败坏。',
      '修名：美好的名声，不是虚荣，而是人格与事业留下的清名。',
      '彭咸：屈原反复提到的古代贤者，后世多理解为投水殉志的典范。',
    ],
    units: [
      { start: 50, end: 51, translation: '我已经栽种了九畹兰，又种下百亩蕙草。' },
      { start: 52, end: 53, translation: '我分畦种植留夷和揭车，又夹杂杜衡与芳芷。' },
      { start: 54, end: 55, translation: '希望它们的枝叶长得繁茂，等到成熟时我能收获。' },
      { start: 56, end: 57, translation: '即使我自己枯萎凋绝又有什么可悲伤？我哀的是众多芳草竟荒芜污秽。' },
      { start: 58, end: 59, translation: '众人都争相钻营，贪得无厌，索取从不知满足。' },
      { start: 60, end: 61, translation: '他们宽恕自己、苛量别人，各怀心思，彼此嫉妒。' },
      { start: 62, end: 63, translation: '奔忙追逐并非我心中所急。' },
      { start: 64, end: 65, translation: '衰老渐渐临近，我担心美好的名声不能建立。' },
      { start: 66, end: 67, translation: '清晨饮木兰花上的坠露，傍晚吃秋菊落下的花瓣。' },
      { start: 68, end: 69, translation: '只要我的情志真正美好而精纯，长久面容憔悴又有什么妨碍？' },
      { start: 70, end: 71, translation: '我拿木根系住白芷，又串起薜荔的花蕊。' },
      { start: 72, end: 73, translation: '举起菌桂来连缀蕙草，把胡绳搓成长长的一串。' },
      { start: 74, end: 75, translation: '我虔诚地效法前代贤者，这不是世俗之人所愿穿佩的。' },
      { start: 76, end: 77, translation: '即使不能迎合今天的人，我也愿依从彭咸留下的准则。' },
    ],
  },
  {
    id: 'nine-deaths',
    title: '四、清白守直，九死未悔',
    subtitle: '众女嫉蛾眉，吾独穷困',
    overview: '这是《离骚》最著名的自我宣言之一。屈原明知直言会招祸，仍不肯放弃清白；即使被造谣、被废弃、被孤立，也坚持“伏清白以死直”。',
    insight: '“九死未悔”不是一时激愤，而是经过政治现实检验后的价值选择。它与后文“虽体解吾犹未变”构成层层递进。',
    memoryGuide: '抓住一条冲突线：我修洁—遭谗—被废—众人改规矩—我孤独—宁死不改。',
    notes: [
      '鞿羁：本指马缰绳，这里比喻自我约束与操守。',
      '蕙纕、揽茝：香草佩饰，代指屈原美好的德行与政治理想。',
      '蛾眉：美人细长的眉，借指美好的品格与才能；众女则喻嫉妒他的小人。',
      '绳墨：木匠取直的墨线，比喻法度与原则。',
      '侘傺：失意、孤独而不得志的样子。',
      '鸷鸟：猛禽，不合群而自守，象征屈原不与世俗同流。',
    ],
    units: [
      { start: 78, end: 79, translation: '我长声叹息、掩面流泪，哀叹人民生活多么艰难。' },
      { start: 80, end: 81, translation: '我虽然爱好修洁、严格约束自己，却清晨进谏、晚上就被废弃。' },
      { start: 82, end: 83, translation: '他们既以蕙草佩带为我的罪过，又把采摘白芷作为追加的罪名。' },
      { start: 84, end: 85, translation: '只要是我内心认定的美善，即使死上九次也绝不后悔。' },
      { start: 86, end: 87, translation: '我怨恨君王如此放纵糊涂，始终不体察民心。' },
      { start: 88, end: 89, translation: '众女嫉妒我的美貌，便造谣说我善于淫邪。' },
      { start: 90, end: 91, translation: '世俗本来就善于取巧，背弃规矩、改变法度。' },
      { start: 92, end: 93, translation: '他们违背准绳去追求邪曲，竞相把逢迎讨好当作法则。' },
      { start: 94, end: 95, translation: '我忧郁烦闷、孤独失意，偏偏在这个时代陷入穷困。' },
      { start: 96, end: 97, translation: '我宁可突然死去或流亡，也不忍做出这种丑态。' },
      { start: 98, end: 99, translation: '猛禽本来就不与凡鸟合群，从前世起便一直如此。' },
      { start: 100, end: 101, translation: '方和圆怎能彼此相合？道路不同的人又怎能相安无事？' },
      { start: 102, end: 103, translation: '我委屈心志、压抑抱负，忍受罪责与羞辱。' },
      { start: 104, end: 105, translation: '保持清白，为正直而死，这本来就是前代圣贤所看重的。' },
    ],
  },
  {
    id: 'return',
    title: '五、回车复路，退修初服',
    subtitle: '芳洁不因无人知而减损',
    overview: '在政治道路受阻后，屈原想象自己回车返路，退而重修最初的高洁装束。这里不是放弃理想，而是从外在仕途退回内在人格，用荷衣、芙蓉裳、高冠、长佩重建自我。',
    insight: '“退”并不等于妥协。屈原越是被现实排斥，越要把清白、芳香和尊严保存得完整。',
    memoryGuide: '用一条空间移动记：回车—兰皋—椒丘—退修—荷衣—高冠—四荒—体解不变。',
    notes: [
      '兰皋、椒丘：长满兰草的水边高地与长着花椒的山丘，都是芳洁之地。',
      '初服：最初高洁的服饰与志趣，象征未受世俗污染的本来人格。',
      '芰荷、芙蓉：荷叶与荷花，制成衣裳，象征把清白芳香穿在身上。',
      '岌岌：高耸的样子；陆离：佩饰纷繁美好。',
      '昭质：光明洁净的本质。',
    ],
    units: [
      { start: 106, end: 107, translation: '我后悔没有看清前路，久久站立，准备返回。' },
      { start: 108, end: 109, translation: '我把车头掉回原路，趁迷途还没有走远。' },
      { start: 110, end: 111, translation: '让马在兰皋缓步，又驰向椒丘，暂且在那里休息。' },
      { start: 112, end: 113, translation: '既然进身不被容纳、反遭罪责，那就退回来重修我最初的高洁。' },
      { start: 114, end: 115, translation: '把菱叶与荷叶制成上衣，把芙蓉花集起来做成下裳。' },
      { start: 116, end: 117, translation: '即使没有人了解我也罢了，只要我的内心确实芬芳。' },
      { start: 118, end: 119, translation: '把我的冠戴得高耸，把佩饰垂得修长而缤纷。' },
      { start: 120, end: 121, translation: '芳香与污垢虽然混杂，我光明洁净的本质仍未亏损。' },
      { start: 122, end: 123, translation: '忽然回头纵目远望，我准备到四方荒远之地看看。' },
      { start: 124, end: 125, translation: '佩饰缤纷繁盛，芳香浓郁，越发显明。' },
      { start: 126, end: 127, translation: '人们各有自己的快乐，我独爱修洁并把它当作日常。' },
      { start: 128, end: 129, translation: '即使身体被肢解，我也不会改变，难道我的心还能受到惩罚而退缩？' },
    ],
  },
  {
    id: 'nuxu',
    title: '六、女媭劝告',
    subtitle: '至亲之忧，不能改变其志',
    overview: '女媭以鲧的刚直丧命为戒，劝屈原不要过分博学直言、独守美节。她代表现实世界最亲近、最善意的担忧，也反衬屈原孤绝选择的代价。',
    insight: '女媭不是反派，她的话越是有理，越能显出屈原坚持理想所面对的孤独。',
    memoryGuide: '记住“女媭责备—举鲧为戒—众人不容—我向重华陈词”的过渡。',
    notes: [
      '女媭：屈原的姐姐或女性亲属，具体身份自古以来有不同解释。',
      '鲧：传说中大禹之父，因治水失败被杀于羽山；女媭以他刚直丧生为戒。',
      '婞直：刚强直率，不肯曲从。',
      '重华：舜的名字。屈原准备南渡沅湘，向舜陈诉自己的志向。',
    ],
    units: [
      { start: 130, end: 131, translation: '女媭对我十分关切，一再絮絮地责备我。' },
      { start: 132, end: 134, translation: '她说：鲧因为刚直不屈而丢掉性命，最终死在羽山之野。' },
      { start: 135, end: 136, translation: '你为何如此博学直言、爱好修洁，偏要独自守住这些美好节操？' },
      { start: 137, end: 138, translation: '众人都把恶草满室堆积，你却判然离开，不肯佩用。' },
      { start: 139, end: 140, translation: '众人不可能挨家挨户去解释，谁能体察我内心的真情？' },
      { start: 141, end: 142, translation: '世人彼此推举、结党成朋，你为何孤独自守，却不肯听别人的话？' },
      { start: 143, end: 144, translation: '我依从前代圣贤来节制内心，却只能叹息着承受眼前的困境。' },
      { start: 145, end: 146, translation: '我要渡过沅水、湘水向南远行，到重华面前陈述自己的心志。' },
    ],
  },
  {
    id: 'chonghua',
    title: '七、陈辞重华：兴亡镜鉴',
    subtitle: '历史不是故事，是政治判词',
    overview: '屈原向舜陈述历代兴亡：夏启纵乐、后羿淫游、浇纵欲、桀纣失道，最终亡国；汤、禹、周则敬慎用贤、循法无私。他借历史证明自己的政治原则，并表明即使危死也不后悔。',
    insight: '这一段是《离骚》的政治史论。屈原不是把兴亡归于天命，而是归于是否敬慎、用贤、守法和节制欲望。',
    memoryGuide: '按“反面暴君—正面明王—天理民心—自誓不悔”记忆，反例链尤其重要：启、羿、浇、桀、纣。',
    notes: [
      '九辩、九歌：传说与夏启有关的乐歌，这里借指纵情享乐。',
      '五子：夏启之子，因内乱失国；具体人名和事件有不同传说版本。',
      '寒浞、浇：夏代乱臣与暴君，屈原用来说明纵欲乱政的下场。',
      '后辛：殷纣王；菹醢指把人剁成肉酱的酷刑。',
      '汤、禹、周：代表敬慎、用贤、循法的正面政治传统。',
      '矩矱：规矩和法度。',
    ],
    units: [
      { start: 147, end: 148, translation: '夏启从天上得到《九辩》《九歌》，却借此纵情享乐。' },
      { start: 149, end: 150, translation: '他不顾未来的危难，五个儿子因此失去家国。' },
      { start: 151, end: 152, translation: '后羿沉溺游乐和田猎，又喜欢射杀大狐。' },
      { start: 153, end: 154, translation: '淫乱之人少有善终，寒浞又贪夺了他的妻室。' },
      { start: 155, end: 156, translation: '浇依仗强暴勇力，放纵欲望而不知节制。' },
      { start: 157, end: 158, translation: '他天天纵情享乐而忘却自身，最终头颅坠落。' },
      { start: 159, end: 160, translation: '夏桀始终违背正道，于是招来灾祸。' },
      { start: 161, end: 162, translation: '殷纣把贤者剁成肉酱，殷商宗祀因此不能长久。' },
      { start: 163, end: 164, translation: '商汤、夏禹庄敬谨慎，周人论治也循正道而没有偏差。' },
      { start: 165, end: 166, translation: '他们推举贤才、授予能者，遵循法度而不偏私。' },
      { start: 167, end: 168, translation: '皇天没有偏私，它观察人的德行，再决定帮助谁。' },
      { start: 169, end: 170, translation: '只有圣哲而德行美好的人，才配享有天下。' },
      { start: 171, end: 172, translation: '我向前看又向后看，考察人民判断世事兴亡的准则。' },
      { start: 173, end: 174, translation: '哪有不义之人可以任用？哪有不善之人可以服众？' },
      { start: 175, end: 176, translation: '我虽身临危亡，回看自己的初心，仍然不后悔。' },
      { start: 177, end: 178, translation: '不量好凿孔就硬插木柄，前代贤者因此被剁成肉酱。' },
      { start: 179, end: 180, translation: '我连连叹息、郁结难舒，哀叹自己生不逢时。' },
      { start: 181, end: 182, translation: '我拿起柔嫩的蕙草拭泪，泪水却滚滚沾湿衣襟。' },
      { start: 183, end: 184, translation: '我跪下来展开衣襟陈述心志，心中已经得到中正与光明。' },
    ],
  },
  {
    id: 'heaven-gate',
    title: '八、驾龙上征，叩帝阍',
    subtitle: '上下求索，门却不开',
    overview: '陈辞之后，屈原驾龙乘凤，从苍梧、县圃一路升入天界。他命羲和停车、望舒先驱、飞廉随行，最后来到天帝门前，却遭守门人冷遇，深切感到天上也像人间一样蔽美嫉贤。',
    insight: '壮丽的神话旅程并未带来接纳。天帝门前的受阻，是现实政治失败的神话化重演。',
    memoryGuide: '按路线记：苍梧—县圃—崦嵫—咸池—扶桑—阊阖；按随从记：羲和、望舒、飞廉、鸾皇、雷师、凤鸟。',
    notes: [
      '玉虬、鹥：玉龙、凤凰一类的神鸟神兽，载屈原升天。',
      '苍梧：舜葬之地；县圃：昆仑山上的神境。',
      '羲和：神话中的日御，为太阳驾车。',
      '崦嵫：日落之山；咸池、扶桑、若木：神话中的日出、日落与神木。',
      '望舒、飞廉：月与风的神灵；帝阍：天帝的守门人；阊阖：天门。',
    ],
    units: [
      { start: 185, end: 186, translation: '我驾着玉龙、乘着凤凰，忽然乘着风尘向天上飞行。' },
      { start: 187, end: 188, translation: '清晨从苍梧出发，傍晚就到了昆仑山上的县圃。' },
      { start: 189, end: 190, translation: '本想在天门灵琐稍作停留，太阳却匆匆将要落山。' },
      { start: 191, end: 192, translation: '我命令羲和停鞭缓行，远望崦嵫山，不要那么快迫近日落。' },
      { start: 193, end: 194, translation: '前路漫漫、遥远无尽，我将上天下地寻找答案。' },
      { start: 195, end: 196, translation: '在咸池饮马，把缰绳系在扶桑树上。' },
      { start: 197, end: 198, translation: '折下若木拂拭太阳，暂且自在徘徊。' },
      { start: 199, end: 200, translation: '让望舒在前面引路，让飞廉在后面奔跑跟随。' },
      { start: 201, end: 202, translation: '鸾鸟凤凰为我先行警戒，雷师却说行装还没有准备齐全。' },
      { start: 203, end: 204, translation: '我命令凤鸟振翅飞腾，日夜相继向前。' },
      { start: 205, end: 206, translation: '旋风聚集而来，率领云霓前来迎接。' },
      { start: 207, end: 208, translation: '云霓纷繁离合，色彩斑斓，上下翻飞。' },
      { start: 209, end: 210, translation: '我命令天帝的守门人打开天门，他却倚着天门只是望着我。' },
      { start: 211, end: 212, translation: '天色昏暗将晚，我编结幽兰，久久伫立等待。' },
      { start: 213, end: 214, translation: '世道混浊、善恶不分，总爱遮蔽美好、嫉妒贤能。' },
    ],
  },
  {
    id: 'mifei',
    title: '九、求宓妃',
    subtitle: '美而无礼，仍不可求',
    overview: '天门不开后，屈原转向求女。他渡过白水、登上阆风，派丰隆寻找宓妃，却发现宓妃虽然美丽，却骄傲放纵、缺少礼节，于是主动放弃。',
    insight: '“求女”不是简单爱情叙事，而是政治理想、君臣遇合与精神伴侣的多重象征。仅有外在美而没有礼与德，仍然不是屈原所求。',
    memoryGuide: '记住“见美—求美—发现无礼—弃而改求”的四步。',
    notes: [
      '白水、阆风：神话中的水名与昆仑山名，象征高洁之境。',
      '宓妃：洛水女神，传说为伏羲之女。',
      '丰隆：云神或雷神，屈原令他乘云寻人。',
      '穷石、洧盘：神话地名，写宓妃的生活行踪。',
      '“美而无礼”：全段判断的核心，外在美必须与礼法、德性相配。',
    ],
    units: [
      { start: 215, end: 216, translation: '清晨我将渡过白水，登上阆风山把马系住。' },
      { start: 217, end: 218, translation: '忽然回头流泪，哀伤高丘之上没有理想的美人。' },
      { start: 219, end: 220, translation: '我匆匆游到春宫，折下琼枝来续接佩饰。' },
      { start: 221, end: 222, translation: '趁荣华还没有凋落，观察下方哪位女子可以赠送信物。' },
      { start: 223, end: 224, translation: '我命丰隆驾云，去寻找宓妃所在。' },
      { start: 225, end: 226, translation: '解下佩带作信物以表达心意，又命謇修担任媒人。' },
      { start: 227, end: 228, translation: '宓妃忽离忽合、态度不定，忽然又乖戾难以迁就。' },
      { start: 229, end: 230, translation: '她傍晚回到穷石住宿，清晨在洧盘洗发。' },
      { start: 231, end: 232, translation: '她倚仗美貌而骄傲，日日纵情游乐。' },
      { start: 233, end: 234, translation: '她虽然确实美丽，却没有礼节，我只好离开她另作追求。' },
      { start: 235, end: 236, translation: '我遍观四方极远之地，周游天上后再回到人间。' },
    ],
  },
  {
    id: 'two-beauties',
    title: '十、求有娀佚女与二姚',
    subtitle: '媒弱路远，贤美难遇',
    overview: '屈原继续求女：先望见瑶台上有娀氏的美女，却因媒人不良、自己犹豫而错过；又想赶在少康成家前求有虞二姚，却担心媒人拙弱、言词不牢。',
    insight: '这里层层写“理想可望而难即”：不是没有美善，而是缺少可信的媒介与清明的政治通道。',
    memoryGuide: '用“见—媒—疑—失”重复两次：有娀佚女、有虞二姚。',
    notes: [
      '瑶台：华美高台；有娀：古代部族，传说简狄出自有娀。',
      '鸩：毒鸟，屈原用它作媒，暗示媒介不良。',
      '高辛：帝喾，传说与简狄婚姻有关。',
      '少康：夏代中兴之主；二姚：有虞氏两位女子。',
    ],
    units: [
      { start: 237, end: 238, translation: '远望瑶台高耸，看见有娀氏那位美丽的女子。' },
      { start: 239, end: 240, translation: '我让鸩鸟去做媒，鸩鸟却说那女子不好。' },
      { start: 241, end: 242, translation: '雄鸠鸣叫着飞去，我又嫌它轻佻巧言、不可信。' },
      { start: 243, end: 244, translation: '心中犹豫而狐疑，想亲自前往又不合礼法。' },
      { start: 245, end: 246, translation: '凤凰已经接受了委托，我又怕高辛抢先一步。' },
      { start: 247, end: 248, translation: '想远居却没有可停之处，只好暂且漂泊逍遥。' },
      { start: 249, end: 250, translation: '趁少康还没有成家，有虞氏两位姚姓女子仍在等待。' },
      { start: 251, end: 252, translation: '可媒人拙弱，我担心传来的话不够可靠。' },
      { start: 253, end: 254, translation: '世道混浊、嫉妒贤才，总爱遮蔽美好、称扬丑恶。' },
      { start: 255, end: 256, translation: '女子的居处既深又远，明智的君王却仍不醒悟。' },
      { start: 257, end: 258, translation: '我怀着满腔真情却不能表达，怎能忍受到永远？' },
    ],
  },
  {
    id: 'lingfen',
    title: '十一、灵氛占卜',
    subtitle: '九州博大，何必怀恋故宇',
    overview: '屈原取琼茅和竹片占卜，灵氛劝他远行：天下如此广大，哪里没有芳草与美善？留在昏暗的故国只会埋没自己。',
    insight: '灵氛的话代表“离开”的理性方案。屈原心里知道它有理，却仍然犹豫，为后文“远游却不忍离乡”埋下张力。',
    memoryGuide: '抓住反复句：“何所独无芳草兮，尔何怀乎故宇？”这是全段记忆枢纽。',
    notes: [
      '琼茅、筳篿：占卜用的香草与竹片。',
      '灵氛：占卜的神巫，名字有灵气、气息之意。',
      '两美必合：真正美好的事物终究会彼此遇合。',
      '故宇：旧居与故国，也可引申为旧有价值与归属。',
    ],
    units: [
      { start: 259, end: 260, translation: '我取来琼茅和竹片占卜，命灵氛为我推断吉凶。' },
      { start: 261, end: 263, translation: '灵氛说：两种美一定会相合，谁真正修洁美好却无人爱慕？' },
      { start: 264, end: 266, translation: '想想九州如此广大，难道只有这里才有美好的女子？' },
      { start: 267, end: 269, translation: '灵氛又说：勉力远行，不要再狐疑，谁会追求美善却把你舍弃？' },
      { start: 270, end: 272, translation: '哪里没有芳草？你为什么偏要怀恋旧居故国？' },
      { start: 273, end: 274, translation: '世道幽暗迷乱，谁能分辨我的善恶？' },
      { start: 275, end: 276, translation: '人们的好恶本来就各不相同，党人尤其怪僻反常。' },
      { start: 277, end: 278, translation: '他们家家户户挂满艾草，反说幽兰不可佩。' },
      { start: 279, end: 280, translation: '连草木都分辨不清，又怎能正确评价美玉？' },
      { start: 281, end: 282, translation: '他们拿粪土填满香囊，反说申椒不香。' },
      { start: 283, end: 284, translation: '我想听从灵氛的吉占，心里却仍然犹豫狐疑。' },
    ],
  },
  {
    id: 'wuxian',
    title: '十二、巫咸降神与贤者遇合',
    subtitle: '只要好修，终会遇合',
    overview: '巫咸在傍晚降临，百神与九疑山神一同迎接。他劝屈原继续上下求索，并举伊尹、皋陶、傅说、吕望、宁戚为例，说明真正有才德的人终会遇到明主。',
    insight: '灵氛强调“离开”，巫咸强调“求合”。两者都把希望放在未来与别处，但屈原仍未真正放下故国。',
    memoryGuide: '先记巫咸降临，再记五组贤者遇合：汤禹与伊尹皋陶、傅说与武丁、吕望与周文、宁戚与齐桓。',
    notes: [
      '巫咸：古代神巫，这里作为降神者。',
      '椒糈：以香椒和精米迎神。',
      '九疑：九疑山，传说舜葬于此。',
      '傅说：殷商贤相，曾在傅岩筑墙，后被武丁举用。',
      '吕望：姜太公，曾屠牛，后遇周文王；宁戚：曾讴歌，被齐桓公赏识。',
    ],
    units: [
      { start: 285, end: 286, translation: '巫咸将在傍晚降临，我带着香椒精米去迎接他。' },
      { start: 287, end: 288, translation: '百神遮天蔽日般一同降临，九疑山的神灵纷纷迎接。' },
      { start: 289, end: 290, translation: '皇天顯出光耀，巫咸告诉我吉祥的缘由。' },
      { start: 291, end: 293, translation: '巫咸说：勉力上下求索，寻找与自己法度相合的人。' },
      { start: 294, end: 295, translation: '商汤、夏禹庄敬求合，伊尹、皋陶能够调和辅佐。' },
      { start: 296, end: 297, translation: '只要内心真正爱好修洁，又何必依靠媒人？' },
      { start: 298, end: 299, translation: '傅说在傅岩筑墙，武丁任用他而毫不迟疑。' },
      { start: 300, end: 301, translation: '吕望曾经屠牛，遇到周文王后得到举用。' },
      { start: 302, end: 303, translation: '宁戚击牛角讴歌，齐桓公听见后便任他为辅佐。' },
      { start: 304, end: 305, translation: '趁年岁还没有太晚，时机也还没有完全过去。' },
      { start: 306, end: 307, translation: '只怕鹈鴂先鸣，使百草都失去芬芳。' },
      { start: 308, end: 309, translation: '为什么美好的琼佩如此高洁，众人却纷纷遮蔽它？' },
    ],
  },
  {
    id: 'fragrance-fades',
    title: '十三、芳草变衰，守佩不渝',
    subtitle: '兰芷失香，唯此佩可贵',
    overview: '屈原看到昔日香草变为萧艾，痛心众人因追逐名利而放弃修养。即使整个世界随波逐流，他仍珍视自己的琼佩，相信真正的芳香难以亏损。',
    insight: '这一段把“人才变质”写到极点：连兰、椒都不可靠。愈是众人变化，屈原愈要保存自己的佩与芳。',
    memoryGuide: '抓住香草反转：兰芷—萧艾、荃蕙—茅、椒—专佞、樧—充佩；最后回到“此佩可贵”。',
    notes: [
      '萧艾：艾蒿一类有气味的草，在楚辞中常与香草相对，象征污浊或变质。',
      '揭车、江离：前文种过的芳草，此处也被拿来反衬普遍堕落。',
      '琼佩：美玉制成的佩饰，象征屈原不可磨灭的人格与理想。',
      '芳菲菲：香气浓郁的样子；沬：消散、终止。',
    ],
    units: [
      { start: 310, end: 311, translation: '党人不讲信义，我担心他们嫉妒而折断我的佩饰。' },
      { start: 312, end: 313, translation: '时势纷乱变化，又怎能长久停留？' },
      { start: 314, end: 315, translation: '兰芷失去芳香，荃蕙也变成了茅草。' },
      { start: 316, end: 317, translation: '为什么昔日的芳草，如今竟成了萧艾？' },
      { start: 318, end: 319, translation: '难道还有别的原因？只是他们不再爱好修养罢了。' },
      { start: 320, end: 321, translation: '我原以为兰可以依靠，谁知它没有实质，只徒有外表。' },
      { start: 322, end: 323, translation: '它舍弃自己的美质去随从世俗，只想列身众芳。' },
      { start: 324, end: 325, translation: '椒变得专横谄媚、傲慢放荡，樧也想填充佩帏。' },
      { start: 326, end: 327, translation: '它们钻营求进、务求入仕，又怎能守住芳香？' },
      { start: 328, end: 329, translation: '时俗本来就随之流变，谁还能保持不变？' },
      { start: 330, end: 331, translation: '看椒和兰都已如此，更何况揭车与江离？' },
      { start: 332, end: 333, translation: '只有这佩饰真正可贵，我宁可舍弃外在美饰而保留它经历艰险。' },
      { start: 334, end: 335, translation: '它香气浓郁难以亏损，芬芳至今仍未消散。' },
      { start: 336, end: 337, translation: '我调和佩玉的节奏以自娱，暂且漂游四方寻找理想。' },
      { start: 338, end: 339, translation: '趁我的佩饰正当盛美，周游天地上下观察。' },
    ],
  },
  {
    id: 'journey',
    title: '十四、远逝西行',
    subtitle: '驾八龙，载云旗，心仍向故乡',
    overview: '灵氛已经给出吉占，屈原选择吉日远行：以琼枝为肴、琼屑为粮，驾飞龙、乘瑶车，经昆仑、流沙、赤水、不周，向西海进发。',
    insight: '这是全篇最壮阔的远征，也是屈原对现实政治的最后一次精神突围。旅行的目标不是游乐，而是离开不义之地、保存理想。',
    memoryGuide: '按方位与行进顺序记忆：昆仑—天津—西极—流沙—赤水—不周—西海。',
    notes: [
      '琼爢：玉屑，想象中神人食物。',
      '瑶象：美玉和象牙装饰的车马。',
      '天津：天河；西极：西方极远之地。',
      '流沙、赤水、不周：神话地理中的艰难境界。',
      '八龙、云旗：盛大而庄严的远游仪仗。',
    ],
    units: [
      { start: 340, end: 341, translation: '灵氛已把吉祥的占辞告诉我，我便选定吉日准备远行。' },
      { start: 342, end: 343, translation: '折琼枝作为佳肴，把美玉碾成细屑作为干粮。' },
      { start: 344, end: 345, translation: '为我驾起飞龙，又用美玉象牙装饰车辆。' },
      { start: 346, end: 347, translation: '心意背离的人怎能勉强同处？我将远行以疏远世俗。' },
      { start: 348, end: 349, translation: '我转道昆仑，路途遥远，要周游四方。' },
      { start: 350, end: 351, translation: '扬起云霓遮蔽日光，玉鸾鸣响，声音啾啾。' },
      { start: 352, end: 353, translation: '清晨从天河出发，傍晚到达西方极远之地。' },
      { start: 354, end: 355, translation: '凤凰展翼承托旗帜，高高飞翔，庄重而有节奏。' },
      { start: 356, end: 357, translation: '我匆匆经过流沙，沿着赤水从容前行。' },
      { start: 358, end: 359, translation: '指挥蛟龙在渡口架桥，命西皇帮助我渡水。' },
      { start: 360, end: 361, translation: '道路遥远而艰难，我让众车先行，在路旁等待。' },
      { start: 362, end: 363, translation: '绕过不周山向左转，以西海作为目的地。' },
      { start: 364, end: 365, translation: '聚集千辆车辆，玉饰车轴并排奔驰。' },
      { start: 366, end: 367, translation: '驾着八条婉转的飞龙，车上云旗绵延飘动。' },
      { start: 368, end: 369, translation: '我抑制心志、停下节拍，神思却向高远之处飞驰。' },
      { start: 370, end: 371, translation: '奏起《九歌》、舞起《韶》乐，暂且借这假日偷得欢乐。' },
    ],
  },
  {
    id: 'finale',
    title: '十五、乱辞：临睨旧乡',
    subtitle: '国无人莫我知，从彭咸所居',
    overview: '当屈原升到光明极高的地方，忽然看见故乡，仆夫悲伤、马也回头蜷伏，不肯再走。最终的“乱辞”承认无人理解自己，也无人能与他实现美政，他选择追随彭咸。',
    insight: '全篇最大的力量在最后“忽临睨夫旧乡”：他明明已经远游成功，却仍无法斩断故国之爱。理想与故土、清醒与孤独在此汇合。',
    memoryGuide: '最后五组要背到能独立复述：升天—见乡—人马悲—乱曰—从彭咸。',
    notes: [
      '乱曰：古代乐章或辞赋结尾的总结段落。',
      '旧乡：故乡与故国，也是屈原无法割舍的政治与情感根源。',
      '莫我知：没有人理解我；不是撒娇，而是政治理想无人共鸣的孤独判断。',
      '美政：屈原心中的清明政治与贤能政治。',
      '彭咸：屈原反复称举的古代贤者，结尾“从彭咸之所居”表达以死守志的决绝。',
    ],
    units: [
      { start: 372, end: 373, translation: '我升到光辉灿烂的高处，忽然向下望见了故乡。' },
      { start: 374, end: 375, translation: '仆夫悲伤，马也怀念故土，蜷伏回头，不肯再前行。' },
      { start: 376, end: 377, translation: '尾声说：算了吧！' },
      { start: 378, end: 379, translation: '国中没有人了解我，我又何必怀念故都？' },
      { start: 380, end: 381, translation: '既然没有人能与我实现美政，我将追随彭咸所在的地方。' },
    ],
  },
];

function buildSection(spec: SectionSpec, index: number): LisaoSection {
  return {
    id: spec.id,
    number: index + 1,
    title: spec.title,
    subtitle: spec.subtitle,
    overview: spec.overview,
    insight: spec.insight,
    memoryGuide: spec.memoryGuide,
    notes: spec.notes,
    units: spec.units.map((unit, unitIndex) => {
      const lines = LISAO_RECITATION_LINES.slice(unit.start, unit.end + 1);
      return {
        id: `${spec.id}-${unitIndex + 1}`,
        sectionId: spec.id,
        startLine: unit.start,
        endLine: unit.end,
        lines,
        text: lines.filter((line) => line !== '」').join(''),
        translation: unit.translation,
      };
    }),
  };
}

export const LISAO_SECTIONS: LisaoSection[] = SPECS.map(buildSection);
export const LISAO_UNITS: LisaoUnit[] = LISAO_SECTIONS.flatMap((section) => section.units);

let expectedLine = 0;
for (const section of LISAO_SECTIONS) {
  for (const unit of section.units) {
    if (unit.startLine !== expectedLine) {
      throw new Error(`离骚章节不连续：期望第 ${expectedLine} 行，实际从第 ${unit.startLine} 行开始`);
    }
    if (unit.endLine < unit.startLine) throw new Error(`离骚单元范围无效：${unit.id}`);
    expectedLine = unit.endLine + 1;
  }
}
if (expectedLine !== LISAO_RECITATION_LINES.length) {
  throw new Error(`离骚章节未覆盖全文：已覆盖 ${expectedLine}/${LISAO_RECITATION_LINES.length} 行`);
}
