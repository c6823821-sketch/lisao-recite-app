import { LisaoUnit } from '../data/lisaoCurriculum';

export interface AiSettings {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface AiContextResult {
  surface: string;
  pronunciation?: string;
  meaning: string;
  grammar?: string;
  explanation?: string;
  confidence: 'high' | 'medium' | 'low';
}

export const DEFAULT_AI_SETTINGS: AiSettings = {
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
};

export function normalizeAiSettings(input: Partial<AiSettings>): AiSettings {
  const baseUrl = String(input.baseUrl ?? DEFAULT_AI_SETTINGS.baseUrl)
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/chat\/completions$/i, '');
  if (!/^https?:\/\//i.test(baseUrl)) throw new Error('API 地址必须以 http:// 或 https:// 开头。');
  return {
    baseUrl,
    apiKey: String(input.apiKey ?? '').trim(),
    model: String(input.model ?? DEFAULT_AI_SETTINGS.model).trim(),
  };
}

export function hasAiCredentials(settings: AiSettings): boolean {
  return Boolean(settings.apiKey && settings.model && settings.baseUrl);
}

export function buildAiContextPrompt(
  unit: LisaoUnit,
  selection: string,
  sectionTitle?: string,
): string {
  return [
    '你在解释《离骚》中的一个字词。',
    '只回答所选字词在给定原句中的实际取义，不要罗列字典通用义，也不要把整句译文改写成字义。',
    '如果所选的是词语，请把整个词语当作解释对象，不做机械拆字。',
    '如果无法可靠判断，confidence 填 low，并在 explanation 中明确说“需要结合注本核对”。',
    '只输出一个 JSON 对象，不要 Markdown 代码块，不要额外说明。',
    'JSON 字段：surface（所选字词）、pronunciation（读音，可空字符串）、meaning（本句中的意思，一句话）、grammar（词性或语法作用，可空字符串）、explanation（结合本句的判断依据，简短）、confidence（high、medium 或 low）。',
    '',
    `章节：${sectionTitle ?? '《离骚》'}`,
    `原句：${unit.text}`,
    `参考译文：${unit.translation}`,
    `所选字词：${selection}`,
  ].join('\n');
}

export function parseAiContextResult(raw: string, selection: string): AiContextResult {
  const withoutFence = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const start = withoutFence.indexOf('{');
  const end = withoutFence.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('AI 返回格式不正确，没有找到 JSON。');

  let value: Record<string, unknown>;
  try {
    value = JSON.parse(withoutFence.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    throw new Error('AI 返回的 JSON 无法解析。');
  }

  const meaning = textField(value.meaning ?? value.meaningInContext ?? value.contextMeaning);
  if (!meaning) throw new Error('AI 没有返回本句字义。');
  const confidenceValue = textField(value.confidence).toLowerCase();
  const confidence = confidenceValue === 'high' || confidenceValue === 'low' ? confidenceValue : 'medium';
  return {
    surface: textField(value.surface) || selection,
    pronunciation: textField(value.pronunciation) || undefined,
    meaning,
    grammar: textField(value.grammar ?? value.partOfSpeech) || undefined,
    explanation: textField(value.explanation ?? value.reason) || undefined,
    confidence,
  };
}

function textField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
