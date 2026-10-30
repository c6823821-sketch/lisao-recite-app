import { Card, createEmptyCard } from 'ts-fsrs';
import type { AppProgress } from './progress';

export interface StoredCard {
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

export function getCard(progress: AppProgress, unitId: string): Card {
  const record = progress.cards[unitId];
  return record ? deserializeCard(record.card) : createEmptyCard();
}

export function deserializeCard(stored: StoredCard): Card {
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
