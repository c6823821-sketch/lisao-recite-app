import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  findGlossaryContext,
  getCharacterReadings,
  getTermContext,
  getUnitGlossary,
  isHanCharacter,
} from '../data/characterDictionary';
import { LisaoUnit } from '../data/lisaoCurriculum';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface Props {
  selection: string | null;
  unit: LisaoUnit | null;
  sectionTitle?: string;
  onClose: () => void;
}

export function CharacterInspector({ selection, unit, sectionTitle, onClose }: Props) {
  const [activeText, setActiveText] = useState(selection);
  useEffect(() => setActiveText(selection), [selection]);

  const isPhrase = Boolean(activeText && activeText.length > 1);
  const phraseCharacters = activeText ? [...activeText].filter(isHanCharacter) : [];
  const phraseReadings = phraseCharacters.map((character) => ({
    character,
    readings: getCharacterReadings(character),
  }));
  const readings = activeText?.length === 1 ? getCharacterReadings(activeText) : [];
  const glossary = unit ? getUnitGlossary(unit) : [];
  const termContext = activeText && unit ? getTermContext(activeText, unit) : undefined;
  const dictionaryContext = activeText?.length === 1 && unit
    ? findGlossaryContext(activeText, unit.text)
    : undefined;
  const context = termContext
    ? {
        surface: termContext.surface,
        pinyin: termContext.pinyin,
        meaningInContext: termContext.meaning,
        grammar: undefined,
        notes: termContext.detail ? [termContext.detail] : undefined,
        uncertainty: undefined,
      }
    : dictionaryContext;

  return (
    <Modal visible={Boolean(selection)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="关闭字词解释" style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.headingRow}>
              <View style={[styles.characterBox, isPhrase && styles.termBox]}>
                <Text style={[styles.character, isPhrase && styles.termCharacter]}>{activeText}</Text>
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.eyebrow}>{sectionTitle ?? '离骚字词'}</Text>
                <Text style={styles.pinyin}>
                  {termContext?.pinyin
                    ?? (isPhrase ? phrasePinyin(phraseReadings) : undefined)
                    ?? (readings.length ? readings.map((reading) => reading.pronunciation).join(' / ') : '词语释义')}
                </Text>
                {unit ? <Text style={styles.sentence} numberOfLines={3}>{unit.lines.join('')}</Text> : null}
              </View>
            </View>

            {context ? (
              <View style={styles.contextCard}>
                <Text style={styles.contextLabel}>本句中的词义</Text>
                <Text style={styles.contextWord}>
                  {context.surface}
                  {context.pinyin ? `　${context.pinyin}` : ''}
                </Text>
                <Text style={styles.contextMeaning}>{context.meaningInContext}</Text>
                {context.grammar ? <Text style={styles.contextNote}>语法：{context.grammar}</Text> : null}
                {context.notes?.map((note) => <Text key={note} style={styles.contextNote}>提示：{note}</Text>)}
                {context.uncertainty ? <Text style={styles.contextUncertainty}>{context.uncertainty}</Text> : null}
              </View>
            ) : (
              <View style={styles.noContextCard}>
                <Text style={styles.noContextTitle}>{isPhrase ? '这个组合没有固定词条' : '结合本句理解'}</Text>
                <Text style={styles.noContextText}>
                  {isPhrase
                    ? '下面按字拆开列出读音和常见义项。它们是理解这个词的材料，整词意思仍要结合本句译文和本章语境判断。'
                    : '下面是这个汉字在古汉语字书中的通用义项。一个字往往有多个意思，这句里具体取哪一项，要结合原文和译文判断。'}
                </Text>
              </View>
            )}

            {unitsTranslation(unit)}

            {glossary.length ? (
              <>
                <Text style={styles.blockTitle}>本句重点词</Text>
                <Text style={styles.termHint}>点完整词语查看语境义，不再局限于单个字。</Text>
                <View style={styles.termList}>
                  {glossary.map((term) => (
                    <Pressable
                      key={term.surface}
                      onPress={() => setActiveText(term.surface)}
                      style={[styles.termButton, activeText === term.surface && styles.termButtonActive]}
                    >
                      <Text style={[styles.termButtonText, activeText === term.surface && styles.termButtonTextActive]}>
                        {term.surface}
                        {term.pinyin ? `　${term.pinyin}` : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            {isPhrase ? (
              <>
                <Text style={styles.blockTitle}>逐字读音与义项</Text>
                <Text style={styles.termHint}>整词同时看：先读准每个字，再把这个词放回整句里理解。</Text>
                {phraseReadings.map(({ character, readings: characterReadings }, characterIndex) => (
                  <View key={`${character}-${characterIndex}`} style={styles.phraseCharacterCard}>
                    <View style={styles.phraseCharacterHeading}>
                      <Text style={styles.phraseCharacter}>{character}</Text>
                      <Text style={styles.phraseCharacterPinyin}>
                        {characterReadings.length
                          ? characterReadings.map((reading) => reading.pronunciation).join(' / ')
                          : '字书未收'}
                      </Text>
                    </View>
                    {characterReadings.length ? characterReadings.map((reading, readingIndex) => (
                      <View key={`${reading.pronunciation}-${readingIndex}`} style={styles.phraseReading}>
                        <Text style={styles.phraseReadingLabel}>{reading.pronunciation}</Text>
                        <Text style={styles.phraseReadingText}>{reading.meanings.join('；')}</Text>
                      </View>
                    )) : (
                      <Text style={styles.emptyText}>这个字暂未收录释义，可结合整句译文和本章讲解判断。</Text>
                    )}
                  </View>
                ))}
              </>
            ) : activeText?.length === 1 ? (
              <>
                <Text style={styles.blockTitle}>字典义项</Text>
                {readings.length ? readings.map((reading, readingIndex) => (
              <View key={`${reading.pronunciation}-${readingIndex}`} style={styles.readingCard}>
                <View style={styles.pinyinBadge}>
                  <Text style={styles.pinyinBadgeText}>{reading.pronunciation}</Text>
                </View>
                {reading.meanings.map((meaning, meaningIndex) => (
                  <View key={`${reading.pronunciation}-${meaningIndex}`} style={styles.meaningRow}>
                    <Text style={styles.meaningIndex}>{meaningIndex + 1}</Text>
                    <Text style={styles.meaningText}>{meaning}</Text>
                  </View>
                ))}
              </View>
                )) : (
                  <Text style={styles.emptyText}>这个字暂未收录释义，可以结合整句译文和本章讲解理解。</Text>
                )}
              </>
            ) : null}

            <Text style={styles.disclaimer}>
              古汉语字典给的是常见义项，不等于“本句唯一解释”；通假、词类活用和具体语境仍要结合译文判断。
            </Text>
          </ScrollView>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>回到原文</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function unitsTranslation(unit: LisaoUnit | null) {
  if (!unit) return null;
  return (
    <View style={styles.translationCard}>
      <Text style={styles.translationLabel}>这一句对的意思</Text>
      <Text style={styles.translationText}>{unit.translation}</Text>
    </View>
  );
}

function phrasePinyin(
  phraseReadings: Array<{ character: string; readings: Array<{ pronunciation: string }> }>,
): string | undefined {
  if (!phraseReadings.length) return undefined;
  return phraseReadings
    .map(({ readings }) => readings.map((reading) => reading.pronunciation).join('/') || '？')
    .join(' · ');
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(35,29,24,0.45)' },
  sheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  handle: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: colors.line, marginTop: 10 },
  content: { paddingHorizontal: spacing.lg, paddingTop: 16, paddingBottom: 18 },
  headingRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  characterBox: { width: 78, height: 92, borderRadius: 18, backgroundColor: colors.vermilionSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6C8C3' },
  character: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 54, fontWeight: '800' },
  termBox: { width: 112 },
  termCharacter: { fontSize: 32 },
  headingCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  pinyin: { color: colors.ink, fontFamily: fonts.body, fontSize: 24, fontWeight: '800', marginTop: 5 },
  sentence: { color: colors.inkSoft, fontFamily: fonts.title, fontSize: 14, lineHeight: 23, marginTop: 7 },
  contextCard: { marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: colors.jadeSoft, borderLeftWidth: 4, borderLeftColor: colors.jade },
  contextLabel: { color: colors.jade, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  contextWord: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, fontWeight: '800', marginTop: 7 },
  contextMeaning: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 15, lineHeight: 25, marginTop: 7 },
  contextNote: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginTop: 7 },
  contextUncertainty: { color: colors.gold, fontFamily: fonts.body, fontSize: 13, lineHeight: 21, marginTop: 8 },
  noContextCard: { marginTop: 18, padding: 15, borderRadius: 15, backgroundColor: '#F7EBDD', borderLeftWidth: 4, borderLeftColor: colors.gold },
  noContextTitle: { color: colors.gold, fontFamily: fonts.body, fontSize: 14, fontWeight: '800' },
  noContextText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 22, marginTop: 6 },
  translationCard: { marginTop: 12, padding: 15, borderRadius: 15, backgroundColor: colors.paper },
  translationLabel: { color: colors.muted, fontFamily: fonts.sans, fontSize: 10, letterSpacing: 1 },
  translationText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 23, marginTop: 6 },
  termHint: { color: colors.muted, fontFamily: fonts.sans, fontSize: 11, lineHeight: 18, marginTop: -5, marginBottom: 9 },
  termList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  termButton: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  termButtonActive: { borderColor: colors.vermilion, backgroundColor: colors.vermilionSoft },
  termButtonText: { color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13 },
  termButtonTextActive: { color: colors.vermilion, fontWeight: '800' },
  blockTitle: { color: colors.ink, fontFamily: fonts.title, fontSize: 19, fontWeight: '800', marginTop: 22, marginBottom: 10 },
  readingCard: { marginBottom: 10, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  phraseCharacterCard: { marginBottom: 10, padding: 14, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper },
  phraseCharacterHeading: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  phraseCharacter: { color: colors.vermilion, fontFamily: fonts.title, fontSize: 27, fontWeight: '800' },
  phraseCharacterPinyin: { flex: 1, color: colors.ink, fontFamily: fonts.body, fontSize: 16, fontWeight: '700' },
  phraseReading: { flexDirection: 'row', gap: 9, marginTop: 9, paddingTop: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  phraseReadingLabel: { width: 78, color: colors.jade, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  phraseReadingText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 13, lineHeight: 22 },
  pinyinBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.vermilion },
  pinyinBadgeText: { color: colors.white, fontFamily: fonts.body, fontSize: 13, fontWeight: '800' },
  meaningRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  meaningIndex: { width: 18, color: colors.vermilion, fontFamily: fonts.sans, fontSize: 10, paddingTop: 3 },
  meaningText: { flex: 1, color: colors.inkSoft, fontFamily: fonts.body, fontSize: 14, lineHeight: 23 },
  emptyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 23 },
  disclaimer: { color: colors.muted, fontFamily: fonts.body, fontSize: 12, lineHeight: 20, marginTop: 14 },
  closeButton: { minHeight: 54, marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: 15, backgroundColor: colors.vermilion, alignItems: 'center', justifyContent: 'center' },
  closeButtonText: { color: colors.white, fontFamily: fonts.body, fontSize: 16, fontWeight: '800' },
});
