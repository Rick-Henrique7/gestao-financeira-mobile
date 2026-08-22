import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// ─── REDUCE MOTION HOOK ───────────────────────────────────────────────────────
// Retorna `true` quando o usuario ativou "Reduzir animacoes" nas
// configuracoes de acessibilidade do sistema operacional.
// Componentes devem usar isso para trocar `animationType="slide"`
// por `animationType="none"` em <Modal>, evitando animacoes
// prejudiciais a pessoas sensiveis a movimento.

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => { if (mounted) setReduced(v); })
      .catch(() => { /* no-op em plataformas que nao suportam */ });
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (e) => { if (mounted) setReduced(e.reduceMotionEnabled); }
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

// Helper: retorna o animationType seguro para <Modal>
export function safeModalAnimation(reduced: boolean): 'none' | 'slide' | 'fade' {
  if (reduced) return 'none';
  return 'slide';
}
