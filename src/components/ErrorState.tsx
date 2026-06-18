import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={type.subtitle}>Algo deu errado</Text>
      <Text style={styles.description}>{message}</Text>
      <View style={styles.button}>
        <PrimaryButton label="Tentar novamente" onPress={onRetry} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  description: { ...type.body, color: colors.inkMuted, textAlign: 'center' },
  button: { marginTop: spacing.md, minWidth: 200 },
});
