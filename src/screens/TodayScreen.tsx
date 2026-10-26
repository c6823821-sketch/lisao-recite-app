import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LISAO_SECTIONS } from '../data/lisaoCurriculum';
import { buildTodayPlan, HomeAction, sectionForUnit } from '../services/plan';
import { AppProgress, getCard, summarizeProgress } from '../services/progress';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  progress: AppProgress;
  onStart: (action: HomeAction) => void;
  onOpenSection: (sectionId: string) => void;
}

export function TodayScreen({ progress, onStart, onOpenSection }: Props) {
  const insets = useSafeAreaInsets();
  const plan = useMemo(() => buildTodayPlan(progress), [progress]);
  const summary = useMemo(() => summarizeProgress(progress), [progress]);
  const nextUnit = plan.queue[0];
  const nextSection = sectionForUnit(nextUnit);
  const readingSection = nextSection
    ?? LISAO_SECTIONS.find((section) => section.id === plan.fresh[0]?.sectionId)
    ?? LISAO_SECTIONS[0];
  const learnedRatio = summary.total ? summary.reviewedCount / summary.total : 0;
  const masteredRatio = summary.total ? summary.masteredCount / summary.total : 0;
  const todayText = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 24) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.date}>{todayText}</Text>
        <Text style={styles.title}>今日</Text>
        <Text style={styles.subtitle}>每天学一小段，反复回到句子里。</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>全篇进度</Text>
              <Text style={styles.progressValue}>
                {summary.reviewedCount}
                <Text style={styles.progressTotal}> / {summary.total} 句对</Text>
              </Text>
            </View>
            <View style={styles.progressNumbers}>
              <Text style={styles.progressNumber}>{summary.learningCount}</Text>
              <Text style={styles.progressNumberLabel}>学习中</Text>
              <Text style={styles.progressNumber}>{summary.masteredCount}</Text>
              <Text style={styles.progressNumberLabel}>已掌握</Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.trackLearned, { width: `${learnedRatio * 100}%` }]} />
            <View style={[styles.trackMastered, { width: `${masteredRatio * 100}%` }]} />
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.gold }]} /><Text style={styles.legendText}>已学习</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.jade }]} /><Text style={styles.legendText}>较稳固</Text></View>
          </View>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planLabel}>今日安排</Text>
              <Text style={styles.planTitle}>
                {plan.due.length > 0 ? `复习 ${plan.due.length} 句对 · ` : ''}
                新学 {plan.fresh.length} 句对
              </Text>
            </View>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeValue}>{plan.queue.length}</Text>
              <Text style={styles.planBadgeLabel}>待完成</Text>
            </View>
          </View>

          {nextUnit && nextSection ? (
            <Pressable onPress={() => onOpenSection(nextSection.id)} style={styles.nextBlock}>
              <Text style={styles.nextHint}>接下来</Text>
              <Text style={styles.nextSection}>{nextSection.title}</Text>
              <Text style={styles.nextLine} numberOfLines={2}>{nextUnit.lines.join('')}</Text>
            </Pressable>
          ) : (
            <View style={styles.completeBlock}>
              <Text style={styles.completeTitle}>今天的任务已经完成</Text>
              <Text style={styles.completeText}>可以回看章节，或者检查近期到期内容。</Text>
            </View>
          )}

          <View style={styles.primaryActions}>
            <Pressable
              disabled={!plan.queue.length}
              onPress={() => onStart('daily')}
              style={({ pressed }) => [styles.primaryButton, !plan.queue.length && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>开始今日学习</Text>
            </Pressable>
            <Pressable
              disabled={!plan.due.length}
              onPress={() => onStart('review')}
              style={({ pressed }) => [styles.secondaryButton, !plan.due.length && styles.disabled, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>只复习到期</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>近期到期</Text>
          <Text style={styles.sectionMeta}>{summary.dueCount} 句对</Text>
        </View>
        {plan.due.length ? plan.due.slice(0, 4).map((unit) => {
          const section = sectionForUnit(unit);
          const card = getCard(progress, unit.id);
          return (
            <Pressable
              key={unit.id}
              onPress={() => section && onOpenSection(section.id)}
              style={({ pressed }) => [styles.dueRow, pressed && styles.pressed]}
            >
              <View style={styles.dueCopy}>
                <Text style={styles.dueSection}>{section?.title}</Text>
                <Text style={styles.dueText} numberOfLines={2}>{unit.lines.join('')}</Text>
              </View>
              <Text style={styles.dueLabel}>{card.due.getTime() <= Date.now() ? '现在' : '稍后'}</Text>
            </Pressable>
          );
        }) : (
          <Text style={styles.emptyText}>暂无到期内容。新学的句对会按记忆曲线自动安排复习。</Text>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>学习建议</Text>
          <Text style={styles.sectionMeta}>{LISAO_SECTIONS.length} 章</Text>
        </View>
        <Pressable
          onPress={() => onOpenSection(readingSection.id)}
          style={({ pressed }) => [styles.readingCard, pressed && styles.pressed]}
        >
          <View style={styles.readingMark}><Text style={styles.readingMarkText}>读</Text></View>
          <View style={styles.readingCopy}>
            <Text style={styles.readingTitle}>{readingSection.title}</Text>
            <Text style={styles.readingHint}>先读原文、译文、背景和重点词，再进入背诵。</Text>
          </View>
          <Text style={styles.readingArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  date: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.2 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 38, fontWeight: '800', letterSpacing: 4, marginTop: 8 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginTop: 8 },
  progressCard: { marginTop: 26, padding: 18, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  progressLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  progressValue: { color: colors.ink, fontFamily: fonts.title, fontSize: 29, fontWeight: '800', marginTop: 6 },
  progressTotal: { color: colors.muted, fontFamily: fonts.sans, fontSize: 13, fontWeight: '400' },
  progressNumbers: { alignItems: 'flex-end' },
  progressNumber: { color: colors.ink, fontFamily: fonts.title, fontSize: 18, fontWeight: '800' },
  progressNumberLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginBottom: 3 },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.paperDeep, marginTop: 18 },
  trackLearned: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#D4B06B', borderRadius: radius.pill },
  trackMastered: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: colors.jade, borderRadius: radius.pill },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  planCard: { marginTop: 16, padding: 18, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  planLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  planTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 21, fontWeight: '800', marginTop: 6 },
  planBadge: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.vermilionSoft, alignItems: 'center', justifyContent: 'center' },
  planBadgeValue: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 22, fontWeight: '800' },
  planBadgeLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 9, marginTop: 1 },
  nextBlock: { marginTop: 18, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  nextHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1.2 },
  nextSection: { color: colors.jade, fontFamily: fonts.sans, fontSize: 12, marginTop: 6 },
  nextLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 18, lineHeight: 30, marginTop: 6 },
  completeBlock: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: colors.jadeSoft },
  completeTitle: { color: colors.jade, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
  completeText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginTop: 5 },
  primaryActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  primaryButton: { flex: 1.35, minHeight: 52, borderRadius: radius.button, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: radius.button, borderWidth: 1, borderColor: colors.vermilion, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  secondaryButtonText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.68 },
  sectionHeader: { marginTop: 26, marginBottom: 12, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 20, fontWeight: '800' },
  sectionMeta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11 },
  dueRow: { minHeight: 74, padding: 14, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  dueCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  dueSection: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, marginBottom: 4 },
  dueText: { color: colors.ink, fontFamily: fonts.title, fontSize: 15, lineHeight: 22 },
  dueLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  emptyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 22 },
  readingCard: { minHeight: 88, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  readingMark: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.jadeSoft, alignItems: 'center', justifyContent: 'center' },
  readingMarkText: { color: colors.jade, fontFamily: fonts.title, fontSize: 19, fontWeight: '800' },
  readingCopy: { flex: 1, marginLeft: 12, paddingRight: 8 },
  readingTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 16, fontWeight: '800' },
  readingHint: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, marginTop: 4 },
  readingArrow: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 26 },
});
