import type { WorkTag } from '@/types';

const img = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export type JournalBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string };

export interface JournalPost {
  /** URL 友好的英文 slug，作为 /journal/:id 参数 */
  id: string;
  date: string;
  title: string;
  excerpt: string;
  tag: WorkTag;
  coverUrl: string;
  /** 对应 photographers 数据中的作者 id */
  authorId: number;
  readMinutes: number;
  blocks: JournalBlock[];
}

export const journalPosts: JournalPost[] = [
  {
    id: 'sahara-sunset',
    date: '2026年5月20日',
    title: '在撒哈拉等待一场日落',
    excerpt: '光线从金黄渐入深红，只用了不到十分钟。等待，是风光摄影最重要的功课。',
    tag: 'travel',
    coverUrl: img('1509316785289-025f5b846b35', 1200, 675),
    authorId: 1,
    readMinutes: 4,
    blocks: [
      {
        type: 'paragraph',
        text: '吉普车在沙地上留下最后一道辙印时，我已经在沙丘背风面蹲了四十分钟。风把细沙吹进领口，相机镜头上蒙了一层薄薄的土黄——这是撒哈拉给每个拍摄者的见面礼。',
      },
      {
        type: 'paragraph',
        text: '日落前一小时的光线还很硬，沙脊的阴影锐利得像刀刻。我没有急着按快门，而是反复在几座沙丘之间走动，确认太阳落下的方位，以及哪一条曲线能把视线引向光的方向。',
      },
      {
        type: 'quote',
        text: '在风光摄影里，按下快门只占百分之一的时间，其余百分之九十九，都在等。',
      },
      {
        type: 'paragraph',
        text: '变化是从太阳贴近地平线开始的。沙面先泛起金色，接着是橙红，最后沉入一种近乎紫的深红。整个过程不到十分钟，我几乎屏住呼吸，每隔几秒拍一张——不是为了挑出最好的，而是因为每一瞬的颜色都不会再来。',
      },
      {
        type: 'image',
        src: img('1500534314209-a25ddb2bd429', 1200, 800),
        alt: '暮色中的梯田曲线',
        caption: '同样的低角度光线，落在不同的地貌上会讲出完全不同的故事',
      },
      {
        type: 'heading',
        text: '设备与参数',
      },
      {
        type: 'paragraph',
        text: '那天用的是 24-70mm，大部分片子落在 35mm 附近。光圈收到 f/11 保证沙脊从前到后都清晰，ISO 压到 100，快门速度随着光线衰减从 1/250 一路降到 1/30。三脚架是必须的，风大时我会在中轴挂钩上挂摄影包增加稳定性。',
      },
      {
        type: 'paragraph',
        text: '回程的路上天已经全黑，车头灯照亮飞舞的沙粒。我翻看相机里的照片，知道真正满意的也许只有两三张——但为了那两三张，再等四十分钟，值。',
      },
    ],
  },
  {
    id: 'minimal-architecture',
    date: '2026年5月5日',
    title: '极简建筑的构成练习',
    excerpt: '少即是多。当画面里只剩线条与色块，构图反而变得清晰而有力。',
    tag: 'architecture',
    coverUrl: img('1486325212027-8081e485255e', 1200, 900),
    authorId: 5,
    readMinutes: 3,
    blocks: [
      {
        type: 'paragraph',
        text: 'CBD 的玻璃幕墙在正午是一场灾难——反光杂乱、阴影死黑。但走进建筑内部，或者等到阴天，线条反而安静下来。极简建筑摄影的第一课，是学会躲开"太多"。',
      },
      {
        type: 'paragraph',
        text: '我通常只带一支定焦头。变焦会纵容懒惰，而定焦逼你用脚步去找构图：前进两步，一根立柱刚好挡住杂乱的出口；后退半步，天花的斜线恰好与地面平行。',
      },
      {
        type: 'quote',
        text: '极简不是画面里东西少，而是每一个留下的元素都不可替代。',
      },
      {
        type: 'image',
        src: img('1487958449943-2429e8be8625', 1200, 900),
        alt: '现代建筑的线条与光影',
        caption: '阴天的散射光让明暗过渡均匀，是拍摄建筑线条的理想光线',
      },
      {
        type: 'paragraph',
        text: '后期我几乎不做加法，只做减法：压掉分散注意力的高光，把白平衡统一到冷调，然后裁掉所有不服务于主结构的部分。判断一张极简作品是否成立，标准很简单——遮住画面里任意一块，如果结构依然成立，那它就不该出现在画面里。',
      },
    ],
  },
  {
    id: 'portra-400-daily',
    date: '2026年4月30日',
    title: '一卷 Portra 400 的日常',
    excerpt: '胶片教会我慢下来。每一次快门都更谨慎，也更有分量。',
    tag: 'still',
    coverUrl: img('1495562569060-2eec283d3391', 1200, 800),
    authorId: 3,
    readMinutes: 4,
    blocks: [
      {
        type: 'paragraph',
        text: '三十六张，是一卷 Portra 400 的全部预算。没有回放，没有连拍，按下快门之后你能做的只有相信它，然后等——等冲洗，等扫描，等一个未知的结果。',
      },
      {
        type: 'paragraph',
        text: '这卷胶片在我的包里放了两个月。我用它拍窗台上的杯子、清晨的面包、雨后积水里的霓虹灯。都是些不值得用数码去拍的东西，但在胶片上，它们突然有了重量。',
      },
      {
        type: 'quote',
        text: '数码记录的是瞬间，胶片记录的是等待本身。',
      },
      {
        type: 'image',
        src: img('1495474472287-4d71bcdd2085', 1200, 900),
        alt: '咖啡馆的清晨桌面',
        caption: '胶片对暖色调的宽容度，让咖啡馆的光线自带一层温柔',
      },
      {
        type: 'paragraph',
        text: 'Portra 400 的高光过渡是它最迷人的部分：窗口逆光的玻璃杯边缘不会死白，而是一层奶油般的渐变。代价是它不喜欢荧光灯，也不喜欢仓促——欠曝三分之一档，往往刚刚好。',
      },
      {
        type: 'paragraph',
        text: '扫描件到手那天是个普通的周三晚上。三十六张里有七张脱焦，三张进了光指，剩下的二十六张，我看得很慢。那两个月的日子，突然又回来了。',
      },
    ],
  },
  {
    id: 'street-warmth',
    date: '2026年4月15日',
    title: '街拍的温度在于人',
    excerpt: '地铁、街角、咖啡馆——最动人的画面，往往藏在最平凡的瞬间里。',
    tag: 'street',
    coverUrl: img('1519501025264-65ba15a82390', 1200, 760),
    authorId: 2,
    readMinutes: 3,
    blocks: [
      {
        type: 'paragraph',
        text: '很多人问我街拍用什么器材，我的答案总是同一个：你愿意随身带三个月的那台。我的是一台老旧的 35mm 定焦小机器，挂在手腕上，像长在身上一样。',
      },
      {
        type: 'paragraph',
        text: '街拍不是伏击。我习惯在一个有意思的路口停下来，买杯咖啡，让自己变成街景的一部分。当人们习惯你的存在，戒备消失，真正的画面才开始出现：接孩子放学的母亲、对着玻璃整理头发的店员、在长椅上打盹的老人。',
      },
      {
        type: 'quote',
        text: '城市不会为镜头表演，你要做的只是在场，并且足够有耐心。',
      },
      {
        type: 'image',
        src: img('1480714378408-67cf0d13bc1b', 1200, 760),
        alt: '入夜后的城市街角',
        caption: '蓝调时刻的二十分钟，是街拍一天中光线最公平的窗口',
      },
      {
        type: 'paragraph',
        text: '我不拍窘迫，也不拍正面冲突。镜头是一种权力，街拍摄影师得想清楚自己站在哪一边。我想记录的是一个人在巨大城市里保持体面的瞬间——那些光打在脸上、表情松弛的半秒钟。',
      },
    ],
  },
  {
    id: 'blackwhite-portrait',
    date: '2026年3月10日',
    title: '黑白人像的光影逻辑',
    excerpt: '去掉色彩之后，光影的层次就成了唯一的语言。',
    tag: 'blackwhite',
    coverUrl: img('1507003211169-0a1dd7228f2d', 1200, 900),
    authorId: 3,
    readMinutes: 4,
    blocks: [
      {
        type: 'paragraph',
        text: '决定一张人像转黑白之后是否成立，在按下快门之前就完成了。口红的颜色、衣服的花纹——这些在彩色画面里吸引眼球的东西，在黑白里全部失效。剩下的只有骨相、肤质，以及光落在五官上的方式。',
      },
      {
        type: 'paragraph',
        text: '我常用的是侧前方四十五度的柔光。光位再高一点，颧骨下方的阴影会拉长年龄；再平一点，脸又会失去结构。让模特微微转向光源，下颌线立刻清晰，这比任何后期重塑都自然。',
      },
      {
        type: 'quote',
        text: '彩色摄影拍的是衣服，黑白摄影拍的是骨头。',
      },
      {
        type: 'image',
        src: img('1534528741775-53994a69daeb', 1200, 900),
        alt: '侧逆光中的人像轮廓',
        caption: '轮廓光把人物从深色背景里分离出来，是黑白人像最常用的层次手段',
      },
      {
        type: 'heading',
        text: '后期的克制',
      },
      {
        type: 'paragraph',
        text: '转黑白不是简单去色。我会分别压暗暗部的蓝、提亮肤色的橙，让皮肤和背景产生灰度差；眼睛里的反光点永远保留——那是一张肖像的呼吸孔。磨皮反而要少，毛孔和细纹承载着人物的经历，磨掉它们，照片就空了。',
      },
    ],
  },
  {
    id: 'chasing-aurora',
    date: '2026年2月28日',
    title: '追一场极光的夜',
    excerpt: '零下十五度的夜晚，绿色的光带在头顶缓缓展开，那一刻一切都值得。',
    tag: 'nature',
    coverUrl: img('1531366936337-7c912a4589a7', 1200, 800),
    authorId: 4,
    readMinutes: 5,
    blocks: [
      {
        type: 'paragraph',
        text: '极光预报 App 显示 KP 指数跳到 5 的时候，我在一小时内收好了三脚架、三块满电的电池和所有能套上的衣物。追极光这件事，计划只能做到一半，另一半交给天气、云量，和纯粹的运气。',
      },
      {
        type: 'paragraph',
        text: '凌晨两点，我们在湖边关掉了车头灯。眼睛适应黑暗的十分钟里，天空只是一条灰白色的雾带。然后有人低声喊了一句——那条雾开始动了，像被风吹起的丝绸，淡绿从边缘洇开，渐渐爬满整片天空。',
      },
      {
        type: 'quote',
        text: '极光不出现的时候，世界是黑白色的；它出现的那一刻，整个夜空开始呼吸。',
      },
      {
        type: 'image',
        src: img('1448375240586-882707db888b', 1200, 900),
        alt: '冬夜的森林与雪地',
        caption: '没有极光的冬夜也值得拍：雪地的反光让森林拥有第二种轮廓',
      },
      {
        type: 'heading',
        text: '参数笔记',
      },
      {
        type: 'paragraph',
        text: '极光拍摄最大的误区是长曝光。三十秒确实能拍出绿色，但光带的动态会糊成一片。我的起点是 8 秒、f/2.8、ISO 3200，极光活跃时压到 2-4 秒、ISO 1600，保住光带边缘的结构。电池在低温下掉电极快，三块电池我轮换着揣在内层口袋里保温。',
      },
      {
        type: 'paragraph',
        text: '收器材的时候手指已经冻得没有知觉。但抬头看最后一眼，绿色的光正倒映在结了薄冰的湖面上——上下两层光幕把人夹在中间，像站在宇宙的门缝里。',
      },
    ],
  },
];

export function getJournalPost(id: string | undefined): JournalPost | undefined {
  if (!id) return undefined;
  return journalPosts.find((post) => post.id === id);
}
