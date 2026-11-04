import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { LisaoUnit } from '../data/lisaoCurriculum';
import type { AiContextResult, AiSettings } from './aiContextCore';
import {
  DEFAULT_AI_SETTINGS,
  buildAiContextPrompt,
  hasAiCredentials,
  normalizeAiSettings,
  parseAiContextResult,
} from './aiContextCore';

export type {
  AiContextResult,
  AiSettings,
} from './aiContextCore';
export {
  DEFAULT_AI_SETTINGS,
  buildAiContextPrompt,
  hasAiCredentials,
  normalizeAiSettings,
  parseAiContextResult,
} from './aiContextCore';

export interface AiContextOutcome extends AiContextResult {
  cached: boolean;
}

interface CachedAiContext {
  result: AiContextResult;
  savedAt: string;
}

type AiCache = Record<string, CachedAiContext>;

const SETTINGS_KEY = 'lisao_ai_settings_v1';
const SETTINGS_FILE = 'lisao-ai-settings-v1.json';
const CACHE_KEY = 'lisao_ai_context_cache_v1';
const CACHE_FILE = 'lisao-ai-context-cache-v1.json';
const CACHE_LIMIT = 300;

export async function loadAiSettings(): Promise<AiSettings> {
  const raw = await readLocalJson(SETTINGS_KEY, SETTINGS_FILE);
  return normalizeAiSettings(raw ?? DEFAULT_AI_SETTINGS);
}

export async function saveAiSettings(settings: AiSettings): Promise<AiSettings> {
  const normalized = normalizeAiSettings(settings);
  if (!normalized.apiKey) throw new Error('请填写 API Key。');
  if (!normalized.model) throw new Error('请填写模型名称。');
  await writeLocalJson(SETTINGS_KEY, SETTINGS_FILE, normalized);
  return normalized;
}

export async function interpretWithAi(
  settings: AiSettings,
  unit: LisaoUnit,
  selection: string,
  sectionTitle?: string,
  force = false,
): Promise<AiContextOutcome> {
  const normalized = normalizeAiSettings(settings);
  if (!hasAiCredentials(normalized)) throw new Error('还没有配置 AI 本句释义。');
  const cacheKey = buildCacheKey(normalized, unit, selection);
  if (!force) {
    const cache = await loadCache();
    const hit = cache[cacheKey];
    if (hit) return { ...hit.result, cached: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${normalized.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalized.apiKey}`,
      },
      body: JSON.stringify({
        model: normalized.model,
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: '你是严谨的古汉语老师，只按上下文解释字词，严禁用字典通用义冒充本句语境义。',
          },
          {
            role: 'user',
            content: buildAiContextPrompt(unit, selection, sectionTitle),
          },
        ],
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`AI 接口返回 HTTP ${response.status}${detail ? `：${detail.slice(0, 180)}` : ''}`);
    }
    const payload = await response.json() as {
      choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    const text = typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content.map((part) => part.text ?? '').join('')
        : '';
    if (!text.trim()) throw new Error('AI 返回内容为空。');
    const result = parseAiContextResult(text, selection);
    await saveCacheResult(cacheKey, result);
    return { ...result, cached: false };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('AI 判断超时，请检查网络或 API 地址。');
    throw error instanceof Error ? error : new Error('AI 判断失败。');
  } finally {
    clearTimeout(timeout);
  }
}

export async function clearAiContextCache(): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(CACHE_KEY);
    return;
  }
  const path = await filePath(CACHE_FILE);
  if (!path) return;
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) await FileSystem.deleteAsync(path, { idempotent: true });
}

async function loadCache(): Promise<AiCache> {
  const raw = await readLocalJson(CACHE_KEY, CACHE_FILE);
  return raw && typeof raw === 'object' ? raw as AiCache : {};
}

async function saveCacheResult(key: string, result: AiContextResult): Promise<void> {
  const cache = await loadCache();
  cache[key] = { result, savedAt: new Date().toISOString() };
  const trimmed = Object.entries(cache)
    .sort((left, right) => right[1].savedAt.localeCompare(left[1].savedAt))
    .slice(0, CACHE_LIMIT);
  await writeLocalJson(CACHE_KEY, CACHE_FILE, Object.fromEntries(trimmed));
}

function buildCacheKey(settings: AiSettings, unit: LisaoUnit, selection: string): string {
  return JSON.stringify([settings.baseUrl, settings.model, 'v1', unit.id, unit.text, selection]);
}

async function readLocalJson(storageKey: string, fileName: string): Promise<unknown | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = globalThis.localStorage?.getItem(storageKey) ?? null;
    } else {
      const path = await filePath(fileName);
      if (path) {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) raw = await FileSystem.readAsStringAsync(path);
      }
    }
    return raw ? JSON.parse(raw) as unknown : null;
  } catch {
    return null;
  }
}

async function writeLocalJson(storageKey: string, fileName: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(storageKey, raw);
    return;
  }
  const path = await filePath(fileName);
  if (!path) throw new Error('本机存储目录不可用。');
  await FileSystem.writeAsStringAsync(path, raw);
}

async function filePath(fileName: string): Promise<string | null> {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${fileName}` : null;
}
