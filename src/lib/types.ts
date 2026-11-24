// Tipos das 4 classes do Back4App (+ usuário) usados pelo app.

export type StatusVenda = 'SERVIDO' | 'CANCELADO';
export type StatusEvento = 'AGENDADO' | 'REALIZADO' | 'CANCELADO';
export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CARTAO';
export type CategoriaProduto = 'PIZZA' | 'BEBIDA';
export type Papel = 'proprietario' | 'funcionario';

export interface Produto {
  objectId: string;
  nome: string;
  categoria: CategoriaProduto;
  tamanho: string;
  preco: number;
  /** Ex.: "Pizza Calabresa (Grande)" */
  descricao: string;
}

/** Item (pizza/bebida) de um pedido ou do buffet de um evento. */
export interface Item {
  produtoId: string;
  descricao: string;
  quantidade: number;
  preco: number;
}

/** Item como o formulário envia: só o produto e a quantidade. */
export interface ItemEntrada {
  produtoId: string;
  quantidade: number;
}

export interface Venda {
  objectId: string;
  numPedido: number;
  /** AAAA-MM-DD */
  data: string;
  cliente: string;
  formaPagamento: FormaPagamento;
  status: StatusVenda;
  avaliacao: number;
  motivoCancelamento: string;
  diaSemana: number;
  itens: Item[];
  total: number;
}

export interface Evento {
  objectId: string;
  numEvento: number;
  /** AAAA-MM-DD */
  data: string;
  tipo: string;
  responsavel: string;
  capacidade: number;
  precoIngresso: number;
  ingressosVendidos: number;
  publicoReal: number;
  avaliacao: number;
  status: StatusEvento;
  diaSemana: number;
  /** Valor do buffet (soma dos itens) */
  buffet: number;
  itens: Item[];
  /** precoIngresso, repetido por conveniência nas telas */
  ingresso: number;
  /** Receita de ingressos (preço x vendidos) */
  ingressos: number;
  /** ingressos + buffet */
  total: number;
}

export interface DadosVenda {
  data: string;
  cliente: string;
  formaPagamento: FormaPagamento;
  status: StatusVenda;
  avaliacao: number;
  motivoCancelamento: string;
  itens: ItemEntrada[];
}

export interface DadosNovoEvento {
  data: string;
  tipo: string;
  responsavel: string;
  capacidade: number;
  precoIngresso: number;
  itens: ItemEntrada[];
}

/** Campos editáveis de um evento (só os reais da classe Evento) + buffet. */
export interface DadosEdicaoEvento {
  data?: string;
  tipo?: string;
  responsavel?: string;
  capacidade?: number;
  precoIngresso?: number;
  ingressosVendidos?: number;
  publicoReal?: number;
  avaliacao?: number;
  status?: StatusEvento;
  itens?: ItemEntrada[];
}

export interface Usuario {
  objectId: string;
  username: string;
  email: string;
  nome: string;
  papel: Papel;
  sessionToken: string;
}

// ---- Relatórios (Cloud Code: pergunta1..pergunta9) ----

export interface MaisConsumido {
  produtos: string[];
  quantidade: number;
}

export interface Relatorios {
  /** P1: ticket médio */
  ticketMedio: { salao: number; eventos: number; combinado: number };
  /** P2: produto mais consumido por dia da semana */
  maisConsumidoPorDia: {
    dia: number;
    nomeDia: string;
    salao: MaisConsumido | null;
    eventos: MaisConsumido | null;
    combinado: MaisConsumido | null;
  }[];
  /** P3: top 3 sabores */
  topSabores: { sabor: string; quantidade: number }[];
  /** P4: eventos com buffet */
  buffet: {
    eventosRealizados: number;
    comBuffet: number;
    percentual: number;
    receitaMedia: number;
    itensMedios: number;
  };
  /** P5: salão em dias com evento */
  salaoEmDiasDeEvento: { vendas: number; faturamento: number };
  /** P6: satisfação média */
  satisfacao: { salao: number; eventos: number; combinado: number };
  /** P7: evento com maior buffet (null se não houver) */
  maiorBuffet: {
    numEvento: number;
    nome?: string;
    tipo: string;
    diaSemana: number;
    nomeDia: string;
    valorBuffet: number;
  } | null;
  /** P8: receita por dia da semana */
  receitaPorDia: {
    dia: number;
    nomeDia: string;
    total: number;
    salao: number;
    percSalao: number;
    eventos: number;
    percEventos: number;
    eventosRealizados: number;
  }[];
  /** P9: faturamento total */
  faturamento: {
    receitaSalao: number;
    vendasServidas: number;
    receitaEventos: number;
    faturamento: number;
  };
}
