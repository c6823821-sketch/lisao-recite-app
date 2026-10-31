import { LISAO_GLOSSARY } from './lisao';
import { LISAO_SECTIONS, LisaoUnit } from './lisaoCurriculum';
import characterDictionary from './lisaoCharacterDictionary.json';
import contextAnnotations from './lisaoContextAnnotations.json';
import { CHARACTER_CONTEXT_RULES } from './characterContextRules';
import { LISAO_MANUAL_CONTEXT_TERMS } from './lisaoManualContextTerms';
import { GlossaryEntry } from '../types';

export interface CharacterReading {
  pronunciation: string;
  meanings: string[];
  examples?: string[];
}

export interface UnitGlossaryTerm {
  surface: string;
  pinyin?: string;
  meaning: string;
  detail?: string;
}

const DICTIONARY = characterDictionary as Record<string, CharacterReading[]>;
const sectionNoteTerms = new Map<string, UnitGlossaryTerm[]>();
const unitContextTermCache = new Map<string, UnitGlossaryTerm[]>();

interface ContextAnnotation {
  clauseStart: number;
  clauseEnd: number;
  surface: string;
  meaning: string;
}

const CONTEXT_ANNOTATIONS = contextAnnotations as ContextAnnotation[];

export function isHanCharacter(value: string): boolean {
  return /^\p{Script=Han}$/u.test(value);
}

export function getCharacterReadings(character: string): CharacterReading[] {
  return DICTIONARY[character] ?? [];
}

export function getUnitGlossary(unit: LisaoUnit): UnitGlossaryTerm[] {
  return getUnitContextTerms(unit).filter((term) => term.surface.length > 1);
}

export function getUnitContextTerms(unit: LisaoUnit): UnitGlossaryTerm[] {
  const cached = unitContextTermCache.get(unit.id);
  if (cached) return cached;

  const explicit = LISAO_GLOSSARY
    .filter((entry) => unit.text.includes(entry.surface))
    .map((entry) => ({
      surface: entry.surface,
      pinyin: entry.pinyin,
      meaning: entry.meaningInContext,
      detail: [entry.grammar, ...(entry.notes ?? []), entry.uncertainty].filter(Boolean).join(' '),
    }));
  const annotated = CONTEXT_ANNOTATIONS
    .filter((entry) => (
      entry.clauseStart <= unit.endLine
      && entry.clauseEnd >= unit.startLine
      && unit.text.includes(entry.surface)
    ))
    .map((entry) => ({
      surface: entry.surface,
      meaning: entry.meaning,
    }));
  const manual = LISAO_MANUAL_CONTEXT_TERMS.filter((term) => unit.text.includes(term.surface));
  const fromNotes = getSectionNoteTerms(unit.sectionId).filter((term) => unit.text.includes(term.surface));
  const bySurface = new Map<string, UnitGlossaryTerm>();
  for (const term of [...annotated, ...manual, ...fromNotes, ...explicit]) bySurface.set(term.surface, term);
  const merged = [...bySurface.values()].sort((left, right) => right.surface.length - left.surface.length);
  unitContextTermCache.set(unit.id, merged);
  return merged;
}

export function getTermContext(surface: string, unit: LisaoUnit): UnitGlossaryTerm | undefined {
  if (surface.length < 2) return undefined;
  return getUnitGlossary(unit).find((term) => term.surface === surface);
}

export function findCharacterContext(character: string, unit: LisaoUnit): GlossaryEntry {
  const contextTerms = getUnitContextTerms(unit);
  const exact = contextTerms.find((term) => term.surface === character);
  if (exact) {
    return {
      lineIndex: unit.startLine,
      surface: character,
      pinyin: exact.pinyin ?? firstPronunciation(character),
      meaningInContext: exact.meaning,
      notes: exact.detail ? [exact.detail] : undefined,
      confidence: 'high',
      source: '本句词语注释',
    };
  }

  const rules = CHARACTER_CONTEXT_RULES[character] ?? [];
  const rule = rules.find((candidate) => (
    !candidate.match
    || candidate.match.some((pattern) => unit.text.includes(pattern))
  ));
  if (rule) {
    return {
      lineIndex: unit.startLine,
      surface: character,
      pinyin: rule.pronunciation ?? firstPronunciation(character),
      meaningInContext: `本句“${sentenceForCharacter(unit, character)}”中的“${character}”：${rule.meaning}`,
      grammar: rule.grammar,
      notes: rule.note ? [rule.note] : undefined,
      confidence: 'high',
      source: '本句语法与用义',
    };
  }

  const containingTerm = contextTerms
    .filter((term) => term.surface.length > 1 && term.surface.includes(character))
    .sort((left, right) => right.surface.length - left.surface.length)[0];
  if (containingTerm) {
    return {
      lineIndex: unit.startLine,
      surface: character,
      pinyin: firstPronunciation(character),
      meaningInContext: `在本句的“${containingTerm.surface}”中，“${character}”应和整词一起理解，不能脱离这个词硬拆。整词意思是：${containingTerm.meaning}`,
      notes: containingTerm.detail ? [containingTerm.detail] : undefined,
      confidence: 'high',
      source: '本句词语注释',
    };
  }

  const selected = selectCharacterSense(character, unit);
  const sense = selected?.meaning ?? '此字需要结合整句结构和上下文理解';
  return {
    lineIndex: unit.startLine,
    surface: character,
    pinyin: selected?.pronunciation ?? firstPronunciation(character),
    meaningInContext: `本句“${sentenceForCharacter(unit, character)}”中的“${character}”，这里按“${stripMeaningTag(sense)}”理解。`,
    grammar: meaningTag(sense),
    notes: ['这是结合本句动作、对象和整句译文选出的取义；下方字典义项只作补充。'],
    confidence: 'medium',
    source: '本句义项匹配',
  };
}

function firstPronunciation(character: string): string | undefined {
  return getCharacterReadings(character).find((reading) => reading.pronunciation)?.pronunciation;
}

function sentenceForCharacter(unit: LisaoUnit, character: string): string {
  const line = unit.lines.find((candidate) => candidate.includes(character)) ?? unit.lines[0] ?? unit.text;
  const clauses = line
    .split(/(?<=[，。！？；：])/u)
    .map((clause) => clause.trim())
    .filter(Boolean);
  return clauses.find((clause) => clause.includes(character)) ?? line;
}

function selectCharacterSense(
  character: string,
  unit: LisaoUnit,
): { pronunciation: string; meaning: string; score: number } | undefined {
  const candidates = getCharacterReadings(character).flatMap((reading) => (
    reading.meanings.map((meaning, meaningIndex) => ({
      pronunciation: reading.pronunciation,
      meaning,
      example: reading.examples?.[meaningIndex],
    }))
  )).filter((candidate) => /[\p{Script=Han}]/u.test(candidate.meaning));
  if (!candidates.length) return undefined;

  const translation = unit.translation.replace(/[^\p{Script=Han}]/gu, '');
  return candidates
    .map((candidate, index) => {
      const plain = stripMeaningTag(candidate.meaning).replace(/[^\p{Script=Han}]/gu, '');
      let score = -index * 0.01;
      if (candidate.example) {
        const example = candidate.example.replace(/～/g, character).replace(/[^\p{Script=Han}]/gu, '');
        const overlap = longestCommonSubstringLength(example, unit.text.replace(/[^\p{Script=Han}]/gu, ''));
        if (overlap >= 2) score += overlap * 8;
      }
      if (plain.length >= 2 && translation.includes(plain)) score += 12;
      for (const size of [4, 3, 2]) {
        for (let start = 0; start <= plain.length - size; start += 1) {
          if (translation.includes(plain.slice(start, start + size))) score += size;
        }
      }
      if (unit.text.includes(candidate.meaning)) score += 20;
      return { ...candidate, score };
    })
    .sort((left, right) => right.score - left.score)[0];
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

function stripMeaningTag(value: string): string {
  return value.replace(/^\[[^\]]+\]\s*/, '').trim();
}

function meaningTag(value: string): string | undefined {
  const tag = value.match(/^\[([^\]]+)\]/)?.[1];
  if (!tag) return undefined;
  const labels: Record<string, string> = {
    助: '助词',
    代: '代词',
    副: '副词',
    介: '介词',
    连: '连词',
    动: '动词',
    名: '名词',
    形: '形容词',
    数: '数词',
    语助: '语气助词',
  };
  return `句中词性：${labels[tag] ?? tag}`;
}

function getSectionNoteTerms(sectionId: string): UnitGlossaryTerm[] {
  const cached = sectionNoteTerms.get(sectionId);
  if (cached) return cached;
  const section = LISAO_SECTIONS.find((item) => item.id === sectionId);
  if (!section) return [];
  const terms: UnitGlossaryTerm[] = [];
  for (const note of section.notes) {
    const separator = note.indexOf('：');
    if (separator <= 0) continue;
    const meaning = note.slice(separator + 1).trim();
    for (const rawSurface of note.slice(0, separator).split(/[、，,/]/)) {
      const surface = rawSurface.trim().replace(/^[“”‘’《》]+|[“”‘’《》]+$/g, '');
      if (surface.length < 2 || !/^\p{Script=Han}+$/u.test(surface)) continue;
      terms.push({ surface, meaning });
    }
  }
  const unique = [...new Map(terms.map((term) => [term.surface, term])).values()];
  sectionNoteTerms.set(sectionId, unique);
  return unique;
}
