import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UpdateCard } from '../components/UpdateCard';
import { LISAO_SECTIONS, LISAO_UNITS } from '../data/lisaoCurriculum';
import {
  AiSettings,
  DEFAULT_AI_SETTINGS,
  clearAiContextCache,
  loadAiSettings,
  saveAiSettings,
} from '../services/aiContext';
import {
  AppProgress,
  dueLabel,
  getCard,
  getLearnedUnits,
  masteryLabel,
  summarizeProgress,
} from '../services/progress';
import { INSTALLED_VERSION } from '../services/updates';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  progress: AppProgress;
  onSetDailyTarget: (target: number) => void;
  onOpenUnit: (sectionId: string, unitIndex: number) => void;
  onReset: () => void;
}

const TARGETS = [4, 8, 12, 16];

export function MineScreen({ progress, onSetDailyTarget, onOpenUnit, onReset }: Props) {
  const insets = useSafeAreaInsets();
  const [showAllLearned, setShowAllLearned] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const summary = useMemo(() => summarizeProgress(progress), [progress]);
  const learned = useMemo(() => getLearnedUnits(progress), [progress]);
  const reviewedEvents = progress.history.length;
  const againCount = progress.history.filter((event) => event.rating === 'again').length;
  const recent = progress.history.slice(0, 6);
  const todayKey = new Date().toDateString();
  const todayUnitIds = new Set(
    progress.history
      .filter((event) => new Date(event.reviewedAt).toDateString() === todayKey)
      .map((event) => event.unitId),
  );
  const visibleLearned = showAllLearned ? learned : learned.slice(0, 8);

  useEffect(() => {
    void loadAiSettings()
      .then(setAiSettings)
      .catch(() => setAiMessage('读取 AI 设置失败，请重新填写。'));
  }, []);

  const saveAi = async () => {
    setAiSaving(true);
    setAiMessage('');
    try {
      const saved = await saveAiSettings(aiSettings);
      setAiSettings(saved);
      setAiMessage('已保存。回到原文点任意字或任选词语即可判断。');
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : '保存失败。');
    } finally {
      setAiSaving(false);
    }
  };

  const clearAiCache = async () => {
    try {
      await clearAiContextCache();
      setAiMessage('AI 释义缓存已清除，下次查询会重新请求。');
    } catch {
      setAiMessage('清除缓存失败。');
    }
  };

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

        <View style={styles.todayCard}>
          <View>
            <Text style={styles.todayLabel}>今天真正背过</Text>
            <Text style={styles.todayValue}>{todayUnitIds.size}<Text style={styles.todayUnit}> 个句对</Text></Text>
          </View>
          <Text style={styles.todayHint}>这里统计今天有作答记录的句对；只打开页面不会计入。</Text>
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

        <Text style={styles.blockTitle}>AI 本句释义</Text>
        <Text style={styles.blockHint}>配置 OpenAI 兼容接口。Key 只保存在这台手机上，不会写入源码或上传。</Text>
        <View style={styles.aiSettingsCard}>
          <Text style={styles.aiFieldLabel}>API 地址</Text>
          <TextInput
            value={aiSettings.baseUrl}
            onChangeText={(baseUrl) => setAiSettings((value) => ({ ...value, baseUrl }))}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://api.deepseek.com/v1"
            placeholderTextColor={colors.muted}
            style={styles.aiInput}
          />
          <Text style={styles.aiFieldLabel}>模型</Text>
          <TextInput
            value={aiSettings.model}
            onChangeText={(model) => setAiSettings((value) => ({ ...value, model }))}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="deepseek-chat"
            placeholderTextColor={colors.muted}
            style={styles.aiInput}
          />
          <Text style={styles.aiFieldLabel}>API Key</Text>
          <TextInput
            value={aiSettings.apiKey}
            onChangeText={(apiKey) => setAiSettings((value) => ({ ...value, apiKey }))}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="填写你的 API Key"
            placeholderTextColor={colors.muted}
            style={styles.aiInput}
          />
          <Text style={styles.aiSettingsHint}>默认按 DeepSeek 填写；也可换成任何支持 /chat/completions 的兼容接口。</Text>
          <View style={styles.aiActionRow}>
            <Pressable
              disabled={aiSaving}
              onPress={() => void saveAi()}
              style={({ pressed }) => [styles.aiSaveButton, pressed && styles.pressed, aiSaving && styles.disabled]}
            >
              {aiSaving
                ? <ActivityIndicator color={colors.white} size="small" />
                : <Text style={styles.aiSaveText}>保存 AI 设置</Text>}
            </Pressable>
            <Pressable onPress={() => void clearAiCache()} style={({ pressed }) => [styles.aiClearButton, pressed && styles.pressed]}>
              <Text style={styles.aiClearText}>清除释义缓存</Text>
            </Pressable>
          </View>
          {aiMessage ? <Text style={styles.aiMessage}>{aiMessage}</Text> : null}
        </View>

        <Text style={styles.blockTitle}>学习记录</Text>
        <View style={styles.recordCard}>
          <RecordRow label="累计作答" value={`${reviewedEvents} 次`} />
          <RecordRow label="回炉次数" value={`${againCount} 次`} />
          <RecordRow label="全文规模" value={`${LISAO_UNITS.length} 句对 / 382 句`} />
          <RecordRow label="当前版本" value={INSTALLED_VERSION} last />
        </View>

        <Text style={styles.blockTitle}>最近复习</Text>
        <View style={styles.recordCard}>
          {recent.length ? recent.map((event, index) => (
            <RecentRow
              key={`${event.reviewedAt}-${event.unitId}`}
              event={event}
              last={index === recent.length - 1}
              onPress={() => {
                const item = learned.find((learnedItem) => learnedItem.unit.id === event.unitId);
                if (item) onOpenUnit(item.sectionId, item.sectionUnitIndex);
              }}
            />
          )) : <Text style={styles.empty}>还没有复习记录。</Text>}
        </View>

        <View style={styles.learnedHeader}>
          <View>
            <Text style={styles.blockTitleInline}>已经学了什么</Text>
            <Text style={styles.blockHint}>按最近作答排序，点一句可以直接再背。</Text>
          </View>
          <Text style={styles.learnedCount}>{learned.length} 句对</Text>
        </View>
        {visibleLearned.length ? (
          <>
            {visibleLearned.map((item) => {
              const card = getCard(progress, item.unit.id);
              return (
                <Pressable
                  key={item.unit.id}
                  onPress={() => onOpenUnit(item.sectionId, item.sectionUnitIndex)}
                  style={({ pressed }) => [styles.learnedCard, pressed && styles.pressed]}
                >
                  <View style={styles.learnedTop}>
                    <Text style={styles.learnedSection}>第 {item.sectionNumber} 章 · {item.sectionTitle}</Text>
                    <Text style={styles.learnedStatus}>{masteryLabel(card)}</Text>
                  </View>
                  <Text style={styles.learnedText} numberOfLines={2}>{item.unit.lines.join('')}</Text>
                  <Text style={styles.learnedTranslation} numberOfLines={2}>{item.unit.translation}</Text>
                  <View style={styles.learnedBottom}>
                    <Text style={styles.learnedMeta}>
                      上次：{ratingText(item.lastRating)} · {formatReviewedAt(item.lastReviewedAt)}
                    </Text>
                    <Text style={styles.learnedDue}>{dueLabel(card)}</Text>
                  </View>
                </Pressable>
              );
            })}
            {learned.length > 8 ? (
              <Pressable
                onPress={() => setShowAllLearned((value) => !value)}
                style={({ pressed }) => [styles.showAllButton, pressed && styles.pressed]}
              >
                <Text style={styles.showAllText}>
                  {showAllLearned ? '收起列表' : `查看全部 ${learned.length} 个已学句对`}
                </Text>
              </Pressable>
            ) : null}
          </>
        ) : (
          <View style={styles.emptyLearnedCard}>
            <Text style={styles.emptyLearnedTitle}>还没有背过任何句对</Text>
            <Text style={styles.emptyLearnedText}>从“今日”开始学习；有评分后，这里会显示具体原句、掌握程度和下次复习时间。</Text>
          </View>
        )}

        <UpdateCard />

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

function RecentRow({
  event,
  last,
  onPress,
}: {
  event: AppProgress['history'][number];
  last: boolean;
  onPress: () => void;
}) {
  const unit = LISAO_UNITS.find((item) => item.id === event.unitId);
  const sectionTitle = learnedSectionTitle(unit?.sectionId);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.recentRow, last && styles.rowLast, pressed && styles.pressed]}>
      <View style={styles.recentCopy}>
        <Text style={styles.recentSection}>{sectionTitle}</Text>
        <Text style={styles.recentUnit} numberOfLines={1}>{unit?.lines.join('') ?? '已删除的旧学习内容'}</Text>
        <Text style={styles.recentTime}>
          {formatReviewedAt(event.reviewedAt)} · 下次 {formatDueAt(event.dueAt)}
        </Text>
      </View>
      <Text style={[styles.recentRating, event.rating === 'again' && styles.recentAgain]}>{ratingText(event.rating)}</Text>
    </Pressable>
  );
}

function learnedSectionTitle(sectionId: string | undefined): string {
  if (!sectionId) return '离骚';
  const section = LISAO_SECTIONS.find((item) => item.id === sectionId);
  return section ? `第 ${section.number} 章 · ${section.title}` : sectionId;
}

function RecordRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.recordRow, last && styles.rowLast]}>
      <Text style={styles.recordLabel}>{label}</Text>
      <Text style={styles.recordValue}>{value}</Text>
    </View>
  );
}

function formatReviewedAt(value: string): string {
  return new Date(value).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDueAt(value: string): string {
  const date = new Date(value);
  const now = new Date();
  if (date.getTime() <= now.getTime()) return '现在';
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ratingText(rating: string): string {
  if (rating === 'again') return '不会';
  if (rating === 'hard') return '要提示';
  if (rating === 'good') return '能连背';
  return '成段熟背';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 130 },
  eyebrow: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1.2 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 38, fontWeight: '800', letterSpacing: 4, marginTop: 8 },
  subtitle: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 24, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  stat: { width: '47.5%', minHeight: 92, padding: 15, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  statValue: { color: colors.ink, fontFamily: fonts.title, fontSize: 27, fontWeight: '800' },
  statLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  todayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.vermilionSoft, borderWidth: 1, borderColor: '#E8CBC7' },
  todayLabel: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  todayValue: { color: colors.ink, fontFamily: fonts.title, fontSize: 27, fontWeight: '800', marginTop: 4 },
  todayUnit: { color: colors.muted, fontFamily: fonts.sans, fontSize: 12, fontWeight: '400' },
  todayHint: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 11, lineHeight: 18, textAlign: 'right' },
  blockTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 20, fontWeight: '800', marginTop: 28 },
  blockTitleInline: { color: colors.ink, fontFamily: fonts.title, fontSize: 20, fontWeight: '800' },
  blockHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, lineHeight: 18, marginTop: 6 },
  targetRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  target: { flex: 1, minHeight: 66, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  targetActive: { borderColor: colors.vermilion, backgroundColor: colors.vermilionSoft },
  targetValue: { color: colors.inkSoft, fontFamily: fonts.title, fontSize: 20, fontWeight: '800' },
  targetValueActive: { color: colors.vermilion },
  targetLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9, marginTop: 2 },
  aiSettingsCard: { marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  aiFieldLabel: { color: colors.ink, fontFamily: fonts.body, fontSize: 13, fontWeight: '700', marginTop: 10 },
  aiInput: { minHeight: 46, marginTop: 6, paddingHorizontal: 12, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, color: colors.ink, fontFamily: fonts.sans, fontSize: 13 },
  aiSettingsHint: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, lineHeight: 18, marginTop: 10 },
  aiActionRow: { flexDirection: 'row', gap: 8, marginTop: 13 },
  aiSaveButton: { flex: 1.2, minHeight: 46, borderRadius: 12, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  aiSaveText: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  aiClearButton: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  aiClearText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  aiMessage: { color: colors.jade, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 10 },
  recordCard: { marginTop: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 16 },
  recordRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  recordLabel: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14 },
  recordValue: { color: colors.jade, fontFamily: fonts.sans, fontSize: 12 },
  rowLast: { borderBottomWidth: 0 },
  recentRow: { minHeight: 80, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  recentCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  recentSection: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10 },
  recentUnit: { color: colors.ink, fontFamily: fonts.title, fontSize: 14, lineHeight: 21, marginTop: 4 },
  recentTime: { color: colors.muted, fontFamily: fonts.sans, fontSize: 9, lineHeight: 15, marginTop: 4 },
  recentRating: { color: colors.jade, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  recentAgain: { color: colors.vermilion },
  empty: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, paddingVertical: 20 },
  learnedHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 28 },
  learnedCount: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, paddingBottom: 2 },
  learnedCard: { marginTop: 10, padding: 15, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  learnedTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  learnedSection: { flex: 1, color: colors.jade, fontFamily: fonts.sans, fontSize: 10, lineHeight: 16 },
  learnedStatus: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10 },
  learnedText: { color: colors.ink, fontFamily: fonts.title, fontSize: 17, lineHeight: 28, marginTop: 8 },
  learnedTranslation: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 5 },
  learnedBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  learnedMeta: { flex: 1, color: colors.muted, fontFamily: fonts.sans, fontSize: 9 },
  learnedDue: { color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, fontWeight: '700' },
  showAllButton: { minHeight: 46, marginTop: 10, borderRadius: 13, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  showAllText: { color: colors.jade, fontFamily: fonts.body, fontSize: 13, fontWeight: '700' },
  emptyLearnedCard: { padding: 16, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, marginTop: 12 },
  emptyLearnedTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 16, fontWeight: '800' },
  emptyLearnedText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 22, marginTop: 6 },
  aboutCard: { marginTop: 28, padding: 16, borderRadius: 16, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  aboutTitle: { color: colors.gold, fontFamily: fonts.body, fontSize: 15, fontWeight: '800' },
  aboutText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 23, marginTop: 8 },
  resetButton: { minHeight: 50, marginTop: 20, borderRadius: 14, borderWidth: 1, borderColor: '#D7B7B2', alignItems: 'center', justifyContent: 'center' },
  resetText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
});
