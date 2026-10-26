import assert from 'node:assert/strict';
import { getCharacterReadings, isHanCharacter } from '../src/data/characterDictionary';
import { LISAO_INTRODUCTION, LISAO_SECTION_GUIDES } from '../src/data/lisaoGuide';
import { LISAO_LINES } from '../src/data/lisao';
import { LISAO_RECITATION_LINES, LISAO_SECTIONS, LISAO_UNITS } from '../src/data/lisaoCurriculum';

assert.equal(LISAO_LINES.length, 189, '《离骚》原始文本应为 189 个句行');
assert.equal(LISAO_RECITATION_LINES.length, 382, '《离骚》背诵文本应为 382 个分句');
assert.equal(LISAO_SECTIONS.length, 15, '《离骚》应分为 15 个学习章节');
assert.equal(LISAO_UNITS.length, 188, '全文应整理为 188 个背诵单元');

let expectedLine = 0;
for (const section of LISAO_SECTIONS) {
  assert.ok(section.overview.trim(), `${section.title} 缺少章节概览`);
  assert.ok(section.insight.trim(), `${section.title} 缺少理解提示`);
  assert.ok(section.memoryGuide.trim(), `${section.title} 缺少背诵线索`);
  assert.ok(section.notes.length >= 4, `${section.title} 重点词注不足`);
  for (const unit of section.units) {
    assert.equal(unit.startLine, expectedLine, `${unit.id} 起始行不连续`);
    assert.ok(unit.lines.length >= 1 && unit.lines.length <= 3, `${unit.id} 分句数量异常`);
    assert.ok(unit.text.trim(), `${unit.id} 正文为空`);
    assert.ok(unit.translation.trim(), `${unit.id} 缺少译文`);
    expectedLine = unit.endLine + 1;
  }
}

assert.equal(expectedLine, LISAO_RECITATION_LINES.length, '章节单元未完整覆盖原文');
assert.equal(LISAO_UNITS[0].text, LISAO_RECITATION_LINES.slice(0, 2).join(''), '首单元正文不一致');
assert.equal(
  LISAO_UNITS[LISAO_UNITS.length - 1].text,
  LISAO_RECITATION_LINES.slice(-2).join(''),
  '末单元正文不一致',
);

const characters = [...new Set([...LISAO_LINES.join('')].filter(isHanCharacter))];
assert.equal(characters.length, 808, '《离骚》全文不重复汉字数量异常');
for (const character of characters) {
  const readings = getCharacterReadings(character);
  assert.ok(readings.length, `字词解释缺少“${character}”`);
  assert.ok(
    readings.every((reading) => reading.pronunciation && reading.meanings.length),
    `“${character}”的读音或释义为空`,
  );
}

assert.equal(Object.keys(LISAO_SECTION_GUIDES).length, LISAO_SECTIONS.length, '逐章深度导读数量不完整');
assert.ok(LISAO_INTRODUCTION.opening.length >= 2, '全篇导读缺少足够说明');
assert.ok(LISAO_INTRODUCTION.quickFacts.length >= 6, '全篇导读基础知识不足');
assert.ok(LISAO_INTRODUCTION.structure.length >= 4, '全篇结构讲解不足');
for (const section of LISAO_SECTIONS) {
  const guide = LISAO_SECTION_GUIDES[section.id];
  assert.ok(guide, `${section.title} 缺少深度导读`);
  assert.ok(guide.historicalContext.length >= 2, `${section.title} 历史背景不足`);
  assert.ok(guide.whatHappens.length >= 2, `${section.title} 故事梳理不足`);
  assert.ok(guide.questions.length >= 2, `${section.title} 缺少读后问题`);
}

console.log(JSON.stringify({
  lines: LISAO_LINES.length,
  sections: LISAO_SECTIONS.length,
  units: LISAO_UNITS.length,
  first: LISAO_UNITS[0].text,
  last: LISAO_UNITS[LISAO_UNITS.length - 1].text,
  characters: characters.length,
  characterCoverage: '100%',
  deepGuides: Object.keys(LISAO_SECTION_GUIDES).length,
}, null, 2));
