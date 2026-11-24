// Armazenamento persistente do Zustand. No aparelho usa o AsyncStorage; no
// render do servidor (web, sem window) usa um armazenamento vazio, para não quebrar.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const vazio: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const emServidor = typeof window === 'undefined';

export const storage = createJSONStorage(() => (emServidor ? vazio : AsyncStorage));
