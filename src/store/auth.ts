// Estado global de autenticação (Zustand). A sessão fica salva no aparelho.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as auth from '@/lib/auth';
import type { DadosCadastro } from '@/lib/auth';
import { setAoSessaoInvalida, setSessionToken } from '@/lib/parse';
import { storage } from '@/lib/storage';
import type { Usuario } from '@/lib/types';

interface AuthState {
  usuario: Usuario | null;
  /** true depois de ler a sessão salva no aparelho (use para segurar a splash). */
  hidratado: boolean;
  /** true enquanto uma chamada de login/cadastro está em andamento */
  carregando: boolean;
  erro: string | null;

  entrar: (username: string, password: string) => Promise<boolean>;
  cadastrar: (dados: DadosCadastro) => Promise<boolean>;
  sair: () => Promise<void>;
  limparErro: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      hidratado: false,
      carregando: false,
      erro: null,

      async entrar(username, password) {
        set({ carregando: true, erro: null });
        try {
          const usuario = await auth.entrar(username, password);
          setSessionToken(usuario.sessionToken);
          set({ usuario, carregando: false });
          return true;
        } catch (e) {
          set({ carregando: false, erro: (e as Error).message });
          return false;
        }
      },

      async cadastrar(dados) {
        set({ carregando: true, erro: null });
        try {
          const usuario = await auth.cadastrar(dados);
          setSessionToken(usuario.sessionToken);
          set({ usuario, carregando: false });
          return true;
        } catch (e) {
          set({ carregando: false, erro: (e as Error).message });
          return false;
        }
      },

      async sair() {
        if (get().usuario) await auth.sair();
        setSessionToken(null);
        set({ usuario: null, erro: null });
      },

      limparErro: () => set({ erro: null }),
    }),
    {
      name: 'massa-mia-auth',
      storage,
      partialize: (estado) => ({ usuario: estado.usuario }),
      onRehydrateStorage: () => (estado) => {
        // Reabriu o app: devolve o token ao cliente HTTP e confere se ainda vale.
        const token = estado?.usuario?.sessionToken ?? null;
        setSessionToken(token);
        useAuth.setState({ hidratado: true });
        if (token) {
          auth
            .buscarUsuarioAtual(token)
            .then((usuario) => useAuth.setState({ usuario }))
            .catch(() => {
              // Só desloga se o servidor recusou o token (o aviso vem de setAoSessaoInvalida).
              // Sem internet, mantém a sessão salva.
            });
        }
      },
    },
  ),
);

// Token recusado pelo servidor (expirou/foi revogado): volta para o login.
setAoSessaoInvalida(() => {
  setSessionToken(null);
  useAuth.setState({ usuario: null, erro: 'Sua sessão expirou. Entre novamente.' });
});
