import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, spacing, type } from '../theme';

interface DateTimeFieldProps {
  label: string;
  mode: 'date' | 'time';
  /** mode="date": 'YYYY-MM-DD'. mode="time": 'HH:mm'. Vazio = não selecionado ainda. */
  value: string;
  onChange: (value: string) => void;
  errorMessage?: string | null;
}

function parseValueToDate(value: string, mode: 'date' | 'time'): Date {
  const base = new Date();
  if (!value) return base;
  if (mode === 'date') {
    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return base;
    return new Date(year, month - 1, day);
  }
  const [hours, minutes] = value.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return base;
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function formatValue(date: Date, mode: 'date' | 'time'): string {
  if (mode === 'date') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

function formatDisplay(value: string, mode: 'date' | 'time'): string {
  if (!value) return mode === 'date' ? 'Selecionar data' : 'Selecionar horário';
  if (mode === 'time') return value;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function DateTimeField({ label, mode, value, onChange, errorMessage }: DateTimeFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(formatValue(selectedDate, mode));
  }

  return (
    <View style={styles.container}>
      <Text style={type.eyebrow}>{label}</Text>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[styles.input, Boolean(errorMessage) && styles.inputError]}
        accessibilityRole="button"
      >
        <Text style={[styles.valueText, !value && styles.placeholderText]}>
          {formatDisplay(value, mode)}
        </Text>
      </Pressable>
      {Boolean(errorMessage) && <Text style={styles.errorText}>{errorMessage}</Text>}

      {showPicker && (
        <View>
          <DateTimePicker
            value={parseValueToDate(value, mode)}
            mode={mode}
            is24Hour
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable onPress={() => setShowPicker(false)} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Concluído</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputError: { borderColor: colors.danger },
  valueText: { fontSize: 16, color: colors.ink, fontVariant: ['tabular-nums'] },
  placeholderText: { color: colors.inkMuted },
  errorText: { fontSize: 13, color: colors.danger },
  doneButton: { alignSelf: 'flex-end', paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  doneButtonText: { color: colors.accent, fontWeight: '700', fontSize: 15 },
});
