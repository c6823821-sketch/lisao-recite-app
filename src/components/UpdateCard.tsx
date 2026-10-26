import React, { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  checkForUpdate,
  downloadAndInstallApk,
  INSTALLED_BUILD,
  INSTALLED_VERSION,
  openReleasePage,
  UpdateManifest,
} from '../services/updates';
import { colors, fonts, radius } from '../theme';

type UpdateState = 'idle' | 'checking' | 'current' | 'available' | 'downloading' | 'error';

export function UpdateCard() {
  const [state, setState] = useState<UpdateState>('idle');
  const [manifest, setManifest] = useState<UpdateManifest | null>(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const check = async () => {
    setState('checking');
    setMessage('');
    setProgress(0);
    try {
      const next = await checkForUpdate();
      setManifest(next);
      setState(next ? 'available' : 'current');
      setMessage(next ? `发现新版本 ${next.version}` : `已经是最新版 ${INSTALLED_VERSION}`);
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : '检查更新失败，请稍后再试。');
    }
  };

  const install = async () => {
    if (!manifest) return;
    if (Platform.OS !== 'android') {
      await openReleasePage();
      return;
    }
    setState('downloading');
    setMessage('正在下载安装包…');
    try {
      await downloadAndInstallApk(manifest, (event) => setProgress(event.ratio));
      setState('available');
      setMessage('安装器已经打开。若系统询问，请允许“安装未知应用”。');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : '下载安装失败，请打开 GitHub 下载。');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.mark}><Text style={styles.markText}>新</Text></View>
        <View style={styles.copy}>
          <Text style={styles.title}>版本与更新</Text>
          <Text style={styles.version}>当前正式版 {INSTALLED_VERSION}{INSTALLED_BUILD ? `（${INSTALLED_BUILD}）` : ''}</Text>
        </View>
        <Pressable
          disabled={state === 'checking' || state === 'downloading'}
          onPress={() => void check()}
          style={({ pressed }) => [styles.checkButton, pressed && styles.pressed, (state === 'checking' || state === 'downloading') && styles.disabled]}
        >
          {state === 'checking' ? <ActivityIndicator color={colors.vermilion} size="small" /> : <Text style={styles.checkText}>检查更新</Text>}
        </Pressable>
      </View>

      {state === 'current' ? <Text style={styles.currentText}>{message}</Text> : null}
      {state === 'error' ? <Text style={styles.errorText}>{message}</Text> : null}

      {manifest && (state === 'available' || state === 'downloading') ? (
        <View style={styles.updateBox}>
          <Text style={styles.updateTitle}>可以更新到 {manifest.version}</Text>
          {manifest.notes.map((note) => (
            <View key={note} style={styles.noteRow}>
              <Text style={styles.noteDot}>·</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
          {state === 'downloading' ? (
            <View style={styles.downloadBox}>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(2, progress * 100)}%` }]} /></View>
              <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
            </View>
          ) : (
            <Pressable onPress={() => void install()} style={({ pressed }) => [styles.installButton, pressed && styles.pressed]}>
              <Text style={styles.installText}>{Platform.OS === 'android' ? '下载并安装' : '打开 GitHub 下载'}</Text>
            </Pressable>
          )}
          <Text style={styles.installHint}>
            {Platform.OS === 'android'
              ? '下载完成后会调用系统安装器。学习记录保存在本机，正常覆盖安装不会清除。'
              : message}
          </Text>
          <Pressable onPress={() => void openReleasePage()} style={styles.linkButton}>
            <Text style={styles.linkText}>打不开时去 GitHub 手动下载</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 28, padding: 16, borderRadius: radius.card, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.vermilionSoft, alignItems: 'center', justifyContent: 'center' },
  markText: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 16, fontWeight: '800' },
  copy: { flex: 1, minWidth: 0 },
  title: { color: colors.ink, fontFamily: fonts.title, fontSize: 17, fontWeight: '800' },
  version: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginTop: 4 },
  checkButton: { minWidth: 82, minHeight: 36, borderRadius: 11, borderWidth: 1, borderColor: colors.vermilion, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  checkText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, fontWeight: '700' },
  currentText: { color: colors.jade, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: colors.jadeSoft },
  errorText: { color: colors.vermilion, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 12 },
  updateBox: { marginTop: 13, paddingTop: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  updateTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 16, fontWeight: '800' },
  noteRow: { flexDirection: 'row', gap: 7, marginTop: 7 },
  noteDot: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 16, lineHeight: 21 },
  noteText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 21 },
  installButton: { minHeight: 46, marginTop: 13, borderRadius: 13, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  installText: { color: colors.white, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  installHint: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, lineHeight: 17, marginTop: 8 },
  linkButton: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 10, marginTop: 4 },
  linkText: { color: colors.jade, fontFamily: fonts.body, fontSize: 11, textDecorationLine: 'underline' },
  downloadBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 13 },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.paperDeep, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.vermilion },
  progressText: { width: 42, color: colors.vermilion, fontFamily: fonts.sans, fontSize: 11, textAlign: 'right' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.7 },
});
