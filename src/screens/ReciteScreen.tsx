import * as Haptics from 'expo-haptics';
import React, { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LisaoUnit } from '../data/lisaoCurriculum';
import { sectionForUnit } from '../services/plan';
import { AppProgress, getCard, masteryLabel, ReviewRating } from '../services/progress';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  units: LisaoUnit[];
  initialIndex?: number;
  progress: AppProgress;
  onBack: () => void;
  onOpenSection: (sectionId: string) => void;
  onRate: (unitId: string, rating: ReviewRating) => Promise<void>;
}

const RATINGS: Array<{
  key: ReviewRating;
  label: string;
  hint: string;
  background: string;
  color: string;
}> = [
  { key: 'again', label: '不会', hint: '很快重来', background: colors.vermilionSoft, color: colors.vermilion },
  { key: 'hard', label: '模糊', hint: '需要多练', background: '#F5EAD8', color: colors.gold },
  { key: 'good', label: '背会', hint: '正常复习', background: colors.jadeSoft, color: colors.jade },
  { key: 'easy', label: '熟练', hint: '拉长间隔', background: '#E4ECE8', color: '#315448' },
];

function masks(line: string): string {
  const chars = Array.from(line.replace(/[\s\u3000，。！？；：、,.!?;:「」『』“”‘’（）()《》〈〉·\-—]/g, ''));
  if (!chars.length) return '';
  return `${chars[0]}${'○'.repeat(Math.min(12, Math.max(1, chars.length - 1)))}`;
}

function splitRetryKey(unitId: string): string {
  return `retry:${unitId}`;
}

export function ReciteScreen({
  units,
  initialIndex = 0,
  progress,
  onBack,
  onOpenSection,
  onRate,
}: Props) {
  const insets = useSafeAreaInsets();
  const initialQueue = useMemo(
    () => units.slice(Math.max(0, Math.min(initialIndex, Math.max(0, units.length - 1)))),
    [initialIndex, units],
  );
  const [queue, setQueue] = useState<LisaoUnit[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [translationVisible, setTranslationVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFeedback, setLastFeedback] = useState('');
  const [error, setError] = useState('');
  const retryAddedRef = useRef(new Set<string>());
  const completedRef = useRef(0);

  const currentUnit = queue[currentIndex];
  const currentSection = sectionForUnit(currentUnit);
  const currentCard = currentUnit ? getCard(progress, currentUnit.id) : null;
  const progressRatio = queue.length ? currentIndex / queue.length : 0;

  const grade = async (rating: ReviewRating) => {
    if (!currentUnit || busy) return;
    setBusy(true);
    setError('');
    try {
      void Haptics.impactAsync(
        rating === 'again' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      ).catch(() => undefined);
      await onRate(currentUnit.id, rating);
      completedRef.current += 1;
      let nextQueue = queue;
      if (rating === 'again' && !retryAddedRef.current.has(currentUnit.id)) {
        retryAddedRef.current.add(currentUnit.id);
        nextQueue = [...queue, currentUnit];
        setQueue(nextQueue);
        setRetryCount((value) => value + 1);
      }
      setLastFeedback(rating === 'again' ? '已放回本轮末尾' : rating === 'hard' ? '已记录为模糊' : '已记录');
      if (currentIndex + 1 >= nextQueue.length) {
        setFinished(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setRevealed(false);
        setTranslationVisible(false);
      }
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : '保存失败，请重试。');
    } finally {
      setBusy(false);
    }
  };

  if (!queue.length) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyTitle}>这个队列里没有句对</Text>
        <Pressable onPress={onBack} style={styles.finishButton}><Text style={styles.finishButtonText}>返回</Text></Pressable>
      </View>
    );
  }

  if (finished) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.finishLevel}>本轮完成</Text>
        <Text style={styles.finishTitle}>今日功夫已落下</Text>
        <Text style={styles.finishText}>
          本轮共处理 {completedRef.current} 次作答，新增 {retryCount} 个回炉句对。
          记忆曲线已经保存，下一次复习会自动排进今日安排。
        </Text>
        <Pressable onPress={onBack} style={styles.finishButton}><Text style={styles.finishButtonText}>回到今日</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 18) }]}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.headerSide}><Text style={styles.headerAction}>‹ 退出</Text></Pressable>
        <Text style={styles.headerTitle}>{currentIndex + 1} / {queue.length}</Text>
        <Pressable onPress={() => currentSection && onOpenSection(currentSection.id)} style={[styles.headerSide, styles.headerRight]}>
          <Text style={styles.headerAction}>看本章</Text>
        </Pressable>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{currentSection?.title}</Text>
        <Text style={styles.sectionSubtitle}>{currentSection?.subtitle}</Text>

        <Pressable onPress={() => setRevealed((value) => !value)} style={styles.card}>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta}>{masteryLabel(currentCard!)}</Text>
            <Text style={styles.cardMeta}>{currentUnit.lines.length} 句</Text>
          </View>
          <View style={styles.linesStage}>
            {currentUnit.lines.filter((line) => line !== '」').map((line, index) => (
              <Text key={`${currentUnit.id}-${index}`} style={revealed ? styles.fullLine : styles.maskedLine}>
                {revealed ? line : masks(line)}
              </Text>
            ))}
          </View>
          <Text style={styles.tapHint}>{revealed ? '轻触收起原文' : '先凭记忆背出，再轻触核对'}</Text>
        </Pressable>

        <View style={styles.toolRow}>
          <Pressable
            onPress={() => setTranslationVisible((value) => !value)}
            style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
          >
            <Text style={styles.toolButtonText}>{translationVisible ? '收起译意' : '看译意'}</Text>
          </Pressable>
          <Pressable
            onPress={() => setRevealed(true)}
            style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
          >
            <Text style={styles.toolButtonText}>看全文</Text>
          </Pressable>
          {retryCount > 0 ? <Text style={styles.retryLabel}>回炉 {retryCount}</Text> : null}
        </View>

        {translationVisible ? (
          <View style={styles.translationCard}>
            <Text style={styles.translationLabel}>这一组的意思</Text>
            <Text style={styles.translationText}>{currentUnit.translation}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!error && lastFeedback ? <Text style={styles.feedback}>{lastFeedback}</Text> : null}
      </ScrollView>

      <View style={[styles.ratingDock, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Text style={styles.ratingPrompt}>刚才背得怎么样？</Text>
        <View style={styles.ratingGrid}>
          {RATINGS.map((rating) => (
            <Pressable
              key={rating.key}
              disabled={busy}
              onPress={() => void grade(rating.key)}
              style={({ pressed }) => [
                styles.ratingButton,
                { backgroundColor: rating.background },
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              {busy ? <ActivityIndicator color={rating.color} /> : (
                <>
                  <Text style={[styles.ratingLabel, { color: rating.color }]}>{rating.label}</Text>
                  <Text style={[styles.ratingHint, { color: rating.color }]}>{rating.hint}</Text>
                </>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  center: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  header: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg },
  headerSide: { width: 76 },
  headerRight: { alignItems: 'flex-end' },
  headerAction: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14 },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: fonts.sans, fontSize: 12 },
  progressTrack: { height: 3, marginHorizontal: spacing.lg, backgroundColor: colors.line, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: colors.vermilion, borderRadius: radius.pill },
  scroll: { padding: spacing.lg, paddingBottom: 36 },
  sectionLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 1.2, textAlign: 'center', marginTop: 8 },
  sectionSubtitle: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 5 },
  card: { minHeight: 260, marginTop: 20, padding: 20, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  linesStage: { flex: 1, minHeight: 165, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  maskedLine: { color: colors.muted, fontFamily: fonts.title, fontSize: 25, letterSpacing: 7, lineHeight: 48, textAlign: 'center' },
  fullLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 25, lineHeight: 45, fontWeight: '700', textAlign: 'center' },
  tapHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center' },
  toolRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 },
  toolButton: { minHeight: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  toolButtonText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  retryLabel: { marginLeft: 'auto', color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10 },
  translationCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: '#F6EDE1', borderLeftWidth: 4, borderLeftColor: colors.gold },
  translationLabel: { color: colors.gold, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1.2 },
  translationText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 16, lineHeight: 27, marginTop: 8 },
  feedback: { color: colors.jade, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center', marginTop: 14 },
  errorText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, textAlign: 'center', marginTop: 14 },
  ratingDock: { paddingHorizontal: spacing.md, paddingTop: 12, backgroundColor: 'rgba(251,247,238,0.96)', borderTopWidth: 1, borderTopColor: colors.line, ...shadow },
  ratingPrompt: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, textAlign: 'center', marginBottom: 8 },
  ratingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ratingButton: { width: '48.5%', minHeight: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ratingLabel: { fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
  ratingHint: { fontFamily: fonts.sans, fontSize: 9, marginTop: 2, opacity: 0.8 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
  emptyTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 24, fontWeight: '800' },
  finishLevel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 2 },
  finishTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 31, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  finishText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 27, textAlign: 'center', marginTop: 14 },
  finishButton: { minHeight: 56, minWidth: 220, borderRadius: 16, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center', marginTop: 28, paddingHorizontal: 20 },
  finishButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 17, fontWeight: '800' },
});
