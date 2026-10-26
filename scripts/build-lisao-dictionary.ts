import fs from 'node:fs';
import path from 'node:path';
import { LISAO_LINES } from '../src/data/lisao';
import { DICTIONARY_SUPPLEMENT } from './dictionary-supplement';

interface SourceReading {
  pronunciation?: string;
  explains?: string[];
}

interface OutputReading {
  pronunciation: string;
  meanings: string[];
}

const SOURCE_PATH = path.resolve(process.cwd(), '../shici-recite-app/src/data/dictionary/Word_Explain.json');
const OUTPUT_PATH = path.resolve(process.cwd(), 'src/data/lisaoCharacterDictionary.json');

const text = LISAO_LINES.join('');
const characters = [...new Set([...text].filter((character) => /\p{Script=Han}/u.test(character)))];
const source = JSON.parse(fs.readFileSync(SOURCE_PATH, 'utf8')) as Record<string, SourceReading[]>;

function cleanMeaning(value: string): string {
  const normalized = value
    .replace(/\s+/g, ' ')
    .replace(/〖[^〗]+〗/g, '')
    .replace(/<([^>]+)>/g, '[$1]')
    .trim();
  const firstSentence = normalized.split('。')[0]?.trim() || normalized;
  const concise = firstSentence.length > 84
    ? `${firstSentence.slice(0, 82).replace(/[，、；：]$/, '')}…`
    : firstSentence;
  return concise.endsWith('。') ? concise : `${concise}。`;
}

const output: Record<string, OutputReading[]> = {};
const missing: string[] = [];

for (const character of characters) {
  const readings = source[character];
  if (readings?.length) {
    output[character] = readings
      .map((reading) => ({
        pronunciation: reading.pronunciation?.trim() || '',
        meanings: (reading.explains ?? [])
          .map(cleanMeaning)
          .filter(Boolean)
          .slice(0, 2),
      }))
      .filter((reading) => reading.pronunciation && reading.meanings.length)
      .slice(0, 4);
  }
  if (!output[character]?.length) {
    const supplemental = DICTIONARY_SUPPLEMENT[character];
    if (supplemental?.length) output[character] = supplemental;
    else missing.push(character);
  }
}

const sorted = Object.fromEntries(Object.entries(output).sort(([left], [right]) => left.localeCompare(right, 'zh-CN')));
fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

const covered = characters.length - missing.length;
const polyphonic = Object.values(sorted).filter((readings) => readings.length > 1).length;
console.log(JSON.stringify({
  characters: characters.length,
  covered,
  coverage: `${((covered / characters.length) * 100).toFixed(1)}%`,
  polyphonic,
  missing,
  bytes: fs.statSync(OUTPUT_PATH).size,
}, null, 2));

if (missing.length) process.exitCode = 1;
