import assert from 'node:assert/strict';
import {
  findCharacterContext,
  getTermContext,
  getUnitGlossary,
  isHanCharacter,
} from '../src/data/characterDictionary';
import { LISAO_SECTIONS, LISAO_UNITS } from '../src/data/lisaoCurriculum';
import { buildTodayPlan, contextForUnit, insertRetry, sectionForUnit } from '../src/services/plan';
import type { AppProgress } from '../src/services/progress';

const now = new Date('2026-10-30T08:00:00+08:00');
const initial = createProgress();
const today = buildTodayPlan(initial, new Date('2026-10-30T08:00:00+08:00'));

assert.equal(today.due.length, 0, '新档案不应有到期复习');
assert.equal(today.fresh.length, 8, '每日新学数量应遵守设置');
assert.deepEqual(
  today.queue.map((unit) => unit.startLine),
  [...today.queue.map((unit) => unit.startLine)].sort((left, right) => left - right),
  '今日队列应按原文顺序排列',
);
assert.deepEqual(
  today.queue.map((unit) => unit.id),
  LISAO_UNITS.slice(0, 8).map((unit) => unit.id),
  '新档案应从前 8 个连续句对开始',
);

const continuing = createProgress();
for (const unit of LISAO_UNITS.slice(0, 4)) {
  continuing.cards[unit.id] = {
    card: {
      due: '2026-11-30T08:00:00+08:00',
      stability: 4,
      difficulty: 5,
      elapsed_days: 1,
      scheduled_days: 2,
      learning_steps: 0,
      reps: 2,
      lapses: 0,
      state: 2,
      last_review: '2026-10-29T08:00:00+08:00',
    },
    lastRating: 'good',
    lastReviewedAt: '2026-10-29T08:00:00+08:00',
  };
}
const continuingPlan = buildTodayPlan(continuing, now);
assert.deepEqual(
  continuingPlan.fresh.map((unit) => unit.id),
  LISAO_UNITS.slice(4, 12).map((unit) => unit.id),
  '新学内容应紧接已学位置，不跳回开头',
);
for (let freshIndex = 1; freshIndex < continuingPlan.fresh.length; freshIndex += 1) {
  assert.equal(
    continuingPlan.fresh[freshIndex].startLine,
    continuingPlan.fresh[freshIndex - 1].endLine + 1,
    '新学队列必须保持连续',
  );
}
assert.deepEqual(
  continuingPlan.queue.map((unit) => unit.id),
  continuingPlan.fresh.map((unit) => unit.id),
  '没有到期内容时，今日队列应按连续新学顺序排列',
);

const lateStart = createProgress();
const lateStartIndex = LISAO_UNITS.findIndex((unit) => unit.sectionId === 'heaven-gate') + 2;
for (const unit of LISAO_UNITS.slice(lateStartIndex - 3, lateStartIndex + 1)) {
  const reviewedAt = new Date(
    Date.parse('2026-10-29T00:00:00+08:00') + LISAO_UNITS.indexOf(unit) * 60000,
  ).toISOString();
  lateStart.cards[unit.id] = {
    card: {
      due: '2026-11-30T08:00:00+08:00',
      stability: 4,
      difficulty: 5,
      elapsed_days: 1,
      scheduled_days: 2,
      learning_steps: 0,
      reps: 2,
      lapses: 0,
      state: 2,
      last_review: reviewedAt,
    },
    lastRating: 'good',
    lastReviewedAt: reviewedAt,
  };
}
const latePlan = buildTodayPlan(lateStart, now);
assert.deepEqual(
  latePlan.fresh.map((unit) => unit.id),
  LISAO_UNITS.slice(lateStartIndex + 1, lateStartIndex + 9).map((unit) => unit.id),
  '从后段开始学习后，下一次新学必须接着后段，不能跳回开头',
);

const earlierReview = structuredClone(lateStart);
earlierReview.cards[LISAO_UNITS[2].id] = {
  ...earlierReview.cards[LISAO_UNITS[lateStartIndex].id],
  lastReviewedAt: '2026-10-30T07:55:00+08:00',
};
const earlierReviewPlan = buildTodayPlan(earlierReview, now);
assert.deepEqual(
  earlierReviewPlan.fresh.map((unit) => unit.id),
  latePlan.fresh.map((unit) => unit.id),
  '复习前面的旧内容不能把新学位置拉回开头',
);

let reviewed = createProgress();
for (let index = LISAO_UNITS.length - 1; index >= 0; index -= 7) {
  reviewed.cards[LISAO_UNITS[index].id] = {
    card: {
      due: '2026-10-20T08:05:00+08:00',
      stability: 1,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 1,
      reps: 1,
      lapses: 0,
      state: 1,
      last_review: '2026-10-20T08:00:00+08:00',
    },
    lastRating: 'good',
    lastReviewedAt: '2026-10-20T08:00:00+08:00',
  };
}
const duePlan = buildTodayPlan(reviewed, now);
assert.ok(duePlan.due.length > 2, '复习排程测试样本不足');
assert.ok(duePlan.due.every((unit) => duePlan.queue.some((queued) => queued.id === unit.id)), '到期内容不能被新学目标挤掉');
assert.deepEqual(
  duePlan.queue.slice(0, duePlan.due.length).map((unit) => unit.id),
  duePlan.due.map((unit) => unit.id),
  '到期复习应集中在前，不能和新学内容穿插',
);
for (let dueIndex = 1; dueIndex < duePlan.due.length; dueIndex += 1) {
  assert.ok(
    duePlan.due[dueIndex - 1].startLine < duePlan.due[dueIndex].startLine,
    '到期复习应按原文顺序排列，避免跨段跳背',
  );
}

for (const [index, unit] of LISAO_UNITS.entries()) {
  const context = contextForUnit(unit);
  assert.ok(sectionForUnit(unit), `${unit.id} 缺少所属章节`);
  if (index > 0) {
    assert.equal(context.previous?.endLine, unit.startLine - 1, `${unit.id} 的上文没有接上`);
  }
  assert.equal('next' in context, false, `${unit.id} 的背诵上下文不能提前暴露后文`);
}

const crossSectionUnit = LISAO_UNITS.find((unit) => unit.startLine === LISAO_SECTIONS[0].units.at(-1)!.endLine + 1);
assert.ok(crossSectionUnit, '找不到章节边界');
assert.notEqual(
  contextForUnit(crossSectionUnit!).previous?.sectionId,
  crossSectionUnit!.sectionId,
  '章节边界不能截断上文',
);

const retryQueue = insertRetry(LISAO_UNITS.slice(0, 5), 0, LISAO_UNITS[0], 1);
assert.deepEqual(
  retryQueue.map((unit) => unit.id),
  [LISAO_UNITS[0].id, LISAO_UNITS[1].id, LISAO_UNITS[0].id, LISAO_UNITS[2].id, LISAO_UNITS[3].id, LISAO_UNITS[4].id],
  '不会的句对应隔一组回炉，不能排到整轮最后',
);
assert.deepEqual(
  insertRetry(LISAO_UNITS.slice(0, 2), 0, LISAO_UNITS[0], 2).map((unit) => unit.id),
  [LISAO_UNITS[0].id, LISAO_UNITS[1].id, LISAO_UNITS[0].id],
  '要提示的句对间隔不足时应排到本轮末尾',
);
assert.equal(LISAO_UNITS[0].id, retryQueue[0].id, '插入回炉不能会改变原队列本身');

for (const section of LISAO_SECTIONS) {
  assert.ok(
    section.units.some((unit) => getUnitGlossary(unit).some((term) => term.surface.length > 1)),
    `${section.title} 没有可整词点选的重点词`,
  );
}

for (const unit of LISAO_UNITS) {
  for (const term of getUnitGlossary(unit)) {
    assert.equal(getTermContext(term.surface, unit)?.surface, term.surface, `${unit.id} 的整词匹配失效`);
    assert.equal(
      getTermContext([...term.surface][0], unit),
      undefined,
      `${unit.id} 的单字不能误用整词语境义`,
    );
  }
}

let characterOccurrences = 0;
for (const unit of LISAO_UNITS) {
  for (const character of [...unit.text].filter(isHanCharacter)) {
    characterOccurrences += 1;
    const context = findCharacterContext(character, unit);
    assert.ok(context.meaningInContext.trim(), `${unit.id} 的“${character}”缺少本句字义`);
    assert.doesNotMatch(
      context.meaningInContext,
      /按“[。；，、]”理解|此字需要结合整句结构/,
      `${unit.id} 的“${character}”没有有效本句字义`,
    );
  }
}

const contextCase = (unitId: string, character: string) => {
  const unit = LISAO_UNITS.find((candidate) => candidate.id === unitId);
  assert.ok(unit, `找不到字义检查单元 ${unitId}`);
  return findCharacterContext(character, unit!).meaningInContext;
};

assert.match(contextCase('origin-1', '朕'), /我/);
assert.match(contextCase('origin-6', '离'), /香草/);
assert.match(contextCase('origin-7', '与'), /等待/);
assert.match(contextCase('origin-7', '岁'), /岁月/);
assert.match(contextCase('three-kings-3', '舜'), /虞舜/);
assert.match(contextCase('three-kings-4', '桀'), /夏桀/);
assert.match(contextCase('nine-deaths-6', '淫'), /淫邪|放纵/);
assert.notEqual(contextCase('origin-6', '与'), contextCase('origin-7', '与'));

console.log(JSON.stringify({
  dailyFresh: today.fresh.length,
  queueOrder: '原典顺序',
  contextWindows: `${LISAO_UNITS.length} 个句对（只露上文，不剧透后文）`,
  characterContexts: `${characterOccurrences}/${characterOccurrences} 个单字均有本句取义`,
  sectionGlossaryCoverage: `${LISAO_SECTIONS.length}/${LISAO_SECTIONS.length}`,
}, null, 2));

function createProgress(): AppProgress {
  return {
    version: 1,
    cards: {},
    history: [],
    dailyTarget: 8,
    createdAt: '2026-10-01T08:00:00+08:00',
    updatedAt: '2026-10-01T08:00:00+08:00',
  };
}
