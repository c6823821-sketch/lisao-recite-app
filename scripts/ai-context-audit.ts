import assert from 'node:assert/strict';
import { LISAO_SECTIONS, LISAO_UNITS } from '../src/data/lisaoCurriculum';
import {
  buildAiContextPrompt,
  normalizeAiSettings,
  parseAiContextResult,
} from '../src/services/aiContextCore';

assert.equal(
  normalizeAiSettings({ baseUrl: 'https://api.deepseek.com/v1/', model: 'deepseek-chat', apiKey: 'x' }).baseUrl,
  'https://api.deepseek.com/v1',
);
assert.equal(
  normalizeAiSettings({ baseUrl: 'https://api.example.com/v1/chat/completions', model: 'm', apiKey: 'x' }).baseUrl,
  'https://api.example.com/v1',
);

const unit = LISAO_UNITS.find((candidate) => candidate.text.includes('冀枝叶之峻茂兮'));
assert.ok(unit, '找不到“枝”的测试句对');
const section = LISAO_SECTIONS.find((candidate) => candidate.id === unit!.sectionId);
const prompt = buildAiContextPrompt(unit!, '枝叶', section?.title);
assert.match(prompt, /只回答所选字词在给定原句中的实际取义/);
assert.match(prompt, /所选字词：枝叶/);
assert.match(prompt, new RegExp(unit!.text));

const parsed = parseAiContextResult('```json\n{"surface":"枝叶","pronunciation":"zhī yè","meaning":"兰蕙的枝叶","grammar":"名词短语","explanation":"指前文栽种的兰蕙。","confidence":"high"}\n```', '枝叶');
assert.deepEqual(parsed, {
  surface: '枝叶',
  pronunciation: 'zhī yè',
  meaning: '兰蕙的枝叶',
  grammar: '名词短语',
  explanation: '指前文栽种的兰蕙。',
  confidence: 'high',
});
assert.throws(() => parseAiContextResult('没有 JSON', '枝叶'), /格式不正确/);
assert.throws(() => parseAiContextResult('{"surface":"枝叶"}', '枝叶'), /没有返回本句字义/);

console.log(JSON.stringify({
  settingsNormalization: '通过',
  promptContext: unit!.id,
  responseParsing: '通过',
}, null, 2));
