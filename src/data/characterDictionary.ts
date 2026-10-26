import { LISAO_GLOSSARY } from './lisao';
import characterDictionary from './lisaoCharacterDictionary.json';
import { GlossaryEntry } from '../types';

export interface CharacterReading {
  pronunciation: string;
  meanings: string[];
}

const DICTIONARY = characterDictionary as Record<string, CharacterReading[]>;

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
