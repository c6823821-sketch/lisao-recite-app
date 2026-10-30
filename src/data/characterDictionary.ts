import { LISAO_GLOSSARY } from './lisao';
import { LISAO_SECTIONS, LisaoUnit } from './lisaoCurriculum';
import characterDictionary from './lisaoCharacterDictionary.json';
import { GlossaryEntry } from '../types';

export interface CharacterReading {
  pronunciation: string;
  meanings: string[];
}

export interface UnitGlossaryTerm {
  surface: string;
  pinyin?: string;
  meaning: string;
  detail?: string;
}

const DICTIONARY = characterDictionary as Record<string, CharacterReading[]>;
const sectionNoteTerms = new Map<string, UnitGlossaryTerm[]>();

export function isHanCharacter(value: string): boolean {
  return /^\p{Script=Han}$/u.test(value);
}

export function getCharacterReadings(character: string): CharacterReading[] {
  return DICTIONARY[character] ?? [];
}

export function findGlossaryContext(character: string, unitText: string): GlossaryEntry | undefined {
  return LISAO_GLOSSARY
    .filter((entry) => entry.surface.includes(character) && unitText.includes(entry.surface))
    .sort((left, right) => right.surface.length - left.surface.length)[0];
}

export function getUnitGlossary(unit: LisaoUnit): UnitGlossaryTerm[] {
  const explicit = LISAO_GLOSSARY
    .filter((entry) => entry.surface.length > 1 && unit.text.includes(entry.surface))
    .map((entry) => ({
      surface: entry.surface,
      pinyin: entry.pinyin,
      meaning: entry.meaningInContext,
      detail: [entry.grammar, ...(entry.notes ?? []), entry.uncertainty].filter(Boolean).join(' '),
    }));
  const fromNotes = getSectionNoteTerms(unit.sectionId).filter((term) => unit.text.includes(term.surface));
  const bySurface = new Map<string, UnitGlossaryTerm>();
  for (const term of [...fromNotes, ...explicit]) bySurface.set(term.surface, term);
  return [...bySurface.values()].sort((left, right) => right.surface.length - left.surface.length);
}

export function getTermContext(surface: string, unit: LisaoUnit): UnitGlossaryTerm | undefined {
  if (surface.length < 2) return undefined;
  return getUnitGlossary(unit).find((term) => term.surface === surface);
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
