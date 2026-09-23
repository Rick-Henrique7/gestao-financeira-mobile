// Setup global do Jest.
// Silencia logs que poluem o test runner e garante mocks comuns.

// Suprime logs ruidosos do Reanimated
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Mock do expo-router: useRouter() retorna funcao que nao faz nada
// (substituimos nos testes individuais se precisarmos inspecionar)
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  Stack: ({ children }) => children,
  Tabs: ({ children }) => children,
}));

// Mock do expo-haptics (nao usado nos testes mas pode quebrar)
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock do expo-sqlite (usado pelos services mas nos testes isolamos)
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
  deleteDatabaseAsync: jest.fn(),
}));

// Suprime warnings especificos do RN que poluem output
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = String(args[0] ?? '');
  if (msg.includes('Animated:') || msg.includes('useNativeDriver')) return;
  originalWarn(...args);
};
