import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AuthStack';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../utils/authErrorMessages';
import { TextField } from '../components/TextField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, type } from '../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      setErrorMessage('Informe e-mail e senha.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      await signUp(email, password);
      // onAuthStateChanged no AuthContext detecta o novo usuário
      // automaticamente e o RootNavigator troca para o AppStack.
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Visita Técnica</Text>
          <Text style={type.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Use o e-mail da equipe para acessar de qualquer aparelho.</Text>
        </View>

        <View style={styles.form}>
          <TextField
            label="E-MAIL"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label="SENHA"
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoCapitalize="none"
          />
          <TextField
            label="CONFIRMAR SENHA"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            secureTextEntry
            autoCapitalize="none"
          />

          {Boolean(errorMessage) && <Text style={styles.errorText}>{errorMessage}</Text>}

          <PrimaryButton label="Criar conta" onPress={handleSubmit} loading={loading} />
          <PrimaryButton label="Voltar para o login" onPress={() => navigation.goBack()} variant="secondary" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center', gap: spacing.xl },
  header: { gap: spacing.xs },
  eyebrow: { ...type.eyebrow, color: colors.accent },
  subtitle: { ...type.body, color: colors.inkMuted, marginTop: spacing.xs },
  form: { gap: spacing.md },
  errorText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});
