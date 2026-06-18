import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';

interface ChipSelectProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * Substitui um <Picker> nativo por um seletor de chips visível por
 * completo na tela — melhor para listas curtas (3 a 5 opções, como
 * "Técnico responsável" e "Tipo de visita") porque o usuário vê todas
 * as opções de uma vez, sem abrir um menu.
 */
export function ChipSelect<T extends string>({ label, options, value, onChange }: ChipSelectProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={type.eyebrow}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  chipText: { fontSize: 15, fontWeight: '600', color: colors.inkMuted },
  chipTextSelected: { color: colors.accent },
});
