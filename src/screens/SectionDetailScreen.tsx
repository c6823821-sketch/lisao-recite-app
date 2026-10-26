import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LisaoSection } from '../data/lisaoCurriculum';
import { AppProgress, getCard, masteryLabel } from '../services/progress';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  section: LisaoSection;
  progress: AppProgress;
  onBack: () => void;
  onStartSection: (sectionId: string, unitIndex: number) => void;
}

export function SectionDetailScreen({ section, progress, onBack, onStartSection }: Props) {
  const insets = useSafeAreaInsets();
  const stats = useMemo(() => {
    let studied = 0;
    let mastered = 0;
    for (const unit of section.units) {
      const card = getCard(progress, unit.id);
      if (card.reps > 0) studied += 1;
      if (card.reps >= 3 && card.stability >= 21) mastered += 1;
    }
    return { studied, mastered };
  }, [progress, section]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable onPress={onBack} style={styles.headerSide}>
          <Text style={styles.headerAction}>‹ 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>第 {section.number} 章</Text>
        <View style={styles.headerSide} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{section.subtitle}</Text>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.stats}>已学 {stats.studied}/{section.units.length} 句对 · 较稳固 {stats.mastered}</Text>

        <View style={styles.primaryCard}>
          <Text style={styles.primaryLabel}>本章主旨</Text>
          <Text style={styles.overview}>{section.overview}</Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>怎么读懂</Text>
          <Text style={styles.insightText}>{section.insight}</Text>
        </View>

        <View style={styles.memoryCard}>
          <Text style={styles.memoryLabel}>背诵线索</Text>
          <Text style={styles.memoryText}>{section.memoryGuide}</Text>
        </View>

        <Pressable
          onPress={() => onStartSection(section.id, 0)}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}
        >
          <Text style={styles.startButtonText}>从本章开始背诵</Text>
          <Text style={styles.startButtonHint}>共 {section.units.length} 个句对</Text>
        </Pressable>

        <Text style={styles.blockTitle}>重点词与典故</Text>
        <View style={styles.notesCard}>
          {section.notes.map((note, index) => (
            <View key={note} style={[styles.noteRow, index === section.notes.length - 1 && styles.noteRowLast]}>
              <Text style={styles.noteIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.blockTitle}>逐句对精读</Text>
        {section.units.map((unit, index) => {
          const card = getCard(progress, unit.id);
          return (
            <Pressable
              key={unit.id}
              onPress={() => onStartSection(section.id, index)}
              style={({ pressed }) => [styles.unitCard, pressed && styles.pressed]}
            >
              <View style={styles.unitHeader}>
                <Text style={styles.unitNumber}>句对 {index + 1}</Text>
                <Text style={styles.unitStatus}>{masteryLabel(card)}</Text>
              </View>
              <View style={styles.originalBlock}>
                {unit.lines.filter((line) => line !== '」').map((line, lineIndex) => (
                  <Text key={`${unit.id}-${lineIndex}`} style={styles.originalLine}>{line}</Text>
                ))}
              </View>
              <Text style={styles.translation}>{unit.translation}</Text>
              <Text style={styles.unitAction}>从这里背 ›</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { minHeight: 74, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  headerSide: { width: 72 },
  headerAction: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15 },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: fonts.sans, fontSize: 13 },
  content: { padding: spacing.lg, paddingBottom: 80 },
  eyebrow: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 31, fontWeight: '800', marginTop: 8 },
  stats: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, marginTop: 8 },
  primaryCard: { marginTop: 22, padding: 18, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  primaryLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  overview: { color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 28, marginTop: 10 },
  insightCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  insightLabel: { color: colors.gold, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  insightText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 26, marginTop: 8 },
  memoryCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.jadeSoft },
  memoryLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  memoryText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 8 },
  startButton: { minHeight: 60, marginTop: 16, paddingHorizontal: 18, borderRadius: 16, backgroundColor: colors.vermilion, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  startButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 17, fontWeight: '800' },
  startButtonHint: { color: 'rgba(255,255,255,0.75)', fontFamily: fonts.sans, fontSize: 10 },
  blockTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 20, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  notesCard: { borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 16 },
  noteRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  noteRowLast: { borderBottomWidth: 0 },
  noteIndex: { width: 28, color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, paddingTop: 4 },
  noteText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24 },
  unitCard: { marginBottom: 12, padding: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  unitNumber: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1.2 },
  unitStatus: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  originalBlock: { marginTop: 12 },
  originalLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, lineHeight: 31, fontWeight: '600' },
  translation: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  unitAction: { alignSelf: 'flex-end', color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, fontWeight: '700', marginTop: 10 },
  pressed: { opacity: 0.68 },
});
