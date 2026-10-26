import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius } from '../theme';

export type MainTab = 'today' | 'sections' | 'mine';

interface Props {
  active: MainTab;
  onChange: (tab: MainTab) => void;
}

const TABS: Array<{ key: MainTab; label: string; mark: string }> = [
  { key: 'today', label: '今日', mark: '日' },
  { key: 'sections', label: '分章', mark: '章' },
  { key: 'mine', label: '我的', mark: '我' },
];

export function MainTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={styles.tab}
          >
            <View style={[styles.mark, selected && styles.markActive]}>
              <Text style={[styles.markText, selected && styles.markTextActive]}>{tab.mark}</Text>
            </View>
            <Text style={[styles.label, selected && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 6,
  },
  tab: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center' },
  mark: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button },
  markActive: { backgroundColor: colors.vermilionSoft },
  markText: { color: colors.muted, fontFamily: fonts.title, fontSize: 15, fontWeight: '600' },
  markTextActive: { color: colors.vermilion, fontWeight: '800' },
  label: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, marginTop: 2 },
  labelActive: { color: colors.ink, fontWeight: '700' },
});
