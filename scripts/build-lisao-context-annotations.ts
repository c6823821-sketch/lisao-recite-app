import fs from 'node:fs';
import path from 'node:path';
import { LISAO_RECITATION_LINES } from '../src/data/lisaoCurriculum';

interface SourceEntry {
  index: number;
  title: string;
  originalText: string;
  annotations: Array<{
    term: string;
    explanation: string;
  }>;
}

interface SourceChapter {
  entries: SourceEntry[];
}

export interface ContextAnnotation {
  clauseStart: number;
  clauseEnd: number;
  surface: string;
  meaning: string;
  source: 'ying-web';
}

const SOURCE_PATH = path.resolve(process.cwd(), 'scripts/data/ying-chuci-lisao-01.json');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src/data/lisaoContextAnnotations.json');

const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8')) as SourceChapter;
const normalizedClauses = LISAO_RECITATION_LINES.map(normalizePoetryLine);
const surfaceAliases: Record<string, string[]> = {
  惮: ['殚'],
  沅湘: ['沅', '湘'],
  汤禹: ['汤', '禹'],
  曼曼: ['漫漫'],
  蹇修: ['謇修'],
  犹豫狐疑: ['犹豫', '狐疑'],
  藑茅: ['琼茅'],
  眩曜: ['昡曜'],
  帏: ['祎'],
  鹈鴂: ['鹈鴃'],
  榝: ['樧'],
  媮: ['偷'],
};

function normalizePoetryLine(value: string): string {
  return value
    .replace(/[\s\u3000，。！？；：、,.!?;:“”‘’（）()《》〈〉「」『』·\-—]/g, '')
    .trim();
}

function cleanSurface(value: string): string {
  return value
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[“”‘’《》〈〉「」『』\s\u3000]/g, '')
    .replace(/[，。！？；：、,.!?;:·\-—]/g, '')
    .trim();
}

function sourceLines(entry: SourceEntry): string[] {
  return entry.originalText
    .split(/\r?\n/)
    .map(normalizePoetryLine)
    .filter((line) => line.length >= 2);
}

function findClauseIndex(candidates: string[], fallbackFrom: number): number {
  for (const candidate of candidates) {
    const exact = normalizedClauses.findIndex((line, index) => index >= fallbackFrom && line === candidate);
    if (exact >= 0) return exact;
  }
  for (const candidate of candidates) {
    const prefix = candidate.slice(0, Math.min(8, candidate.length));
    if (prefix.length < 5) continue;
    const fuzzy = normalizedClauses.findIndex((line, index) => index >= fallbackFrom && line.startsWith(prefix));
    if (fuzzy >= 0) return fuzzy;
  }
  for (const candidate of candidates) {
    let bestIndex = -1;
    let bestScore = 0;
    for (let index = fallbackFrom; index < normalizedClauses.length; index += 1) {
      const score = longestCommonSubstringLength(candidate, normalizedClauses[index]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
    if (bestScore >= Math.min(5, candidate.length)) return bestIndex;
  }
  return -1;
}

function longestCommonSubstringLength(left: string, right: string): number {
  let best = 0;
  let previous = new Array(right.length + 1).fill(0);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = new Array(right.length + 1).fill(0);
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      if (left[leftIndex - 1] !== right[rightIndex - 1]) continue;
      current[rightIndex] = previous[rightIndex - 1] + 1;
      best = Math.max(best, current[rightIndex]);
    }
    previous = current;
  }
  return best;
}

const output: ContextAnnotation[] = [];
const seen = new Set<string>();
let cursor = 0;

for (const entry of source.entries) {
  const lines = sourceLines(entry);
  const clauseStart = findClauseIndex(lines.slice(0, 3), cursor);
  const clauseEnd = findClauseIndex(lines.slice(-3).reverse(), clauseStart);
  if (clauseStart < 0 || clauseEnd < clauseStart) {
    throw new Error(`无法定位第 ${entry.index} 段的原文范围`);
  }
  cursor = clauseEnd + 1;
  const globalClauseIndexes = lines.map((line, localIndex) => (
    findClauseIndex([line], clauseStart + Math.max(0, localIndex - 1))
  ));
  let lastLocalMatch = -1;

  for (const annotation of entry.annotations) {
    const sourceSurface = cleanSurface(annotation.term);
    const surfaces = surfaceAliases[sourceSurface] ?? [sourceSurface];
    const meaning = annotation.explanation
      .replace(/\s+/g, ' ')
      .replace(/^\s*[：:]\s*/, '')
      .trim();
    if (!meaning) continue;
    const matchedLocalLine = lines.findIndex((line, localIndex) => (
      localIndex >= lastLocalMatch
      && surfaces.some((surface) => line.includes(surface))
    ));
    if (matchedLocalLine >= 0) lastLocalMatch = matchedLocalLine;
    const matchedGlobalClause = matchedLocalLine >= 0 ? globalClauseIndexes[matchedLocalLine] : -1;
    const targetClauseStart = matchedGlobalClause >= 0 ? matchedGlobalClause : clauseStart;
    const targetClauseEnd = matchedGlobalClause >= 0 ? matchedGlobalClause : clauseEnd;
    const scopeText = normalizePoetryLine(
      LISAO_RECITATION_LINES.slice(targetClauseStart, targetClauseEnd + 1).join(''),
    );
    for (const surface of surfaces) {
      if (!surface || !/^\p{Script=Han}+$/u.test(surface) || !scopeText.includes(surface)) continue;
      const key = `${targetClauseStart}-${targetClauseEnd}-${surface}-${meaning}`;
      if (seen.has(key)) continue;
      seen.add(key);
      output.push({
        clauseStart: targetClauseStart,
        clauseEnd: targetClauseEnd,
        surface,
        meaning,
        source: 'ying-web',
      });
    }
  }
}

fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  entries: source.entries.length,
  annotations: source.entries.reduce((count, entry) => count + entry.annotations.length, 0),
  output: output.length,
  first: output.slice(0, 5),
  last: output.slice(-5),
  bytes: fs.statSync(OUTPUT_PATH).size,
}, null, 2));
