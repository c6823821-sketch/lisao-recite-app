import { LISAO_SECTIONS, LISAO_UNITS, LisaoUnit } from '../data/lisaoCurriculum';
import { getCard } from './cards';
import type { AppProgress } from './progress';

export type HomeAction = 'daily' | 'review' | 'all';

export interface TodayPlan {
  due: LisaoUnit[];
  fresh: LisaoUnit[];
  queue: LisaoUnit[];
  dailyTarget: number;
  newTodayCount: number;
  remainingNewCount: number;
}

export interface SectionProgress {
  sectionId: string;
  total: number;
  studied: number;
  mastered: number;
  due: number;
  ratio: number;
}

export interface UnitContext {
  previous?: LisaoUnit;
  next?: LisaoUnit;
}

export function buildTodayPlan(progress: AppProgress, now = new Date()): TodayPlan {
  const due: LisaoUnit[] = [];
  const fresh: LisaoUnit[] = [];
  for (const unit of LISAO_UNITS) {
    const card = getCard(progress, unit.id);
    if (card.reps === 0) fresh.push(unit);
    else if (card.due.getTime() <= now.getTime()) due.push(unit);
  }
  due.sort(compareTextOrder);
  const newTodayCount = countUnitsFirstReviewedOn(progress, now);
  const remainingNewCount = Math.max(0, progress.dailyTarget - newTodayCount);
  const targetFresh = pickContinuousFresh(progress, fresh, remainingNewCount);
  return {
    due,
    fresh: targetFresh,
    queue: [...due, ...targetFresh],
    dailyTarget: progress.dailyTarget,
    newTodayCount,
    remainingNewCount,
  };
}

function pickContinuousFresh(
  progress: AppProgress,
  fresh: LisaoUnit[],
  limit: number,
): LisaoUnit[] {
  if (!limit || !fresh.length) return [];
  const freshIds = new Set(fresh.map((unit) => unit.id));
  let anchorIndex = -1;
  for (const [index, unit] of LISAO_UNITS.entries()) {
    if (progress.cards[unit.id]) anchorIndex = index;
  }

  const picked: LisaoUnit[] = [];
  for (let offset = 1; offset <= LISAO_UNITS.length && picked.length < limit; offset += 1) {
    const index = (anchorIndex + offset + LISAO_UNITS.length) % LISAO_UNITS.length;
    const unit = LISAO_UNITS[index];
    if (!freshIds.has(unit.id)) {
      if (picked.length) break;
      continue;
    }
    picked.push(unit);
  }
  return picked;
}

function countUnitsFirstReviewedOn(progress: AppProgress, now: Date): number {
  const firstReviewedAt = new Map<string, number>();
  for (const event of progress.history) {
    const reviewedAt = Date.parse(event.reviewedAt);
    if (!Number.isFinite(reviewedAt)) continue;
    const previous = firstReviewedAt.get(event.unitId);
    if (previous == null || reviewedAt < previous) firstReviewedAt.set(event.unitId, reviewedAt);
  }
  const today = now.toDateString();
  return [...firstReviewedAt.values()].filter((value) => new Date(value).toDateString() === today).length;
}

export function buildQueueForAction(
  progress: AppProgress,
  action: HomeAction,
  sectionId?: string,
): LisaoUnit[] {
  if (action === 'review') return buildTodayPlan(progress).due;
  if (action === 'all') {
    return [...LISAO_UNITS].sort((left, right) => left.startLine - right.startLine);
  }
  if (sectionId) {
    const section = LISAO_SECTIONS.find((item) => item.id === sectionId);
    return section?.units ?? [];
  }
  return buildTodayPlan(progress).queue;
}

export function sectionProgress(progress: AppProgress, now = new Date()): SectionProgress[] {
  return LISAO_SECTIONS.map((section) => {
    let studied = 0;
    let mastered = 0;
    let due = 0;
    for (const unit of section.units) {
      const card = getCard(progress, unit.id);
      if (card.reps > 0) studied += 1;
      if (card.reps >= 3 && card.stability >= 21) mastered += 1;
      if (card.reps > 0 && card.due.getTime() <= now.getTime()) due += 1;
    }
    return {
      sectionId: section.id,
      total: section.units.length,
      studied,
      mastered,
      due,
      ratio: section.units.length ? studied / section.units.length : 0,
    };
  });
}

export function sectionForUnit(unit: LisaoUnit | undefined) {
  return unit ? LISAO_SECTIONS.find((section) => section.id === unit.sectionId) : undefined;
}

export function contextForUnit(unit: LisaoUnit): UnitContext {
  const index = LISAO_UNITS.findIndex((item) => item.id === unit.id);
  if (index < 0) return {};
  return {
    previous: index > 0 ? LISAO_UNITS[index - 1] : undefined,
    next: index < LISAO_UNITS.length - 1 ? LISAO_UNITS[index + 1] : undefined,
  };
}

export function insertRetry(
  queue: LisaoUnit[],
  currentIndex: number,
  unit: LisaoUnit,
  interveningItems = 1,
): LisaoUnit[] {
  const next = [...queue];
  const insertAt = Math.min(
    next.length,
    currentIndex + 1 + Math.max(1, interveningItems),
  );
  next.splice(insertAt, 0, unit);
  return next;
}

function compareTextOrder(left: LisaoUnit, right: LisaoUnit): number {
  return left.startLine - right.startLine;
}
