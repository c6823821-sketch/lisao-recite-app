import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LISAO_SECTIONS } from '../data/lisaoCurriculum';
import { sectionProgress } from '../services/plan';
import { AppProgress, summarizeProgress } from '../services/progress';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  progress: AppProgress;
  onOpenSection: (sectionId: string) => void;
  onStartAll: () => void;
}

export function SectionsScreen({ progress, onOpenSection, onStartAll }: Props) {
  const insets = useSafeAreaInsets();
  const progressBySection = useMemo(() => new Map(
    sectionProgress(progress).map((item) => [item.sectionId, item]),
  ), [progress]);
  const summary = summarizeProgress(progress);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 24) + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>全文 {LISAO_SECTIONS.length} 章 · {summary.total} 个句对</Text>
        <Text style={styles.title}>分章精读</Text>
        <Text style={styles.subtitle}>先理解每一章，再回到句子里背熟。</Text>

        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>已学习 {summary.reviewedCount}</Text>
          <Text style={styles.summaryDivider}>·</Text>
          <Text style={styles.summaryText}>学习中 {summary.learningCount}</Text>
          <Text style={styles.summaryDivider}>·</Text>
          <Text style={styles.summaryText}>较稳固 {summary.masteredCount}</Text>
        </View>

        <Pressable onPress={onStartAll} style={({ pressed }) => [styles.allButton, pressed && styles.pressed]}>
          <View>
            <Text style={styles.allTitle}>从头通背全篇</Text>
            <Text style={styles.allHint}>按原文顺序连续背诵，适合已经熟悉后挑战。</Text>
          </View>
          <Text style={styles.allArrow}>›</Text>
        </Pressable>

        {LISAO_SECTIONS.map((section) => {
          const stat = progressBySection.get(section.id);
          const ratio = stat?.ratio ?? 0;
          return (
            <Pressable
              key={section.id}
              onPress={() => onOpenSection(section.id)}
              style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
            >
              <View style={styles.sectionTop}>
                <View style={styles.sectionCopy}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
                </View>
                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountValue}>{stat?.studied ?? 0}/{stat?.total ?? section.units.length}</Text>
                  <Text style={styles.sectionCountLabel}>句对</Text>
                </View>
              </View>
              <Text style={styles.sectionOverview} numberOfLines={2}>{section.overview}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${ratio * 100}%` }]} />
              </View>
              <View style={styles.sectionBottom}>
                <Text style={styles.sectionStatus}>
                  {(stat?.due ?? 0) > 0 ? `${stat?.due} 句对待复习` : ratio >= 1 ? '已全部学习' : ratio > 0 ? '继续学习' : '尚未开始'}
                </Text>
                <Text style={styles.sectionAction}>精读 ›</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  eyebrow: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.2 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 36, fontWeight: '800', letterSpacing: 3, marginTop: 8 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginTop: 8 },
  summaryBar: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 20, padding: 13, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  summaryText: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11 },
  summaryDivider: { color: colors.line, fontFamily: fonts.sans, fontSize: 11 },
  allButton: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: 16, borderRadius: 16, backgroundColor: colors.vermilion, ...shadow },
  allTitle: { color: colors.white, fontFamily: fonts.title, fontSize: 18, fontWeight: '800' },
  allHint: { color: 'rgba(255,255,255,0.78)', fontFamily: fonts.body, fontSize: 11, lineHeight: 18, marginTop: 3 },
  allArrow: { color: colors.white, fontFamily: fonts.sans, fontSize: 26 },
  sectionCard: { marginTop: 14, padding: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  sectionTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sectionCopy: { flex: 1, minWidth: 0 },
  sectionTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, fontWeight: '800' },
  sectionSubtitle: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, marginTop: 5 },
  sectionCount: { alignItems: 'flex-end' },
  sectionCountValue: { color: colors.ink, fontFamily: fonts.title, fontSize: 17, fontWeight: '800' },
  sectionCountLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 },
  sectionOverview: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginTop: 12 },
  progressTrack: { height: 5, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: colors.paperDeep, marginTop: 14 },
  progressFill: { height: 5, borderRadius: radius.pill, backgroundColor: colors.jade },
  sectionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  sectionStatus: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  sectionAction: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
