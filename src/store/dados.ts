// Estado global dos dados do negócio (Zustand): vendas, eventos, cardápio e relatórios.
// As telas leem do store e chamam as ações; depois de cada gravação o store
// busca a lista de novo, então a UI sempre mostra o que está no banco.

import { create } from 'zustand';

import * as backend from '@/lib/backend';
import type {
  DadosEdicaoEvento,
  DadosNovoEvento,
  DadosVenda,
  Evento,
  Produto,
  Relatorios,
  Venda,
} from '@/lib/types';

type Recurso = 'vendas' | 'eventos' | 'produtos' | 'relatorios';

interface DadosState {
  vendas: Venda[];
  eventos: Evento[];
  produtos: Produto[];
  relatorios: Relatorios | null;
  /** Recursos em carregamento, ex.: carregando.vendas */
  carregando: Record<Recurso, boolean>;
  /** Último erro de leitura por recurso (null = sem erro) */
  erros: Record<Recurso, string | null>;

  carregarVendas: () => Promise<void>;
  carregarEventos: () => Promise<void>;
  carregarProdutos: () => Promise<void>;
  carregarRelatorios: () => Promise<void>;

  // Escritas: lançam Error com mensagem pronta para a tela (use try/catch).
  registrarVenda: (dados: DadosVenda) => Promise<{ objectId: string; numPedido: number | null }>;
  editarVenda: (id: string, dados: DadosVenda) => Promise<void>;
  removerVenda: (id: string) => Promise<void>;
  agendarEvento: (dados: DadosNovoEvento) => Promise<{ objectId: string; numEvento: number | null }>;
  editarEvento: (id: string, dados: DadosEdicaoEvento) => Promise<void>;
  alterarStatusEvento: (id: string, status: string) => Promise<void>;
  removerEvento: (id: string) => Promise<void>;

  /** Esvazia tudo (chamado no logout). */
  limpar: () => void;
}

const semCarregar = { vendas: false, eventos: false, produtos: false, relatorios: false };
const semErro = { vendas: null, eventos: null, produtos: null, relatorios: null };

export const useDados = create<DadosState>()((set, get) => {
  // Busca um recurso e guarda o resultado (ou a mensagem de erro).
  async function buscar<K extends 'vendas' | 'eventos' | 'produtos' | 'relatorios'>(
    recurso: K,
    leitura: () => Promise<DadosState[K]>,
  ) {
    set((s) => ({
      carregando: { ...s.carregando, [recurso]: true },
      erros: { ...s.erros, [recurso]: null },
    }));
    try {
      const resultado = await leitura();
      set((s) => ({
        [recurso]: resultado,
        carregando: { ...s.carregando, [recurso]: false },
      }) as Partial<DadosState>);
    } catch (e) {
      set((s) => ({
        carregando: { ...s.carregando, [recurso]: false },
        erros: { ...s.erros, [recurso]: (e as Error).message },
      }));
    }
  }

  return {
    vendas: [],
    eventos: [],
    produtos: [],
    relatorios: null,
    carregando: { ...semCarregar },
    erros: { ...semErro },

    carregarVendas: () => buscar('vendas', backend.listarVendas),
    carregarEventos: () => buscar('eventos', backend.listarEventos),
    carregarProdutos: () => buscar('produtos', backend.listarProdutos),
    carregarRelatorios: () => buscar('relatorios', backend.carregarRelatorios),

    async registrarVenda(dados) {
      const erro = backend.validarVenda(dados);
      if (erro) throw new Error(erro);
      const resultado = await backend.criarVenda(dados);
      await get().carregarVendas();
      return resultado;
    },

    async editarVenda(id, dados) {
      const erro = backend.validarVenda(dados);
      if (erro) throw new Error(erro);
      await backend.atualizarVenda(id, dados);
      await get().carregarVendas();
    },

    async removerVenda(id) {
      await backend.removerVenda(id);
      set((s) => ({ vendas: s.vendas.filter((v) => v.objectId !== id) }));
    },

    async agendarEvento(dados) {
      const resultado = await backend.criarEvento(dados);
      await get().carregarEventos();
      return resultado;
    },

    async editarEvento(id, dados) {
      await backend.atualizarEvento(id, dados);
      await get().carregarEventos();
    },

    async alterarStatusEvento(id, status) {
      await backend.atualizarStatusEvento(id, status);
      await get().carregarEventos();
    },

    async removerEvento(id) {
      await backend.removerEvento(id);
      set((s) => ({ eventos: s.eventos.filter((e) => e.objectId !== id) }));
    },

    limpar: () =>
      set({
        vendas: [],
        eventos: [],
        produtos: [],
        relatorios: null,
        carregando: { ...semCarregar },
        erros: { ...semErro },
      }),
  };
});
