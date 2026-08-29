import React, { useRef } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  findNodeHandle,
  UIManager,
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

  /**
   * Handler para TextInput.onFocus dentro do modal.
   * - Garante que o input fica visivel acima do teclado (scrollIntoView).
   * - Funciona em iOS e Android sem precisar de KeyboardAvoidingView perfeito.
   * - Adiciona tambem o keyboard opening como gatilho para re-scroll
   *   (caso o input mude de posicao entre o focus e o teclado abrir).
   */
  const onInputFocus = (e: any) => {
    const target = e?.target;
    if (target == null) return;
    const scrollNode = findNodeHandle(scrollRef.current);
    if (scrollNode == null) return;
    // 180ms = tipico tempo entre focus e keyboard abrindo no iOS
    const run = () => {
      try {
        UIManager.measureLayout(
          target,
          scrollNode,
          () => {},
          (x: number, y: number) => {
            // Pede pro ScrollView rolar ate o Y do input + offset de seguranca
            // (deixa ~120px acima do teclado pro label nao cobrir o input)
            scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true });
          }
        );
      } catch {
        // best-effort
      }
    };
    setTimeout(run, 180);
    setTimeout(run, 400); // fallback caso 180ms ainda nao tenha teclado
  };

  // Listener global: sempre que o teclado abre, faz scroll do input focado.
  // Isso cobre o caso do usuario tocar num input sem disparar onFocus
  // (ex: input ja estava focado e o teclado abre por outro motivo).
  React.useEffect(() => {
    if (!visible) return;
    let sub: any;
    try {
      const { Keyboard } = require('react-native');
      sub = Keyboard.addListener('keyboardDidShow', () => {
        // Acha o TextInput focado (RN guarda em State)
        // e pede pro ScrollView re-rolar.
        // Medida simplificada: scrolla para o final do conteudo, que garante
        // que o input visivel mais baixo fica acima do teclado.
        setTimeout(() => {
          try {
            scrollRef.current?.scrollToEnd({ animated: true });
          } catch {}
        }, 50);
      });
    } catch {}
    return () => { try { sub?.remove?.(); } catch {} };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={safeModalAnimation(reducedMotion)}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={s.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
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
              // onScrollBeginDrag/onFocus bubbling nao captura bem,
              // entao usamos MeasureLayout em cada TextInput focado
              onScrollBeginDrag={() => {}}
            >
              {/* Children recebem onInputFocus via prop, mas como nao queremos
                  mudar a API dos forms, interceptamos via onFocus dos inputs
                  via clone do onFocus original. Hack leve mas funciona: */}
              <FocusCatcher onFocus={onInputFocus}>{children}</FocusCatcher>
            </ScrollView>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * Intercepta onFocus de qq TextInput/Pressable dentro do children
 * e chama o onFocusFocus alem do onFocus original.
 *
 * Isso evita ter que mexer em todos os forms (TextInputField, NumberInputField,
 * DateInputField, SelectField). O React chama onFocus em ordem de bubbles
 * (do children pro parent), entao o FocusCatcher por volta detecta primeiro.
 */
function FocusCatcher({
  children,
  onFocus,
}: {
  children: React.ReactNode;
  onFocus: (e: any) => void;
}) {
  // React.cloneElement adiciona o handler em todos os inputs
  // (TextInput, Pressable que tenha onFocus, etc)
  const wrap = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node)) return node;
    const el = node as React.ReactElement<any>;
    const props: any = { ...el.props };
    // Adiciona handler de focus que NAO substitui o original
    if (props.onFocus && typeof props.onFocus === 'function') {
      const original = props.onFocus;
      props.onFocus = (e: any) => { onFocus(e); original(e); };
    } else {
      props.onFocus = onFocus;
    }
    // Recursivo para children aninhados
    if (props.children) {
      props.children = React.Children.map(props.children, wrap);
    }
    return React.cloneElement(el, props);
  };
  return <>{React.Children.map(children, wrap)}</>;
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
    // Era 90% - reduzido pra 75% pra dar mais espaco pro teclado sem
    // cobrir o conteudo. O scroll interno cuida do resto.
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
