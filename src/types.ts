export type Confidence = 'high' | 'medium' | 'low' | 'unknown';

export interface GlossaryEntry {
  lineIndex: number;
  surface: string;
  pinyin?: string;
  partOfSpeech?: string;
  meaningInContext: string;
  literalTranslation?: string;
  plainTranslation?: string;
  grammar?: string;
  notes?: string[];
  evidence?: string[];
  uncertainty?: string;
  confidence: Confidence;
  source?: string;
}
