import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LISAO_UNITS } from '../data/lisaoCurriculum';
import { AppProgress, summarizeProgress } from '../services/progress';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  progress: AppProgress;
  onSetDailyTarget: (target: number) => void;
  onReset: () => void;
}

const TARGETS = [4, 8, 12, 16];

export function MineScreen({ progress, onSetDailyTarget, onReset }: Props) {
  const insets = useSafeAreaInsets();
  const summary = useMemo(() => summarizeProgress(progress), [progress]);
  const reviewedEvents = progress.history.length;
  const againCount = progress.history.filter((event) => event.rating === 'again').length;
  const recent = progress.history.slice(0, 6);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 24) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>本地学习档案</Text>
        <Text style={styles.title}>我的</Text>
        <Text style={styles.subtitle}>所有背诵进度只保存在这台手机上。</Text>

        <View style={styles.statsGrid}>
          <Stat value={summary.reviewedCount} label="已学句对" />
          <Stat value={summary.masteredCount} label="较稳固" />
          <Stat value={summary.dueCount} label="待复习" />
          <Stat value={summary.newCount} label="未学习" />
        </View>

        <Text style={styles.blockTitle}>每日新学安排</Text>
        <Text style={styles.blockHint}>到期复习会额外加入，不会被新学数量挤掉。</Text>
        <View style={styles.targetRow}>
          {TARGETS.map((target) => {
            const active = progress.dailyTarget === target;
            return (
              <Pressable
                key={target}
                onPress={() => onSetDailyTarget(target)}
                style={({ pressed }) => [styles.target, active && styles.targetActive, pressed && styles.pressed]}
              >
                <Text style={[styles.targetValue, active && styles.targetValueActive]}>{target}</Text>
                <Text style={[styles.targetLabel, active && styles.targetValueActive]}>句对/天</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.blockTitle}>学习记录</Text>
        <View style={styles.recordCard}>
          <RecordRow label="累计作答" value={`${reviewedEvents} 次`} />
          <RecordRow label="回炉次数" value={`${againCount} 次`} />
          <RecordRow label="全文规模" value={`${LISAO_UNITS.length} 句对 / 382 句`} />
          <RecordRow label="当前版本" value="1.0.0" last />
        </View>

        <Text style={styles.blockTitle}>最近复习</Text>
        <View style={styles.recordCard}>
          {recent.length ? recent.map((event, index) => (
            <View key={`${event.reviewedAt}-${event.unitId}`} style={[styles.recentRow, index === recent.length - 1 && styles.rowLast]}>
              <View style={styles.recentCopy}>
                <Text style={styles.recentUnit}>{event.sectionId}</Text>
                <Text style={styles.recentTime}>{new Date(event.reviewedAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={[styles.recentRating, event.rating === 'again' && styles.recentAgain]}>{ratingText(event.rating)}</Text>
            </View>
          )) : <Text style={styles.empty}>还没有复习记录。</Text>}
        </View>

        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>关于底本与内容</Text>
          <Text style={styles.aboutText}>
            原文采用项目内置《离骚》全文，382 句完整收录。分章、译文、重点词和背诵提示为本 App 的本地学习资料；遇到异文或学界分歧，应以可靠注本继续核对。
          </Text>
        </View>

        <Pressable onPress={onReset} style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
          <Text style={styles.resetText}>清除全部学习记录</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RecordRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.recordRow, last && styles.rowLast]}>
      <Text style={styles.recordLabel}>{label}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  );
}

function ratingText(rating: string): string {
  if (rating === 'again') return '不会';
  if (rating === 'hard') return '模糊';
  if (rating === 'good') return '背会';
  return '熟练';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  eyebrow: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.2 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 38, fontWeight: '800', letterSpacing: 4, marginTop: 8 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  stat: { width: '48.5%', minHeight: 92, padding: 15, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  statValue: { color: colors.ink, fontFamily: fonts.title, fontSize: 27, fontWeight: '800' },
  statLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  blockTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 20, fontWeight: '800', marginTop: 28 },
  blockHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, lineHeight: 18, marginTop: 6 },
  targetRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  target: { flex: 1, minHeight: 66, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  targetActive: { borderColor: colors.vermilion, backgroundColor: colors.vermilionSoft },
  targetValue: { color: colors.inkSoft, fontFamily: fonts.title, fontSize: 20, fontWeight: '800' },
  targetValueActive: { color: colors.vermilion },
  targetLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 },
  recordCard: { marginTop: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16 },
  recordRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  recordLabel: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14 },
  recordValue: { color: colors.jade, fontFamily: fonts.sans, fontSize: 12 },
  rowLast: { borderBottomWidth: 0 },
  recentRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  recentCopy: { flex: 1 },
  recentUnit: { color: colors.ink, fontFamily: fonts.sans, fontSize: 12 },
  recentTime: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  recentRating: { color: colors.jade, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  recentAgain: { color: colors.vermilion },
  empty: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, paddingVertical: 20 },
  aboutCard: { marginTop: 28, padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  aboutTitle: { color: colors.gold, fontFamily: fonts.body, fontSize: 15, fontWeight: '800' },
  aboutText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 23, marginTop: 8 },
  resetButton: { minHeight: 50, marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: '#D7B7B2', alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
