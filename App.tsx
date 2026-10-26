import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTab, MainTabBar } from './src/components/MainTabBar';
import { LISAO_SECTIONS, LisaoUnit } from './src/data/lisaoCurriculum';
import { buildQueueForAction, HomeAction } from './src/services/plan';
import {
  AppProgress,
  createInitialProgress,
  loadProgress,
  rateUnit,
  ReviewRating,
  saveProgress,
} from './src/services/progress';
import { MineScreen } from './src/screens/MineScreen';
import { ReciteScreen } from './src/screens/ReciteScreen';
import { SectionDetailScreen } from './src/screens/SectionDetailScreen';
import { SectionsScreen } from './src/screens/SectionsScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { GuideScreen } from './src/screens/GuideScreen';
import { colors, fonts, radius, shadow, spacing } from './src/theme';

interface Session {
  units: LisaoUnit[];
  initialIndex: number;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const [progress, setProgress] = useState<AppProgress>(createInitialProgress);
  const progressRef = useRef(progress);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<MainTab>('today');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [guideVisible, setGuideVisible] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState('');
  const [resetVisible, setResetVisible] = useState(false);

  useEffect(() => {
    void loadProgress().then((value) => {
      progressRef.current = value;
      setProgress(value);
      setLoading(false);
    });
  }, []);

  const updateProgress = useCallback(async (next: AppProgress) => {
    progressRef.current = next;
    setProgress(next);
    await saveProgress(next);
  }, []);

  const closeOverlay = useCallback(() => {
    setSession(null);
    setSectionId(null);
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (session) {
        setSession(null);
        return true;
      }
      if (sectionId) {
        setSectionId(null);
        return true;
      }
      if (guideVisible) {
        setGuideVisible(false);
        return true;
      }
      if (tab !== 'today') {
        setTab('today');
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [guideVisible, sectionId, session, tab]);

  const startAction = useCallback((action: HomeAction) => {
    const units = buildQueueForAction(progressRef.current, action);
    if (!units.length) {
      setError(action === 'review' ? '当前没有到期复习。' : '当前没有可学习的句对。');
      return;
    }
    setError('');
    setSession({ units, initialIndex: 0 });
  }, []);

  const openSection = useCallback((id: string) => {
    setSession(null);
    setGuideVisible(false);
    setSectionId(id);
  }, []);

  const openGuide = useCallback(() => {
    setSession(null);
    setSectionId(null);
    setGuideVisible(true);
  }, []);

  const startSection = useCallback((id: string, unitIndex: number) => {
    const section = LISAO_SECTIONS.find((item) => item.id === id);
    if (!section) return;
    setError('');
    setSession({ units: section.units, initialIndex: unitIndex });
  }, []);

  const startAll = useCallback(() => {
    const units = buildQueueForAction(progressRef.current, 'all');
    setError('');
    setSession({ units, initialIndex: 0 });
  }, []);

  const handleRate = useCallback(async (unitId: string, rating: ReviewRating) => {
    try {
      const next = rateUnit(progressRef.current, unitId, rating);
      await updateProgress(next);
      setError('');
    } catch (ratingError) {
      const message = ratingError instanceof Error ? ratingError.message : '保存学习进度失败。';
      setError(message);
      throw ratingError;
    }
  }, [updateProgress]);

  const setDailyTarget = useCallback(async (target: number) => {
    try {
      await updateProgress({ ...progressRef.current, dailyTarget: target });
      setError('');
    } catch (targetError) {
      setError(targetError instanceof Error ? targetError.message : '保存每日目标失败。');
    }
  }, [updateProgress]);

  const resetProgress = useCallback(async () => {
    setResetVisible(false);
    try {
      await updateProgress(createInitialProgress());
      setError('');
      setSession(null);
      setSectionId(null);
      setGuideVisible(false);
      setTab('today');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : '清除学习记录失败。');
    }
  }, [updateProgress]);

  const activeSection = sectionId ? LISAO_SECTIONS.find((section) => section.id === sectionId) : null;

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingMark}>骚</Text>
        <ActivityIndicator color={colors.vermilion} />
        <Text style={styles.loadingText}>正在打开学习档案…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {tab === 'today' ? <TodayScreen progress={progress} onStart={startAction} onOpenSection={openSection} onOpenUnit={startSection} /> : null}
        {tab === 'sections' ? <SectionsScreen progress={progress} onOpenSection={openSection} onOpenGuide={openGuide} onStartAll={startAll} /> : null}
        {tab === 'mine' ? (
          <MineScreen
            progress={progress}
            onSetDailyTarget={(target) => void setDailyTarget(target)}
            onOpenUnit={startSection}
            onReset={() => setResetVisible(true)}
          />
        ) : null}
      </View>
      {!session && !activeSection && !guideVisible ? <MainTabBar active={tab} onChange={setTab} /> : null}

      {guideVisible && !session ? (
        <View style={styles.overlay}>
          <GuideScreen onBack={() => setGuideVisible(false)} />
        </View>
      ) : null}

      {activeSection && !session ? (
        <View style={styles.overlay}>
          <SectionDetailScreen
            section={activeSection}
            progress={progress}
            onBack={() => setSectionId(null)}
            onStartSection={startSection}
          />
        </View>
      ) : null}

      {session ? (
        <View style={styles.overlay}>
          <ReciteScreen
            units={session.units}
            initialIndex={session.initialIndex}
            progress={progress}
            onBack={() => setSession(null)}
            onOpenSection={openSection}
            onRate={handleRate}
          />
        </View>
      ) : null}

      {error && !session ? (
        <Pressable onPress={() => setError('')} style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </Pressable>
      ) : null}

      <Modal visible={resetVisible} transparent animationType="fade" onRequestClose={() => setResetVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setResetVisible(false)} />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>清除全部学习记录？</Text>
            <Text style={styles.dialogText}>章节进度、复习日期和作答历史都会删除，无法恢复。</Text>
            <View style={styles.dialogActions}>
              <Pressable onPress={() => setResetVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>取消</Text>
              </Pressable>
              <Pressable onPress={() => void resetProgress()} style={styles.confirmButton}>
                <Text style={styles.confirmText}>确定清除</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.paper },
  content: { flex: 1 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20, backgroundColor: colors.paper },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  loadingMark: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 54, fontWeight: '800', marginBottom: 18 },
  loadingText: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, marginTop: 12 },
  errorBanner: { position: 'absolute', left: 18, right: 18, bottom: 84, zIndex: 30, padding: 12, borderRadius: 12, backgroundColor: colors.vermilion, ...shadow },
  errorText: { color: colors.white, fontFamily: fonts.body, fontSize: 12, lineHeight: 19, textAlign: 'center' },
  modalRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(35,29,24,0.42)' },
  dialog: { width: '100%', maxWidth: 360, padding: spacing.lg, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow },
  dialogTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 23, fontWeight: '800', textAlign: 'center' },
  dialogText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 24, textAlign: 'center', marginTop: 12 },
  dialogActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelButton: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper },
  cancelText: { color: colors.ink, fontFamily: fonts.body, fontSize: 15, fontWeight: '700' },
  confirmButton: { flex: 1, minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.vermilion },
  confirmText: { color: colors.white, fontFamily: fonts.body, fontSize: 15, fontWeight: '800' },
});
