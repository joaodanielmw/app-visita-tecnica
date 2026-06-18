import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/services/database';
import { colors, spacing, type } from './src/theme';

type BootState = 'loading' | 'ready' | 'error';

export default function App() {
  const [bootState, setBootState] = useState<BootState>('loading');

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        setBootState('ready');
      } catch (error) {
        console.error('[App] falha ao iniciar o banco local', error);
        setBootState('error');
      }
    })();
  }, []);

  if (bootState === 'loading') {
    return (
      <View style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (bootState === 'error') {
    return (
      <View style={styles.centerFlex}>
        <Text style={type.subtitle}>Não foi possível iniciar o app</Text>
        <Text style={styles.errorText}>
          Houve um problema ao preparar o armazenamento local. Tente fechar e abrir o app novamente.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  errorText: { ...type.body, color: colors.inkMuted, textAlign: 'center' },
});
