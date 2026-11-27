import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { DadosCadastro } from "@/lib/auth";
import * as auth from "@/lib/auth";
import { setAoSessaoInvalida, setSessionToken } from "@/lib/parse";
import { storage } from "@/lib/storage";
import type { Papel, Usuario } from "@/lib/types";

interface AuthState {
  usuario: Usuario | null;
  /** true depois de ler a sessão salva no aparelho (use para segurar a splash). */
  hidratado: boolean;
  /** true enquanto uma chamada de login/cadastro está em andamento */
  carregando: boolean;
  erro: string | null;

  entrar: (
    username: string,
    password: string,
    papel?: Papel,
  ) => Promise<boolean>;
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

      async entrar(username, password, papel) {
        set({ carregando: true, erro: null });
        try {
          const usuario = await auth.entrar(username, password);
          setSessionToken(usuario.sessionToken);
          if (papel && usuario.papel !== papel) {
            await auth.sair();
            setSessionToken(null);
            const area =
              usuario.papel === "proprietario" ? "proprietário" : "funcionário";
            set({
              carregando: false,
              erro:
                "Essa conta é de " +
                area +
                ". Volte e entre pela área do " +
                area +
                ".",
            });
            return false;
          }
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
      name: "massa-mia-auth",
      storage,
      partialize: (estado) => ({ usuario: estado.usuario }),
      onRehydrateStorage: () => (estado) => {
        const token = estado?.usuario?.sessionToken ?? null;
        setSessionToken(token);
        useAuth.setState({ hidratado: true });
        if (token) {
          auth
            .buscarUsuarioAtual(token)
            .then((usuario) => useAuth.setState({ usuario }))
            .catch(() => {});
        }
      },
    },
  ),
);

setAoSessaoInvalida(() => {
  setSessionToken(null);
  useAuth.setState({
    usuario: null,
    erro: "Sua sessão expirou. Entre novamente.",
  });
});
