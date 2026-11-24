// API externa: BrasilAPI (feriados nacionais). Não precisa de chave.
// Se a API falhar, devolve null e o formulário segue normal.

import { dataValida } from './format';

type Feriado = { date: string; name: string };

// A lista do ano muda pouco: cache em memória por ano.
const cache = new Map<string, Feriado[]>();

/** "2026-12-25" -> "Natal" (ou null se não for feriado / a API falhar) */
export async function buscarFeriado(data: string): Promise<string | null> {
  if (!dataValida(data)) return null;
  try {
    const ano = data.slice(0, 4);
    let feriados = cache.get(ano);
    if (!feriados) {
      const resposta = await fetch('https://brasilapi.com.br/api/feriados/v1/' + ano);
      if (!resposta.ok) return null;
      feriados = (await resposta.json()) as Feriado[];
      cache.set(ano, feriados);
    }
    return feriados.find((f) => f.date === data)?.name ?? null;
  } catch {
    return null;
  }
}
