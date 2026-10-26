import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { isHanCharacter } from '../data/characterDictionary';
import { colors, fonts } from '../theme';

interface Props {
  lines: string[];
  onCharacterPress: (character: string) => void;
  selectedCharacter?: string;
  lineStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

export function ClassicalText({
  lines,
  onCharacterPress,
  selectedCharacter,
  lineStyle,
  containerStyle,
  interactive = true,
}: Props) {
  return (
    <View style={containerStyle}>
      {lines.filter((line) => line !== '」').map((line, lineIndex) => (
        <Text key={`${line}-${lineIndex}`} selectable={!interactive} style={[styles.line, lineStyle]}>
          {[...line].map((character, characterIndex) => {
            const selected = selectedCharacter === character;
            if (!interactive || !isHanCharacter(character)) {
              return <Text key={`${characterIndex}-${character}`}>{character}</Text>;
            }
            return (
              <Text
                key={`${characterIndex}-${character}`}
                accessibilityRole="button"
                accessibilityLabel={`查看“${character}”的读音和释义`}
                onPress={() => onCharacterPress(character)}
                suppressHighlighting={false}
                style={selected && styles.selected}
              >
                {character}
              </Text>
            );
          })}
        </Text>
      ))}
    </View>
  );
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
});
