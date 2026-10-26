import { LISAO_SECTIONS, LISAO_UNITS, LisaoUnit } from '../data/lisaoCurriculum';
import { AppProgress, getCard } from './progress';

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

export function buildTodayPlan(progress: AppProgress, now = new Date()): TodayPlan {
  const due: LisaoUnit[] = [];
  const fresh: LisaoUnit[] = [];
  for (const unit of LISAO_UNITS) {
    const card = getCard(progress, unit.id);
    if (card.reps === 0) fresh.push(unit);
    else if (card.due.getTime() <= now.getTime()) due.push(unit);
  }
  due.sort((left, right) => getCard(progress, left.id).due.getTime() - getCard(progress, right.id).due.getTime());
  const newTodayCount = countUnitsFirstReviewedOn(progress, now);
  const remainingNewCount = Math.max(0, progress.dailyTarget - newTodayCount);
  const targetFresh = fresh.slice(0, remainingNewCount);
  return {
    due,
    fresh: targetFresh,
    queue: [...due, ...targetFresh],
    dailyTarget: progress.dailyTarget,
    newTodayCount,
    remainingNewCount,
  };
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
