import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LISAO_INTRODUCTION } from '../data/lisaoGuide';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  onBack: () => void;
}

export function GuideScreen({ onBack }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 18) }]}>
        <Pressable onPress={onBack} style={styles.headerSide}>
          <Text style={styles.headerAction}>‹ 返回</Text>
        </Pressable>
        <Text style={styles.headerTitle}>全篇导读</Text>
        <View style={styles.headerSide} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>读原典之前，先搭好理解的骨架</Text>
        <Text style={styles.title}>{LISAO_INTRODUCTION.title}</Text>
        <Text style={styles.subtitle}>{LISAO_INTRODUCTION.subtitle}</Text>

        {LISAO_INTRODUCTION.opening.map((paragraph, index) => (
          <Text key={`opening-${index}`} style={styles.opening}>{paragraph}</Text>
        ))}

        <Text style={styles.blockTitle}>先记住这六件事</Text>
        <View style={styles.factCard}>
          {LISAO_INTRODUCTION.quickFacts.map((fact, index) => (
            <View key={fact} style={[styles.factRow, index === LISAO_INTRODUCTION.quickFacts.length - 1 && styles.rowLast]}>
              <Text style={styles.factIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.blockTitle}>屈原与楚国：历史背景</Text>
        <Text style={styles.blockIntro}>
          下面按“国家危机—政治改革—遭谗放逐—以身守志”的线索梳理。年代细节有争议，这里采用教材和传统史学中最常见的叙述。
        </Text>
        <View style={styles.timeline}>
          {LISAO_INTRODUCTION.timeline.map((item, index) => (
            <View key={item.title} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View style={styles.timelineDot}><Text style={styles.timelineNumber}>{index + 1}</Text></View>
                {index < LISAO_INTRODUCTION.timeline.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>
              <View style={styles.timelineCard}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.blockTitle}>全篇怎么走</Text>
        {LISAO_INTRODUCTION.structure.map((item) => (
          <View key={item.title} style={styles.structureCard}>
            <View style={styles.structureTop}>
              <Text style={styles.structureTitle}>{item.title}</Text>
              <Text style={styles.structureRange}>{item.range}</Text>
            </View>
            <Text style={styles.structureText}>{item.text}</Text>
          </View>
        ))}

        <Text style={styles.blockTitle}>真正读懂它的六个方法</Text>
        <View style={styles.methodCard}>
          {LISAO_INTRODUCTION.readingMethods.map((method, index) => (
            <View key={method.title} style={[styles.methodRow, index === LISAO_INTRODUCTION.readingMethods.length - 1 && styles.rowLast]}>
              <Text style={styles.methodIndex}>{String(index + 1).padStart(2, '0')}</Text>
              <View style={styles.methodCopy}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodText}>{method.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.blockTitle}>不要把有争议的解释说死</Text>
        <View style={styles.cautionCard}>
          {LISAO_INTRODUCTION.interpretiveCaution.map((item) => (
            <View key={item} style={styles.cautionRow}>
              <Text style={styles.cautionDot}>·</Text>
              <Text style={styles.cautionText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={onBack} style={styles.finishButton}>
          <Text style={styles.finishButtonText}>带着这些线索进入分章精读</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  header: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  headerSide: { width: 72 },
  headerAction: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15 },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: fonts.sans, fontSize: 13 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 70 },
  eyebrow: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.1 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 34, fontWeight: '800', marginTop: 9 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 16, lineHeight: 27, marginTop: 10 },
  opening: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 27, marginTop: 14 },
  blockTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 21, fontWeight: '800', marginTop: 30, marginBottom: 11 },
  blockIntro: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 22, marginTop: -3, marginBottom: 12 },
  factCard: { paddingHorizontal: 16, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, ...shadow },
  factRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rowLast: { borderBottomWidth: 0 },
  factIndex: { width: 30, color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, paddingTop: 4 },
  factText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', alignItems: 'stretch' },
  timelineRail: { width: 34, alignItems: 'center' },
  timelineDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  timelineNumber: { color: colors.white, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700' },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#D8CABB' },
  timelineCard: { flex: 1, marginLeft: 10, marginBottom: 12, padding: 15, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  timelineTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 17, fontWeight: '800' },
  timelineText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 6 },
  structureCard: { marginBottom: 10, padding: 15, borderRadius: 15, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  structureTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  structureTitle: { flex: 1, color: colors.ink, fontFamily: fonts.title, fontSize: 17, fontWeight: '800' },
  structureRange: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, paddingTop: 4 },
  structureText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 7 },
  methodCard: { paddingHorizontal: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  methodRow: { flexDirection: 'row', paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  methodIndex: { width: 30, color: colors.jade, fontFamily: fonts.sans, fontSize: 10, paddingTop: 4 },
  methodCopy: { flex: 1 },
  methodTitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 15, fontWeight: '800' },
  methodText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 4 },
  cautionCard: { padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  cautionRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  cautionDot: { color: colors.gold, fontFamily: fonts.title, fontSize: 18, lineHeight: 24 },
  cautionText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24 },
  finishButton: { minHeight: 56, marginTop: 28, borderRadius: 16, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  finishButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '800', textAlign: 'center' },
});
