import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Keyboard,
  TextInput as RNTextInput,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';
import { useReducedMotion, safeModalAnimation } from '../../lib/motion';
import { FormScrollContext, type FormScrollApi } from './useInputScroll';

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  error?: string | null;
}

/**
 * FormModal generico.
 *
 * Comportamento de auto-scroll (teclado):
 * 1. Cada TextInput dentro do children e interceptado por um InputWrapper
 *    (recursivo, via React.Children.map), que injeta uma ref e envolve o
 *    onFocus.
 * 2. Quando o input recebe focus:
 *    - Registra a ref no FormModal
 *    - Chama scrollToInput(key), que usa ref.measure() (funciona no Fabric)
 *      para obter a posicao absoluta do input e do ScrollView, e calcula
 *      o offset necessario para que o input fique visivel acima do teclado.
 * 3. Quando o teclado sobe (keyboardDidShow), o input focado recebe scroll
 *    novamente, com a altura do teclado ja conhecida.
 * 4. O sheet recebe marginBottom = altura do teclado, subindo junto.
 *
 * Mudanca chave: usa ref.measure() (preservado no Fabric) em vez de
 * UIManager.measureLayout (removido no Fabric).
 */
export function FormModal({ visible, title, onClose, children, error }: FormModalProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView | null>(null);
  const inputRefs = useRef<Map<string, React.RefObject<RNTextInput | View | null>>>(new Map());
  const lastFocusedKey = useRef<string | null>(null);
  const currentScrollY = useRef(0);
  const [kbHeight, setKbHeight] = useState(0);

  const registerInput = useCallback((key: string, ref: React.RefObject<RNTextInput | View | null>) => {
    inputRefs.current.set(key, ref);
  }, []);
  const unregisterInput = useCallback((key: string) => {
    inputRefs.current.delete(key);
  }, []);
  const setFocusedInput = useCallback((key: string | null) => {
    lastFocusedKey.current = key;
  }, []);

  const scrollToInput = useCallback((key: string) => {
    const inputRef = inputRefs.current.get(key);
    const scrollNode = scrollRef.current;
    if (!inputRef?.current || !scrollNode) return;

    let inputPageY = 0;
    let scrollPageY = 0;
    let pending = 2;
    let scrolled = false;
    const doScroll = () => {
      if (scrolled) return;
      if (--pending !== 0) return;
      scrolled = true;
      // Posicao do input no conteudo do ScrollView:
      //   contentY = (inputPageY - scrollPageY) + currentScrollY
      // currentScrollY e atualizado via onScroll do ScrollView (publico).
      const contentY = inputPageY - scrollPageY + currentScrollY.current;
      // Margem: deixa o input ~80px abaixo do topo visivel,
      // para o label nao cobrir o input.
      const target = Math.max(0, contentY - 80);
      try { (scrollNode as any).scrollTo({ y: target, animated: true }); } catch {}
    };
    try {
      (inputRef.current as any).measure(
        (_x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
          inputPageY = py;
          doScroll();
        }
      );
    } catch { doScroll(); }
    try {
      (scrollNode as any).measure(
        (_x: number, _y: number, _w: number, _h: number, _px: number, py: number) => {
          scrollPageY = py;
          doScroll();
        }
      );
    } catch { doScroll(); }
  }, []);

  // 1) Mede a altura do teclado sempre que ele aparece/some.
  // 2) Re-roda o scroll do input focado quando o teclado sobe.
  useEffect(() => {
    if (!visible) return;
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKbHeight(e.endCoordinates?.height ?? 0);
      // Re-scroll apos o layout atualizar (teclado abriu, sheet subiu)
      setTimeout(() => {
        const key = lastFocusedKey.current;
        if (key) scrollToInput(key);
      }, 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKbHeight(0);
    });
    return () => {
      try { showSub.remove(); } catch {}
      try { hideSub.remove(); } catch {}
    };
  }, [visible, scrollToInput]);

  // Cleanup refs quando o modal fecha
  useEffect(() => {
    if (!visible) inputRefs.current.clear();
  }, [visible]);

  const ctxValue = useMemo<FormScrollApi>(() => ({
    registerInput,
    unregisterInput,
    scrollToInput,
    setFocusedInput,
    setKeyboardHeight: (h: number) => setKbHeight(h),
    subscribeKeyboard: () => () => {},
  }), [registerInput, unregisterInput, scrollToInput, setFocusedInput]);

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
              onScroll={(e) => {
                currentScrollY.current = e.nativeEvent.contentOffset.y;
              }}
              scrollEventThrottle={32}
            >
              <FormScrollContext.Provider value={ctxValue}>
                <FocusCatcher>{children}</FocusCatcher>
              </FormScrollContext.Provider>
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

let inputKeyCounter = 0;
function nextKey() { return `__fi${inputKeyCounter++}`; }

/**
 * FocusCatcher recursivo: para cada TextInput nos children, injeta ref +
 * onFocus que dispara o scroll. Para outros elementos, recursa nos filhos.
 *
 * Importante: NAO usa hooks (apenas React.Children.map + cloneElement),
 * entao pode ser chamado recursivamente sem violar as regras dos hooks.
 * O InputWrapper sim usa hooks (useEffect pra cleanup), e ele e um
 * componente proprio, entao respeita as regras.
 */
function FocusCatcher({ children }: { children: React.ReactNode }) {
  const wrap = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node)) return node;
    const el = node as React.ReactElement<any>;
    const isTextInput =
      el.type === 'TextInput' ||
      (el.type as any)?.displayName === 'TextInput' ||
      (el.props && (el.props.onChangeText !== undefined || el.props.onChange !== undefined));

    if (isTextInput) {
      const key = nextKey();
      return <InputWrapper key={key} scrollKey={key} element={el} />;
    }

    // Para outros elementos, recursa nos children sem criar componente.
    if (el.props && el.props.children) {
      const newProps: any = { ...el.props };
      newProps.children = React.Children.map(el.props.children, wrap);
      return React.cloneElement(el, newProps);
    }
    return el;
  };
  return <>{React.Children.map(children, wrap)}</>;
}

/**
 * Wrapper em volta de cada TextInput. Como e um componente React proprio,
 * pode usar hooks legitimamente (useRef, useEffect).
 */
function InputWrapper({
  element,
  scrollKey,
}: {
  element: React.ReactElement<any>;
  scrollKey: string;
}) {
  const ctx = React.useContext(FormScrollContext);
  const localRef = useRef<RNTextInput | View | null>(null);
  // Se o element original ja tinha ref, mescla
  const originalRef = (element as any).ref;

  useEffect(() => {
    if (!ctx) return;
    // Sincroniza a ref local com a ref que o element vai usar
    // (atraves do setRef callback abaixo)
    return () => { try { ctx.unregisterInput(scrollKey); } catch {} };
  }, [ctx, scrollKey]);

  // Combina ref original + ref local
  const setRef = useCallback((node: any) => {
    localRef.current = node;
    if (typeof originalRef === 'function') {
      try { originalRef(node); } catch {}
    } else if (originalRef && typeof originalRef === 'object') {
      try { (originalRef as any).current = node; } catch {}
    }
    if (ctx && node) {
      try { ctx.registerInput(scrollKey, localRef as any); } catch {}
    }
  }, [ctx, originalRef, scrollKey]);

  const props: any = { ...element.props, ref: setRef };
  const originalOnFocus = props.onFocus;
  props.onFocus = (e: any) => {
    if (ctx) {
      try { ctx.setFocusedInput(scrollKey); } catch {}
      // Da tempo do evento de teclado comecar antes de medir
      setTimeout(() => { try { ctx.scrollToInput(scrollKey); } catch {} }, 50);
    }
    if (originalOnFocus) {
      try { originalOnFocus(e); } catch {}
    }
  };

  return React.cloneElement(element, props);
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
