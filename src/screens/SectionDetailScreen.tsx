import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterInspector } from '../components/CharacterInspector';
import { ClassicalText } from '../components/ClassicalText';
import { getUnitGlossary } from '../data/characterDictionary';
import { LISAO_SECTION_GUIDES } from '../data/lisaoGuide';
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
  const [inspector, setInspector] = useState<{ selection: string; unitIndex: number } | null>(null);
  const [wordMode, setWordMode] = useState(false);
  const deepGuide = LISAO_SECTION_GUIDES[section.id];
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

  const inspectorUnit = inspector ? section.units[inspector.unitIndex] : null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Pressable onPress={onBack} style={styles.headerSide}>
          <Text style={styles.headerAction}>‹ 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>第 {section.number} 章</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: wordMode }}
          onPress={() => setWordMode((value) => !value)}
          style={[styles.headerSide, styles.headerMode]}
        >
          <Text style={[styles.headerModeText, wordMode && styles.headerModeTextActive]}>
            {wordMode ? '选词中' : '选整词'}
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{section.subtitle}</Text>
        <Text style={styles.title}>{section.title}</Text>
        <Text style={styles.stats}>已学 {stats.studied}/{section.units.length} 句对 · 较稳固 {stats.mastered}</Text>

        <View style={styles.primaryCard}>
          <Text style={styles.primaryLabel}>本章主旨</Text>
          <Text style={styles.overview}>{section.overview}</Text>
        </View>

        {deepGuide ? (
          <>
            <View style={styles.backgroundCard}>
              <Text style={styles.deepLabel}>时代与处境</Text>
              {deepGuide.historicalContext.map((paragraph) => (
                <Text key={paragraph} style={styles.deepText}>{paragraph}</Text>
              ))}
            </View>

            <View style={styles.storyCard}>
              <Text style={styles.storyLabel}>这一段发生了什么</Text>
              {deepGuide.whatHappens.map((paragraph) => (
                <Text key={paragraph} style={styles.storyText}>{paragraph}</Text>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>怎么读懂</Text>
          <Text style={styles.insightText}>{section.insight}</Text>
        </View>

        {deepGuide ? (
          <View style={styles.deeperCard}>
            <Text style={styles.deeperLabel}>再往深一层</Text>
            <Text style={styles.deeperText}>{deepGuide.deeperReading}</Text>
            <Text style={styles.questionTitle}>读后自问</Text>
            {deepGuide.questions.map((question, index) => (
              <View key={question} style={styles.questionRow}>
                <Text style={styles.questionIndex}>{index + 1}</Text>
                <Text style={styles.questionText}>{question}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
        <View style={styles.tapTip}>
          <Text style={styles.tapTipMark}>字</Text>
          <Text style={styles.tapTipText}>
            {wordMode
              ? '先点词首，再点同一句的词尾，就能查任意多字词；连续点两次同一个字只查单字。'
              : '虚线重点词可直接点；打开右上角“选整词”后，可任选词首和词尾。'}
          </Text>
        </View>
        {section.units.map((unit, index) => {
          const card = getCard(progress, unit.id);
          return (
            <View
              key={unit.id}
              style={styles.unitCard}
            >
              <View style={styles.unitHeader}>
                <Text style={styles.unitNumber}>句对 {index + 1}</Text>
                <Text style={styles.unitStatus}>{masteryLabel(card)}</Text>
              </View>
              <ClassicalText
                lines={unit.lines}
                terms={getUnitGlossary(unit)}
                selectedText={inspector?.unitIndex === index ? inspector.selection : undefined}
                onTextPress={(selection) => setInspector({ selection, unitIndex: index })}
                wordMode={wordMode}
                lineStyle={styles.originalLine}
                containerStyle={styles.originalBlock}
              />
              <Text style={styles.translation}>{unit.translation}</Text>
              <View style={styles.unitFooter}>
                <Text style={styles.unitTapHint}>点字查读音和释义</Text>
                <Pressable
                  onPress={() => onStartSection(section.id, index)}
                  style={({ pressed }) => [styles.unitActionButton, pressed && styles.pressed]}
                >
                  <Text style={styles.unitAction}>从这里背 ›</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
      <CharacterInspector
        selection={inspector?.selection ?? null}
        unit={inspectorUnit}
        sectionTitle={`第 ${section.number} 章 · ${section.title}`}
        onClose={() => setInspector(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { minHeight: 74, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  headerSide: { width: 72 },
  headerAction: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15 },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: fonts.sans, fontSize: 13 },
  headerMode: { alignItems: 'flex-end' },
  headerModeText: { color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  headerModeTextActive: { color: colors.vermilion, fontWeight: '800' },
  content: { padding: spacing.lg, paddingBottom: 80 },
  eyebrow: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 31, fontWeight: '800', marginTop: 8 },
  stats: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, marginTop: 8 },
  primaryCard: { marginTop: 22, padding: 18, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  primaryLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.5 },
  overview: { color: colors.ink, fontFamily: fonts.body, fontSize: 16, lineHeight: 28, marginTop: 10 },
  backgroundCard: { marginTop: 14, padding: 17, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  deepLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  deepText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 25, marginTop: 9 },
  storyCard: { marginTop: 12, padding: 17, borderRadius: 17, backgroundColor: colors.jadeSoft, borderWidth: 1, borderColor: '#D4E1D8' },
  storyLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  storyText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 25, marginTop: 9 },
  insightCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  insightLabel: { color: colors.gold, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  insightText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 26, marginTop: 8 },
  deeperCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  deeperLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, fontWeight: '700' },
  deeperText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 8 },
  questionTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 16, fontWeight: '800', marginTop: 14 },
  questionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  questionIndex: { width: 18, color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, paddingTop: 3 },
  questionText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 22 },
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
  tapTip: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 12, borderRadius: 13, backgroundColor: colors.jadeSoft, marginBottom: 12 },
  tapTipMark: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.jade, color: colors.white, textAlign: 'center', fontFamily: fonts.title, fontSize: 16, fontWeight: '800', lineHeight: 28 },
  tapTipText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 20 },
  unitCard: { marginBottom: 12, padding: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  unitNumber: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1.2 },
  unitStatus: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  originalBlock: { marginTop: 12 },
  originalLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, lineHeight: 32, fontWeight: '600' },
  translation: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  unitFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  unitTapHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9 },
  unitActionButton: { minHeight: 34, paddingHorizontal: 12, borderRadius: 11, backgroundColor: colors.vermilionSoft, alignItems: 'center', justifyContent: 'center' },
  unitAction: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  pressed: { opacity: 0.68 },
});
