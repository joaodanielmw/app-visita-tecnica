import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VisitListScreen } from '../screens/VisitListScreen';
import { VisitFormScreen } from '../screens/VisitFormScreen';
import { colors } from '../theme';

export type AppStackParamList = {
  VisitList: undefined;
  VisitForm: { visitId?: string } | undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="VisitList" component={VisitListScreen} options={{ title: 'Visitas técnicas' }} />
      <Stack.Screen
        name="VisitForm"
        component={VisitFormScreen}
        options={({ route }) => ({
          title: route.params?.visitId ? 'Editar visita' : 'Nova visita',
        })}
      />
    </Stack.Navigator>
  );
}
