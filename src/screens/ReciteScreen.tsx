import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CharacterInspector } from '../components/CharacterInspector';
import { ClassicalText } from '../components/ClassicalText';
import { getUnitGlossary } from '../data/characterDictionary';
import { LisaoUnit } from '../data/lisaoCurriculum';
import { contextForUnit, insertRetry, sectionForUnit } from '../services/plan';
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
  { key: 'again', label: '不会', hint: '看讲解，隔一组回炉', background: colors.vermilionSoft, color: colors.vermilion },
  { key: 'hard', label: '要提示', hint: '看路标，隔两组再练', background: '#F5EAD8', color: colors.gold },
  { key: 'good', label: '能连背', hint: '前后文一起连', background: colors.jadeSoft, color: colors.jade },
  { key: 'easy', label: '成段熟背', hint: '整段已经顺下来', background: '#E4ECE8', color: '#315448' },
];

function masks(line: string): string {
  const chars = Array.from(line.replace(/[\s\u3000，。！？；：、,.!?;:「」『』“”‘’（）()《》〈〉·\-—]/g, ''));
  if (!chars.length) return '';
  return `${chars[0]}${'○'.repeat(Math.min(12, Math.max(1, chars.length - 1)))}`;
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
  const [inspector, setInspector] = useState<{ selection: string; unit: LisaoUnit } | null>(null);
  const [guideVisible, setGuideVisible] = useState(false);
  const [wordMode, setWordMode] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false);
  const retryCountsRef = useRef(new Map<string, number>());
  const completedRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  const currentUnit = queue[currentIndex];
  const currentSection = sectionForUnit(currentUnit);
  const currentCard = currentUnit ? getCard(progress, currentUnit.id) : null;
  const unitContext = useMemo(
    () => currentUnit ? contextForUnit(currentUnit) : {},
    [currentUnit],
  );
  const currentTerms = useMemo(
    () => currentUnit ? getUnitGlossary(currentUnit) : [],
    [currentUnit],
  );
  const previousTerms = useMemo(
    () => unitContext.previous ? getUnitGlossary(unitContext.previous) : [],
    [unitContext.previous],
  );
  const nextTerms = useMemo(
    () => unitContext.next ? getUnitGlossary(unitContext.next) : [],
    [unitContext.next],
  );
  const inspectorUnit = inspector?.unit ?? currentUnit;
  const inspectorSection = sectionForUnit(inspectorUnit);
  const progressRatio = queue.length ? currentIndex / queue.length : 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  useEffect(() => {
    if (!pendingAdvance) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 180);
    return () => clearTimeout(timer);
  }, [pendingAdvance]);

  const grade = async (rating: ReviewRating) => {
    if (!currentUnit || busy || !revealed) return;
    setBusy(true);
    setError('');
    try {
      void Haptics.impactAsync(
        rating === 'again' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      ).catch(() => undefined);
      await onRate(currentUnit.id, rating);
      completedRef.current += 1;
      let nextQueue = queue;
      const usedRetries = retryCountsRef.current.get(currentUnit.id) ?? 0;
      const retryLimit = rating === 'again' ? 2 : rating === 'hard' ? 1 : 0;
      if (usedRetries < retryLimit) {
        retryCountsRef.current.set(currentUnit.id, usedRetries + 1);
        nextQueue = insertRetry(queue, currentIndex, currentUnit, rating === 'again' ? 1 : 2);
        setQueue(nextQueue);
        setRetryCount((value) => value + 1);
      }
      const continueStudy = rating === 'again' || rating === 'hard';
      setLastFeedback(continueStudy
        ? '先看译意和背诵路标，再把本轮前后接起来'
        : '已记录，下一轮继续从前后文接住整段');
      if (continueStudy) {
        setPendingAdvance(true);
        setRevealed(true);
        setTranslationVisible(true);
        setGuideVisible(true);
      } else if (currentIndex + 1 >= nextQueue.length) {
        setFinished(true);
      } else {
        setCurrentIndex(currentIndex + 1);
        setRevealed(false);
        setTranslationVisible(false);
        setGuideVisible(false);
        setWordMode(false);
        setInspector(null);
      }
    } catch (gradeError) {
      setError(gradeError instanceof Error ? gradeError.message : '保存失败，请重试。');
    } finally {
      setBusy(false);
    }
  };

  const continueAfterStudy = () => {
    setPendingAdvance(false);
    if (currentIndex + 1 >= queue.length) {
      setFinished(true);
      return;
    }
    setCurrentIndex(currentIndex + 1);
    setRevealed(false);
    setTranslationVisible(false);
    setGuideVisible(false);
    setWordMode(false);
    setInspector(null);
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
          今日安排了 {initialQueue.length} 个连续句对，本轮共作答 {completedRef.current} 次，回炉 {retryCount} 次。
          评分和前后文进度已经保存，下一次复习会自动排进今日安排。
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

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{currentSection?.title}</Text>
        <Text style={styles.sectionSubtitle}>{currentSection?.subtitle}</Text>
        <Text style={styles.contextRoute}>前后文夹住本轮　上文 → 本轮 → 下文</Text>

        {unitContext.previous ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>上文 · 从这里接过来</Text>
            <ClassicalText
              lines={unitContext.previous.lines}
              terms={previousTerms}
              selectedText={inspector?.unit.id === unitContext.previous.id ? inspector.selection : undefined}
              onTextPress={(selection) => setInspector({ selection, unit: unitContext.previous! })}
              wordMode={wordMode}
              lineStyle={styles.contextLine}
            />
          </View>
        ) : (
          <View style={styles.contextStart}>
            <Text style={styles.contextLabel}>开篇 · 从这里起句</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMeta}>{masteryLabel(currentCard!)}</Text>
            <Text style={styles.cardMeta}>{currentUnit.lines.length} 句</Text>
          </View>
          {revealed ? (
            <ClassicalText
              lines={currentUnit.lines}
              terms={currentTerms}
              selectedText={inspector?.unit.id === currentUnit.id ? inspector.selection : undefined}
              onTextPress={(selection) => setInspector({ selection, unit: currentUnit })}
              wordMode={wordMode}
              containerStyle={styles.linesStage}
              lineStyle={styles.fullLine}
            />
          ) : (
            <Pressable onPress={() => setRevealed(true)} style={styles.linesStage}>
              {currentUnit.lines.filter((line) => line !== '」').map((line, index) => (
                <Text key={`${currentUnit.id}-${index}`} style={styles.maskedLine}>
                  {masks(line)}
                </Text>
              ))}
            </Pressable>
          )}
          <Pressable onPress={() => setRevealed((value) => !value)}>
            <Text style={styles.tapHint}>
              {revealed
                ? (wordMode
                    ? '先点词首，再点词尾即可查整词 · 点这里收起'
                    : '虚线重点词可直接点，单字也可点 · 点这里收起')
                : '先看上文和下文，背出本轮；轻触核对'}
            </Text>
          </Pressable>
        </View>

        {unitContext.next ? (
          <View style={styles.nextCard}>
            <View style={styles.nextHeading}>
              <Text style={styles.nextLabel}>下文 · 背完本轮接这里</Text>
              <Text style={styles.nextMeta}>{revealed ? '前后连读' : '下文提示'}</Text>
            </View>
            <ClassicalText
              lines={unitContext.next.lines}
              terms={nextTerms}
              selectedText={inspector?.unit.id === unitContext.next.id ? inspector.selection : undefined}
              onTextPress={(selection) => setInspector({ selection, unit: unitContext.next! })}
              wordMode={wordMode}
              lineStyle={styles.nextLine}
            />
          </View>
        ) : (
          <View style={styles.contextStart}>
            <Text style={styles.contextLabel}>本章收束 · 背到这里停一拍</Text>
          </View>
        )}

        <View style={styles.toolRow}>
          <Pressable
            onPress={() => setTranslationVisible((value) => !value)}
            style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
          >
            <Text style={styles.toolButtonText}>{translationVisible ? '收起译意' : '看译意'}</Text>
          </Pressable>
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
          >
            <Text style={styles.toolButtonText}>{revealed ? '收起原文' : '看全文'}</Text>
          </Pressable>
          <Pressable
            onPress={() => setGuideVisible((value) => !value)}
            style={({ pressed }) => [styles.toolButton, pressed && styles.pressed]}
          >
            <Text style={styles.toolButtonText}>{guideVisible ? '收起脉络' : '本章脉络'}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: wordMode }}
            onPress={() => {
              setRevealed(true);
              setWordMode((value) => !value);
            }}
            style={({ pressed }) => [styles.toolButton, wordMode && styles.toolButtonActive, pressed && styles.pressed]}
          >
            <Text style={[styles.toolButtonText, wordMode && styles.toolButtonTextActive]}>
              {wordMode ? '选词中' : '任选整词'}
            </Text>
          </Pressable>
          {retryCount > 0 ? <Text style={styles.retryLabel}>回炉 {retryCount} 次 · 隔组再练</Text> : null}
        </View>

        {guideVisible && currentSection ? (
          <View style={styles.guideCard}>
            <Text style={styles.translationLabel}>这一段讲什么</Text>
            <Text style={styles.guideText}>{currentSection.overview}</Text>
            <Text style={styles.guideLabel}>背诵路标</Text>
            <Text style={styles.guideText}>{currentSection.memoryGuide}</Text>
          </View>
        ) : null}

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
        <Text style={styles.ratingPrompt}>
          {pendingAdvance
            ? '先弄懂这一组：看完译意和背诵路标，再继续'
            : revealed
              ? '上文 → 本轮 → 下文，刚才连得怎么样？'
              : '先轻触上方核对，再按整段连背表现评分'}
        </Text>
        {pendingAdvance ? (
          <Pressable
            onPress={continueAfterStudy}
            style={({ pressed }) => [styles.studyContinueButton, pressed && styles.pressed]}
          >
            <Text style={styles.studyContinueText}>看完讲解，继续下一组</Text>
          </Pressable>
        ) : (
          <View style={styles.ratingGrid}>
            {RATINGS.map((rating) => (
              <Pressable
                key={rating.key}
                disabled={busy || !revealed}
                onPress={() => void grade(rating.key)}
                style={({ pressed }) => [
                  styles.ratingButton,
                  { backgroundColor: rating.background },
                  pressed && styles.pressed,
                  (busy || !revealed) && styles.disabled,
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
        )}
      </View>
      <CharacterInspector
        selection={inspector?.selection ?? null}
        unit={inspectorUnit}
        sectionTitle={inspectorSection
          ? `第 ${inspectorSection.number} 章 · ${inspectorSection.title}`
          : undefined}
        onClose={() => setInspector(null)}
      />
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
  contextRoute: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1, textAlign: 'center', marginTop: 10 },
  contextCard: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 15, backgroundColor: colors.jadeSoft, borderLeftWidth: 3, borderLeftColor: colors.jade },
  contextLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  contextLine: { color: colors.inkSoft, fontFamily: fonts.title, fontSize: 17, lineHeight: 29 },
  contextStart: { marginTop: 14, paddingHorizontal: 16, paddingVertical: 11, borderRadius: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  card: { minHeight: 260, marginTop: 20, padding: 20, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10 },
  linesStage: { flex: 1, minHeight: 165, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  maskedLine: { color: colors.muted, fontFamily: fonts.title, fontSize: 25, letterSpacing: 7, lineHeight: 48, textAlign: 'center' },
  fullLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 25, lineHeight: 45, fontWeight: '700', textAlign: 'center' },
  tapHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, textAlign: 'center' },
  nextCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderWidth: 1, borderColor: '#E8D7C0' },
  nextHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextLabel: { color: colors.gold, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  nextMeta: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9 },
  nextLine: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, lineHeight: 34, marginTop: 8 },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9, marginTop: 12 },
  toolButton: { minHeight: 38, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  toolButtonText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  toolButtonActive: { borderColor: colors.vermilion, backgroundColor: colors.vermilionSoft },
  toolButtonTextActive: { color: colors.vermilion },
  retryLabel: { marginLeft: 'auto', color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10 },
  guideCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.jadeSoft, borderLeftWidth: 4, borderLeftColor: colors.jade },
  guideLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1.2, marginTop: 12 },
  guideText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, marginTop: 6 },
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
  studyContinueButton: { minHeight: 58, borderRadius: 14, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  studyContinueText: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.98 }] },
  emptyTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 24, fontWeight: '800' },
  finishLevel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, letterSpacing: 2 },
  finishTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 31, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  finishText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 27, textAlign: 'center', marginTop: 14 },
  finishButton: { minHeight: 56, minWidth: 220, borderRadius: 16, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center', marginTop: 28, paddingHorizontal: 20 },
  finishButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 17, fontWeight: '800' },
});
