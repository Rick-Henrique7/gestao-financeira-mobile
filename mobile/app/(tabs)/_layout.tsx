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
        // Tab bar no padrão Figma: fundo preto, item ativo verde-limão
        tabBarStyle: {
          // Fundo com leve transparencia para deixar o ShapeGrid aparecer atras.
          // O tab bar continua legivel porque o conteudo da tab usa surface opaco.
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.hero,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{
        title: 'Início',
        tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} strokeWidth={2} />,
      }} />
      <Tabs.Screen name="contas" options={{
        title: 'Contas',
        tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} strokeWidth={2} />,
      }} />
      <Tabs.Screen name="orcamento" options={{
        title: 'Orçamento',
        tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} strokeWidth={2} />,
      }} />
      <Tabs.Screen name="assinaturas" options={{
        title: 'Assinaturas',
        tabBarIcon: ({ color, size }) => <Tv size={size} color={color} strokeWidth={2} />,
      }} />
      <Tabs.Screen name="irpf" options={{
        title: 'IRPF',
        tabBarIcon: ({ color, size }) => <FileText size={size} color={color} strokeWidth={2} />,
      }} />
    </Tabs>
  );
}
