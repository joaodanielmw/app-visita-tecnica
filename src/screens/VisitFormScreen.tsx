import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppStack';
import { useVisits } from '../hooks/useVisits';
import { getVisitByIdLocal } from '../services/database';
import { EMPTY_VISIT_INPUT, TECHNICIANS, VISIT_TYPES, type VisitInput } from '../types/visit';
import { TextField } from '../components/TextField';
import { DateTimeField } from '../components/DateTimeField';
import { ChipSelect } from '../components/ChipSelect';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'VisitForm'>;

type FieldErrors = Partial<Record<keyof VisitInput, string>>;

function validate(input: VisitInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.clientName.trim()) errors.clientName = 'Informe o nome do cliente.';
  if (!input.osNumber.trim()) errors.osNumber = 'Informe o número da OS.';
  if (!input.visitDate) errors.visitDate = 'Selecione a data da visita.';
  if (!input.arrivalTime) errors.arrivalTime = 'Selecione o horário de chegada.';
  if (!input.departureTime) errors.departureTime = 'Selecione o horário de saída.';
  return errors;
}

export function VisitFormScreen({ route, navigation }: Props) {
  const visitId = route.params?.visitId;
  const isEditing = Boolean(visitId);
  const { createVisit, updateVisit, deleteVisit } = useVisits();

  const [input, setInput] = useState<VisitInput>(EMPTY_VISIT_INPUT);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadingInitialData, setLoadingInitialData] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitId) return;
    (async () => {
      try {
        const existing = await getVisitByIdLocal(visitId);
        if (existing) {
          setInput({
            clientName: existing.clientName,
            osNumber: existing.osNumber,
            visitDate: existing.visitDate,
            arrivalTime: existing.arrivalTime,
            departureTime: existing.departureTime,
            technician: existing.technician,
            visitType: existing.visitType,
          });
        }
      } finally {
        setLoadingInitialData(false);
      }
    })();
  }, [visitId]);

  function updateField<K extends keyof VisitInput>(key: K, value: VisitInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    const fieldErrors = validate(input);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditing && visitId) {
        await updateVisit(visitId, input);
      } else {
        await createVisit(input);
      }
      navigation.goBack();
    } catch (error) {
      console.warn('[VisitFormScreen] erro ao salvar', error);
      setSubmitError('Não foi possível salvar a visita. Os dados ficam guardados no aparelho e você pode tentar de novo.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete() {
    if (!visitId) return;
    Alert.alert('Excluir visita', 'Tem certeza que deseja excluir esta visita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteVisit(visitId);
          navigation.goBack();
        },
      },
    ]);
  }

  if (loadingInitialData) {
    return (
      <View style={styles.centerFlex}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextField
          label="Nome do Cliente *"
          value={input.clientName}
          onChangeText={(v) => updateField('clientName', v)}
          placeholder="Ex.: Mercado Bom Preço"
          errorMessage={errors.clientName}
        />

        <TextField
          label="Número da OS *"
          value={input.osNumber}
          onChangeText={(v) => updateField('osNumber', v)}
          placeholder="Ex.: 4521"
          keyboardType="numbers-and-punctuation"
          errorMessage={errors.osNumber}
        />

        <DateTimeField
          label="Data da visita *"
          mode="date"
          value={input.visitDate}
          onChange={(v) => updateField('visitDate', v)}
          errorMessage={errors.visitDate}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <DateTimeField
              label="Horário de chegada *"
              mode="time"
              value={input.arrivalTime}
              onChange={(v) => updateField('arrivalTime', v)}
              errorMessage={errors.arrivalTime}
            />
          </View>
          <View style={styles.rowItem}>
            <DateTimeField
              label="Horário de saída *"
              mode="time"
              value={input.departureTime}
              onChange={(v) => updateField('departureTime', v)}
              errorMessage={errors.departureTime}
            />
          </View>
        </View>

        <ChipSelect
          label="Técnico responsável *"
          options={TECHNICIANS}
          value={input.technician}
          onChange={(v) => updateField('technician', v)}
        />

        <ChipSelect
          label="Tipo de visita *"
          options={VISIT_TYPES}
          value={input.visitType}
          onChange={(v) => updateField('visitType', v)}
        />

        {Boolean(submitError) && <Text style={styles.submitErrorText}>{submitError}</Text>}

        <View style={styles.actions}>
          <PrimaryButton
            label={isEditing ? 'Salvar alterações' : 'Registrar visita'}
            onPress={handleSubmit}
            loading={submitting}
          />
          {isEditing && (
            <PrimaryButton label="Excluir visita" onPress={handleDelete} variant="danger" />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl * 2 },
  row: { flexDirection: 'row', gap: spacing.md },
  rowItem: { flex: 1 },
  submitErrorText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
