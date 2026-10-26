import assert from 'node:assert/strict';
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

console.log(JSON.stringify({
  lines: LISAO_LINES.length,
  sections: LISAO_SECTIONS.length,
  units: LISAO_UNITS.length,
  first: LISAO_UNITS[0].text,
  last: LISAO_UNITS[LISAO_UNITS.length - 1].text,
}, null, 2));
