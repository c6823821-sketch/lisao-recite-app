import * as FileSystem from 'expo-file-system/legacy';
import { Card, Grade, Rating, createEmptyCard, fsrs } from 'ts-fsrs';
import { Platform } from 'react-native';
import { LISAO_UNITS } from '../data/lisaoCurriculum';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

interface StoredCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string | null;
}

export interface UnitRecord {
  card: StoredCard;
  lastRating: ReviewRating;
  lastReviewedAt: string;
}

export interface ReviewEvent {
  unitId: string;
  sectionId: string;
  rating: ReviewRating;
  reviewedAt: string;
  dueAt: string;
}

export interface AppProgress {
  version: 1;
  cards: Record<string, UnitRecord>;
  history: ReviewEvent[];
  dailyTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressSummary {
  total: number;
  newCount: number;
  dueCount: number;
  learningCount: number;
  masteredCount: number;
  reviewedCount: number;
}

const STORAGE_KEY = 'lisao_recite_progress_v1';
const STORAGE_FILE = 'lisao-recite-progress-v1.json';

const scheduler = fsrs({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
  enable_short_term: true,
  learning_steps: ['5m', '30m'],
  relearning_steps: ['10m'],
});

const ratingMap: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

function serializeCard(card: Card): StoredCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review?.toISOString() ?? null,
  };
}

function deserializeCard(stored: StoredCard): Card {
  return {
    due: new Date(stored.due),
    stability: stored.stability,
    difficulty: stored.difficulty,
    elapsed_days: stored.elapsed_days,
    scheduled_days: stored.scheduled_days,
    learning_steps: stored.learning_steps,
    reps: stored.reps,
    lapses: stored.lapses,
    state: stored.state as Card['state'],
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

export function createInitialProgress(): AppProgress {
  const now = new Date().toISOString();
  return {
    version: 1,
    cards: {},
    history: [],
    dailyTarget: 8,
    createdAt: now,
    updatedAt: now,
  };
}

async function storagePath(): Promise<string | null> {
  if (Platform.OS === 'web' || !FileSystem.documentDirectory) return null;
  return `${FileSystem.documentDirectory}${STORAGE_FILE}`;
}

export async function loadProgress(): Promise<AppProgress> {
  try {
    let raw: string | null = null;
    if (Platform.OS === 'web') {
      raw = globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
    } else {
      const path = await storagePath();
      if (path) {
        const info = await FileSystem.getInfoAsync(path);
        if (info.exists) raw = await FileSystem.readAsStringAsync(path);
      }
    }
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<AppProgress>;
    const initial = createInitialProgress();
    return {
      ...initial,
      ...parsed,
      version: 1,
      cards: parsed.cards ?? {},
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 2000) : [],
      dailyTarget: Math.max(1, Number(parsed.dailyTarget) || initial.dailyTarget),
    };
  } catch {
    return createInitialProgress();
  }
}

export async function saveProgress(progress: AppProgress): Promise<void> {
  const next = { ...progress, updatedAt: new Date().toISOString() };
  const raw = JSON.stringify(next);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(STORAGE_KEY, raw);
    return;
  }
  const path = await storagePath();
  if (!path) throw new Error('本机存储目录不可用。');
  await FileSystem.writeAsStringAsync(path, raw);
}

export function getCard(progress: AppProgress, unitId: string): Card {
  const record = progress.cards[unitId];
  return record ? deserializeCard(record.card) : createEmptyCard();
}

export function rateUnit(
  progress: AppProgress,
  unitId: string,
  rating: ReviewRating,
  now = new Date(),
): AppProgress {
  const card = getCard(progress, unitId);
  const result = scheduler.next(card, now, ratingMap[rating]);
  const unit = LISAO_UNITS.find((item) => item.id === unitId);
  if (!unit) throw new Error(`未知背诵单元：${unitId}`);
  const event: ReviewEvent = {
    unitId,
    sectionId: unit.sectionId,
    rating,
    reviewedAt: now.toISOString(),
    dueAt: result.card.due.toISOString(),
  };
  return {
    ...progress,
    cards: {
      ...progress.cards,
      [unitId]: {
        card: serializeCard(result.card),
        lastRating: rating,
        lastReviewedAt: event.reviewedAt,
      },
    },
    history: [event, ...progress.history].slice(0, 2000),
  };
}

export function summarizeProgress(progress: AppProgress, now = new Date()): ProgressSummary {
  let newCount = 0;
  let dueCount = 0;
  let learningCount = 0;
  let masteredCount = 0;
  for (const unit of LISAO_UNITS) {
    const record = progress.cards[unit.id];
    if (!record) {
      newCount += 1;
      continue;
    }
    const card = deserializeCard(record.card);
    if (card.reps === 0) newCount += 1;
    else if (card.due.getTime() <= now.getTime()) dueCount += 1;
    else if (card.stability >= 21 && card.reps >= 3) masteredCount += 1;
    else learningCount += 1;
  }
  return {
    total: LISAO_UNITS.length,
    newCount,
    dueCount,
    learningCount,
    masteredCount,
    reviewedCount: Object.keys(progress.cards).length,
  };
}

export function dueLabel(card: Card, now = new Date()): string {
  if (card.reps === 0) return '未学习';
  const due = card.due.getTime();
  if (due <= now.getTime()) return '现在复习';
  const minutes = Math.ceil((due - now.getTime()) / 60000);
  if (minutes < 60) return `${minutes} 分钟后`;
  if (minutes < 48 * 60) return `${Math.ceil(minutes / 60)} 小时后`;
  return `${card.due.getMonth() + 1} 月 ${card.due.getDate()} 日`;
}

export function masteryLabel(card: Card): string {
  if (card.reps === 0) return '未学习';
  if (card.stability >= 60 && card.reps >= 5) return '稳固';
  if (card.stability >= 21 && card.reps >= 3) return '已掌握';
  if (card.stability >= 7) return '熟悉';
  return '学习中';
}
