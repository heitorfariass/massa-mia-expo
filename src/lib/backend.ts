// Funções de dados do app (vendas, eventos, cardápio, relatórios).
// Portado de lib/backend.js do projeto Next: agora roda no próprio aparelho.

import { dataValida, STATUS_EVENTO, TIPOS_EVENTO } from './format';
import { pedir, ponteiro } from './parse';
import type {
  DadosEdicaoEvento,
  DadosNovoEvento,
  DadosVenda,
  Evento,
  Item,
  ItemEntrada,
  Produto,
  Relatorios,
  Venda,
} from './types';

/** Documento cru do Parse. */
type Doc = Record<string, any> & { objectId: string };

// ---------- Leitura ----------

// O Parse devolve no máximo 1000 registros por consulta.
async function listar(classe: string, parametros = ''): Promise<Doc[]> {
  const json = await pedir<{ results: Doc[] }>('/classes/' + classe + '?limit=1000' + parametros);
  return json.results;
}

function descricao(produto: Doc): string {
  return (produto.categoria === 'PIZZA' ? 'Pizza ' : 'Bebida ') + produto.nome + ' (' + produto.tamanho + ')';
}

// Itens agrupados pelo objectId do pedido/evento dono ('pedido' ou 'evento')
async function itensPor(campo: 'pedido' | 'evento'): Promise<Record<string, Item[]>> {
  const where = encodeURIComponent(JSON.stringify({ [campo]: { $exists: true } }));
  const itens = await listar('ItemProduto', '&include=produto&where=' + where);
  const mapa: Record<string, Item[]> = {};
  for (const item of itens) {
    if (!item.produto) continue;
    const dono: string = item[campo].objectId;
    (mapa[dono] ||= []).push({
      produtoId: item.produto.objectId,
      descricao: descricao(item.produto),
      quantidade: item.quantidade,
      preco: item.precoUnitario,
    });
  }
  return mapa;
}

function somaItens(itens: Item[]): number {
  return itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
}

/** Vendas do salão, da mais recente para a mais antiga. */
export async function listarVendas(): Promise<Venda[]> {
  const [pedidos, itens] = await Promise.all([listar('Pedido', '&order=-numPedido'), itensPor('pedido')]);
  return pedidos.map((p) => {
    const lista = itens[p.objectId] || [];
    return { ...p, itens: lista, total: somaItens(lista) } as unknown as Venda;
  });
}

/** Eventos, do mais recente para o mais antigo. */
export async function listarEventos(): Promise<Evento[]> {
  const [eventos, itens] = await Promise.all([listar('Evento', '&order=-numEvento'), itensPor('evento')]);
  return eventos.map((e) => {
    const lista = itens[e.objectId] || [];
    const buffet = somaItens(lista);
    const ingresso: number = e.precoIngresso || 0;
    const ingressos = ingresso * (e.ingressosVendidos || 0);
    return { ...e, itens: lista, buffet, ingresso, ingressos, total: ingressos + buffet } as unknown as Evento;
  });
}

/** Cardápio (para os selects de produto). */
export async function listarProdutos(): Promise<Produto[]> {
  const produtos = await listar('Produto', '&order=categoria,nome');
  return produtos.map((p) => ({ ...p, descricao: descricao(p) }) as unknown as Produto);
}

// ---------- Relatórios (Cloud Code) ----------

/** Chama uma das 9 perguntas do dono (Cloud Code do Back4App). */
export async function chamarPergunta<T = any>(numero: number): Promise<T> {
  const json = await pedir<{ result: T }>('/functions/pergunta' + numero, 'POST', {});
  return json.result;
}

/** Busca as 9 perguntas de uma vez, já com nomes legíveis. */
export async function carregarRelatorios(): Promise<Relatorios> {
  const r = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => chamarPergunta(n)));
  return {
    ticketMedio: r[0],
    maisConsumidoPorDia: r[1],
    topSabores: r[2],
    buffet: r[3],
    salaoEmDiasDeEvento: r[4],
    satisfacao: r[5],
    maiorBuffet: r[6],
    receitaPorDia: r[7],
    faturamento: r[8],
  };
}

// ---------- Validação (as telas usam antes de enviar) ----------

function validarItens(itens: ItemEntrada[]): string | null {
  for (const item of itens) {
    if (!Number.isSafeInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 999) {
      return 'Confira as quantidades dos itens (de 1 a 999).';
    }
  }
  return null;
}

/** Devolve a mensagem de erro ou null se estiver tudo certo. */
export function validarVenda(dados: DadosVenda): string | null {
  if (!dados.cliente.trim()) return 'Informe o nome do cliente.';
  if (!dataValida(dados.data)) return 'Data inválida.';
  if (dados.status === 'SERVIDO') {
    if (dados.itens.length === 0) return 'Adicione pelo menos um item à venda.';
    if (!Number.isInteger(dados.avaliacao) || dados.avaliacao < 1 || dados.avaliacao > 5) {
      return 'A avaliação deve ser de 1 a 5.';
    }
  }
  if (dados.status === 'CANCELADO' && !dados.motivoCancelamento.trim()) {
    return 'Informe o motivo do cancelamento.';
  }
  return validarItens(dados.itens);
}

/** Devolve a mensagem de erro ou null se estiver tudo certo. */
export function validarEvento(dados: DadosNovoEvento): string | null {
  if (
    !dados.responsavel.trim() ||
    !(TIPOS_EVENTO as readonly string[]).includes(dados.tipo) ||
    !dataValida(dados.data) ||
    !Number.isSafeInteger(dados.capacidade) ||
    dados.capacidade < 1 ||
    dados.capacidade > 10000 ||
    !Number.isFinite(dados.precoIngresso) ||
    dados.precoIngresso < 0
  ) {
    return 'Preencha todos os campos com valores válidos.';
  }
  return validarItens(dados.itens);
}

// ---------- Escrita ----------

/** Grava o pedido e depois os itens; se um item falhar, desfaz o pedido. */
export async function criarVenda(dados: DadosVenda): Promise<{ objectId: string; numPedido: number | null }> {
  const { data, cliente, formaPagamento, status, avaliacao, motivoCancelamento, itens } = dados;
  const pedido = await pedir<Doc>('/classes/Pedido', 'POST', {
    data,
    cliente,
    formaPagamento,
    status,
    avaliacao: status === 'SERVIDO' ? avaliacao : 0,
    motivoCancelamento: status === 'CANCELADO' ? motivoCancelamento : '',
  });

  try {
    await Promise.all(
      itens.map((item) =>
        pedir('/classes/ItemProduto', 'POST', {
          produto: ponteiro('Produto', item.produtoId),
          quantidade: item.quantidade,
          pedido: ponteiro('Pedido', pedido.objectId),
        }),
      ),
    );
  } catch (erro) {
    await pedir('/classes/Pedido/' + pedido.objectId, 'DELETE').catch(() => {});
    throw erro;
  }
  return { objectId: pedido.objectId, numPedido: pedido.numPedido ?? null };
}

/** Agenda um evento (com buffet opcional); se um item falhar, desfaz o evento. */
export async function criarEvento(dados: DadosNovoEvento): Promise<{ objectId: string; numEvento: number | null }> {
  const erroValidacao = validarEvento(dados);
  if (erroValidacao) throw new Error(erroValidacao);

  const { data, tipo, responsavel, capacidade, precoIngresso, itens } = dados;
  const evento = await pedir<Doc>('/classes/Evento', 'POST', {
    data,
    tipo,
    responsavel: responsavel.trim(),
    capacidade,
    precoIngresso,
    status: 'AGENDADO',
  });

  try {
    await Promise.all(
      itens.map((item) =>
        pedir('/classes/ItemProduto', 'POST', {
          produto: ponteiro('Produto', item.produtoId),
          evento: ponteiro('Evento', evento.objectId),
          quantidade: item.quantidade,
        }),
      ),
    );
  } catch (erro) {
    await pedir('/classes/Evento/' + evento.objectId, 'DELETE').catch(() => {});
    throw erro;
  }

  // O POST só devolve objectId/createdAt; o número vem do Cloud Code.
  let numEvento: number | null = evento.numEvento ?? null;
  if (numEvento === null) {
    try {
      const detalhe = await pedir<Doc>('/classes/Evento/' + evento.objectId + '?keys=numEvento');
      numEvento = detalhe.numEvento ?? null;
    } catch {
      numEvento = null;
    }
  }
  return { objectId: evento.objectId, numEvento };
}

export async function removerVenda(id: string): Promise<void> {
  await pedir('/classes/Pedido/' + id, 'DELETE'); // Cloud Code apaga os itens em cascata
}

export async function removerEvento(id: string): Promise<void> {
  await pedir('/classes/Evento/' + id, 'DELETE');
}

function conferirStatusEvento(status: string) {
  if (!(STATUS_EVENTO as readonly string[]).includes(status)) throw new Error('Status de evento inválido.');
}

export async function atualizarStatusEvento(id: string, status: string): Promise<void> {
  conferirStatusEvento(status);
  await pedir('/classes/Evento/' + id, 'PUT', { status });
}

// Itens (ItemProduto) que pertencem a um pedido ou a um evento
async function itensDoDono(campo: 'pedido' | 'evento', classeDono: string, id: string): Promise<Doc[]> {
  const where = encodeURIComponent(JSON.stringify({ [campo]: ponteiro(classeDono, id) }));
  return listar('ItemProduto', '&where=' + where);
}

// Deixa os itens do pedido/evento iguais à lista recebida.
// Se o produto continua o mesmo, mantém o item (e o precoUnitario dele) e só
// atualiza a quantidade. Remove o que saiu e cria o que entrou.
async function sincronizarItens(
  campo: 'pedido' | 'evento',
  classeDono: string,
  id: string,
  itens: ItemEntrada[],
): Promise<void> {
  const desejado = new Map<string, number>();
  for (const item of itens) {
    desejado.set(item.produtoId, (desejado.get(item.produtoId) || 0) + Number(item.quantidade));
  }

  const atuais = await itensDoDono(campo, classeDono, id);
  const operacoes: Promise<unknown>[] = [];

  for (const atual of atuais) {
    const produtoId: string = atual.produto.objectId;
    if (!desejado.has(produtoId)) {
      operacoes.push(pedir('/classes/ItemProduto/' + atual.objectId, 'DELETE'));
      continue;
    }
    const quantidade = desejado.get(produtoId)!;
    desejado.delete(produtoId);
    if (quantidade !== atual.quantidade) {
      operacoes.push(pedir('/classes/ItemProduto/' + atual.objectId, 'PUT', { quantidade }));
    }
  }

  for (const [produtoId, quantidade] of desejado) {
    operacoes.push(
      pedir('/classes/ItemProduto', 'POST', {
        produto: ponteiro('Produto', produtoId),
        quantidade,
        [campo]: ponteiro(classeDono, id),
      }),
    );
  }

  await Promise.all(operacoes);
}

/** Edita um pedido já cadastrado (mesmos campos de criarVenda). */
export async function atualizarVenda(id: string, dados: DadosVenda): Promise<void> {
  const { data, cliente, formaPagamento, status, avaliacao, motivoCancelamento, itens } = dados;
  await pedir('/classes/Pedido/' + id, 'PUT', {
    data,
    cliente,
    formaPagamento,
    status,
    avaliacao: status === 'SERVIDO' ? avaliacao : 0,
    motivoCancelamento: status === 'CANCELADO' ? motivoCancelamento : '',
  });
  if (itens) await sincronizarItens('pedido', 'Pedido', id, itens);
}

/** Edita um evento já cadastrado. `itens` = buffet; o resto são campos da classe Evento. */
export async function atualizarEvento(id: string, { itens, ...campos }: DadosEdicaoEvento): Promise<void> {
  if (campos.status) conferirStatusEvento(campos.status);
  if (Object.keys(campos).length > 0) {
    await pedir('/classes/Evento/' + id, 'PUT', campos);
  }
  if (itens) await sincronizarItens('evento', 'Evento', id, itens);
}
