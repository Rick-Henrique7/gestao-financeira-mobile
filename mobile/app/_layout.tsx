import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DrawerMenu } from '../src/components/DrawerMenu';
import { useBillsStore } from '../src/stores/billsStore';
import { useLoansStore } from '../src/stores/loansStore';
import { useGoalsStore } from '../src/stores/goalsStore';
import { useSubsStore } from '../src/stores/subscriptionsStore';
import { useIRPFStore } from '../src/stores/irpfStore';
import { useCashflowStore } from '../src/stores/cashflowStore';
import { useSettingsStore } from '../src/stores/settingsStore';
import { colors } from '../src/lib/theme';

export default function RootLayout() {
  const refreshBills = useBillsStore((s) => s.refresh);
  const refreshLoans = useLoansStore((s) => s.refresh);
  const refreshGoals = useGoalsStore((s) => s.refresh);
  const refreshSubs = useSubsStore((s) => s.refresh);
  const refreshIRPF = useIRPFStore((s) => s.refresh);
  const refreshIRPFCats = useIRPFStore((s) => s.refreshCategories);
  const refreshCashflow = useCashflowStore((s) => s.refresh);
  const refreshSettings = useSettingsStore((s) => s.refresh);

  useEffect(() => {
    void Promise.allSettled([
      refreshSettings(),
      refreshBills(),
      refreshLoans(),
      refreshGoals(),
      refreshSubs(),
      refreshIRPF(),
      refreshIRPFCats(),
      refreshCashflow(),
    ]);
  }, [
    refreshBills, refreshLoans, refreshGoals, refreshSubs,
    refreshIRPF, refreshIRPFCats, refreshCashflow, refreshSettings,
  ]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.base },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.base },
          headerLeft: () => <DrawerMenu />,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="loans"      options={{ title: 'Empréstimos' }} />
        <Stack.Screen name="goals"      options={{ title: 'Metas & Cofrinhos' }} />
        <Stack.Screen name="simulacoes" options={{ title: 'Simulações' }} />
        <Stack.Screen name="settings"   options={{ title: 'Configurações' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
