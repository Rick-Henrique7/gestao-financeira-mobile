/**
 * Estrategia de auto-scroll pro input focado.
 *
 * Problema: UIManager.measureLayout foi removido na nova arquitetura
 * (Fabric) do RN 0.83, entao a abordagem antiga (cloneElement +
 * onFocus + measureLayout) quebrou com erro 'measureLayout is not
 * available in the new React Native architecture'.
 *
 * Substituto correto: o `ref.current.measure(callback)` continua
 * funcionando no Fabric — ele expoe a posicao absoluta do node na
 * janela (window). E o que precisamos para calcular o scroll.
 *
 * O FormModal expoe:
 *   - registerInput(key, ref): para o FocusCatcher registrar refs
 *     dos TextInputs que aparecem dentro do children.
 *   - scrollToInput(key): faz o ScrollView rolar ate deixar o input
 *     visivel acima do teclado.
 *
 * O FocusCatcher clona recursivamente o children e:
 *   1) Para cada TextInput/View, captura a ref via React.cloneElement
 *      (se a ref ja foi passada) ou cria uma nova ref e injeta.
 *   2) Envolve o onFocus para chamar scrollToInput(key) com a ref.
 */
import { createContext, useContext } from 'react';
import type { RefObject } from 'react';
import type { TextInput, View, ScrollView, KeyboardEvent } from 'react-native';

export interface FormScrollApi {
  registerInput: (key: string, ref: RefObject<TextInput | View | null>) => void;
  unregisterInput: (key: string) => void;
  scrollToInput: (key: string) => void;
  /** Subscribe para receber keyboardDidShow e refazer scroll do input focado. */
  subscribeKeyboard: (cb: (key: string | null) => void) => () => void;
  /** Notifica qual input foi focado por ultimo. */
  setFocusedInput: (key: string | null) => void;
  /** Notifica a altura do teclado. */
  setKeyboardHeight: (h: number) => void;
}

export const FormScrollContext = createContext<FormScrollApi | null>(null);

export function useFormScroll() {
  return useContext(FormScrollContext);
}

export type { TextInput, View, ScrollView, KeyboardEvent };
