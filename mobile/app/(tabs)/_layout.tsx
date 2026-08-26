import { Tabs } from 'expo-router';
import {
  LayoutDashboard, Receipt, BarChart2, Tv, FileText,
} from 'lucide-react-native';
import { colors } from '../../src/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCanvas,
          borderTopColor: 'rgba(204, 240, 80, 0.1)',
          height: 68, paddingBottom: 8, paddingTop: 8,
          marginBottom: 12,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Início',
        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
      }} />
      <Tabs.Screen name="contas" options={{
        title: 'Contas',
        tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
      }} />
      <Tabs.Screen name="orcamento" options={{
        title: 'Orçamento',
        tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
      }} />
      <Tabs.Screen name="assinaturas" options={{
        title: 'Assinaturas',
        tabBarIcon: ({ color, size }) => <Tv size={size} color={color} />,
      }} />
      <Tabs.Screen name="irpf" options={{
        title: 'IRPF',
        tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
      }} />
    </Tabs>
  );
}
