import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { isHanCharacter, UnitGlossaryTerm } from '../data/characterDictionary';
import { colors, fonts } from '../theme';

interface Props {
  lines: string[];
  onTextPress: (text: string) => void;
  selectedText?: string;
  terms?: UnitGlossaryTerm[];
  lineStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
  wordMode?: boolean;
}

export function ClassicalText({
  lines,
  onTextPress,
  selectedText,
  terms = [],
  lineStyle,
  containerStyle,
  interactive = true,
  wordMode = false,
}: Props) {
  const [anchor, setAnchor] = useState<{ lineIndex: number; characterIndex: number } | null>(null);

  useEffect(() => {
    if (!wordMode) setAnchor(null);
  }, [wordMode]);

  const pressCharacter = (line: string, lineIndex: number, characterIndex: number) => {
    const character = line.slice(characterIndex, characterIndex + 1);
    if (!wordMode) {
      onTextPress(character);
      return;
    }
    if (!anchor || anchor.lineIndex !== lineIndex) {
      setAnchor({ lineIndex, characterIndex });
      return;
    }
    const start = Math.min(anchor.characterIndex, characterIndex);
    const end = Math.max(anchor.characterIndex, characterIndex);
    setAnchor(null);
    onTextPress(line.slice(start, end + 1));
  };

  return (
    <View style={containerStyle}>
      {lines.filter((line) => line !== '」').map((line, lineIndex) => (
        <Text key={`${line}-${lineIndex}`} selectable={!interactive} style={[styles.line, lineStyle]}>
          {renderLine({
            line,
            lineIndex,
            terms,
            selectedText,
            interactive,
            wordMode,
            anchor,
            onTextPress,
            onCharacterPress: pressCharacter,
          })}
        </Text>
      ))}
    </View>
  );
}

function renderLine({
  line,
  lineIndex,
  terms,
  selectedText,
  interactive,
  wordMode,
  anchor,
  onTextPress,
  onCharacterPress,
}: {
  line: string;
  lineIndex: number;
  terms: UnitGlossaryTerm[];
  selectedText: string | undefined;
  interactive: boolean;
  wordMode: boolean;
  anchor: { lineIndex: number; characterIndex: number } | null;
  onTextPress: (text: string) => void;
  onCharacterPress: (line: string, lineIndex: number, characterIndex: number) => void;
}) {
  const nodes: React.ReactNode[] = [];
  let index = 0;
  while (index < line.length) {
    const position = index;
    const term = interactive && !wordMode
      ? terms.find((candidate) => line.startsWith(candidate.surface, position))
      : undefined;
    if (term) {
      nodes.push(
        <Text
          key={`${position}-${term.surface}`}
          accessibilityRole="button"
          accessibilityLabel={`查看词语“${term.surface}”的读音和释义`}
          onPress={() => onTextPress(term.surface)}
          suppressHighlighting={false}
          style={[styles.term, selectedText === term.surface && styles.selected]}
        >
          {term.surface}
        </Text>,
      );
      index += term.surface.length;
      continue;
    }
    const character = line.slice(position, position + 1);
    if (!interactive || !isHanCharacter(character)) {
      nodes.push(<Text key={`${position}-${character}`}>{character}</Text>);
    } else {
      nodes.push(
        <Text
          key={`${position}-${character}`}
          accessibilityRole="button"
          accessibilityLabel={wordMode
            ? `以“${character}”为词首或词尾选择词语`
            : `查看“${character}”的读音和释义`}
          onPress={() => onCharacterPress(line, lineIndex, position)}
          suppressHighlighting={false}
          style={[
            selectedText === character && styles.selected,
            anchor?.lineIndex === lineIndex && anchor.characterIndex === position && styles.anchor,
          ]}
        >
          {character}
        </Text>,
      );
    }
    index += 1;
  }
  return nodes;
}

const styles = StyleSheet.create({
  line: {
    color: colors.ink,
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 33,
    fontWeight: '600',
  },
  selected: {
    color: colors.vermilion,
    backgroundColor: colors.vermilionSoft,
  },
  anchor: {
    color: colors.white,
    backgroundColor: colors.vermilion,
  },
  term: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: colors.gold,
  },
});
