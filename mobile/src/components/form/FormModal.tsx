import React, { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useReducedMotion, safeModalAnimation } from '../../lib/motion';

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  error?: string | null;
}

export function FormModal({ visible, title, onClose, children, error }: FormModalProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView | null>(null);
  // Altura do teclado (px) — usada como marginBottom do sheet pra ele
  // subir junto quando o teclado aparece. Isso substitui o
  // KeyboardAvoidingView, que tem comportamento limitado na nova
  // arquitetura (Fabric) do RN 0.83.
  const [kbHeight, setKbHeight] = useState(0);

  // 1) Mede a altura do teclado sempre que ele aparece/some.
  // 2) Rola o conteudo pro final quando o teclado sobe, garantindo
  //    que o input focado (que costuma estar perto do rodape do form)
  //    fica visivel acima do teclado.
  React.useEffect(() => {
    if (!visible) return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
      // Da tempo do sheet recalcular layout antes do scroll
      setTimeout(() => {
        try { scrollRef.current?.scrollToEnd({ animated: true }); } catch {}
      }, 80);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKbHeight(0);
    });
    return () => {
      try { showSub.remove(); } catch {}
      try { hideSub.remove(); } catch {}
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={safeModalAnimation(reducedMotion)}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.fill}>
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable
            style={[s.sheet, kbHeight > 0 ? { marginBottom: kbHeight } : null]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={s.handleWrap}>
              <View style={s.handle} />
            </View>

            <View style={s.header}>
              <Text style={s.title}>{title}</Text>
              <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
                <X size={18} color={colors.muted} />
              </Pressable>
            </View>

            <ScrollView
              ref={scrollRef}
              contentContainerStyle={s.body}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onScrollBeginDrag={() => {}}
            >
              {children}
            </ScrollView>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.base,
    borderTopLeftRadius: radius.display,
    borderTopRightRadius: radius.display,
    borderTopWidth: 1,
    borderColor: colors.border,
    // maxHeight 75% garante que o sheet nao ocupe a tela toda,
    // deixando espaco pro header em cima + visual do overlay.
    maxHeight: '75%',
  },
  handleWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 4 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.muted },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  closeBtn: { padding: 4 },
  body: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  errorBox: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(248, 113, 113, 0.3)',
    padding: spacing.md,
  },
  errorText: { color: colors.danger, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
});
