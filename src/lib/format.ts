// Formatação e rótulos. Sem Intl/toLocaleString: o resultado é igual em
// Android, iOS e web (o Hermes nem sempre traz os dados de locale pt-BR).

function formatarNumero(valor: number, casas: number): string {
  const [inteiro, fracao] = Math.abs(valor).toFixed(casas).split('.');
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sinal = valor < 0 ? '-' : '';
  return sinal + comMilhar + (fracao ? ',' + fracao : '');
}

/** 1234.5 -> "R$ 1.234,50" */
export function real(valor: number): string {
  return 'R$ ' + formatarNumero(valor, 2);
}

/** 4.5 -> "4,50" */
export function decimal(valor: number): string {
  return formatarNumero(valor, 2);
}

/** "2026-12-25" -> "25/12/2026" (vazio vira "—") */
export function dataBR(data?: string | null): string {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return dia + '/' + mes + '/' + ano;
}

/** Confere "AAAA-MM-DD" e recusa datas que não existem (ex.: 2026-02-30). */
export function dataValida(data: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return false;
  const d = new Date(data + 'T12:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === data;
}

/** "25/12/2026" -> "2026-12-25" (null se for inválida) */
export function dataISO(textoBR: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(textoBR.trim());
  if (!m) return null;
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return dataValida(iso) ? iso : null;
}

/** Data de hoje em "AAAA-MM-DD" (fuso do aparelho). */
export function hojeISO(): string {
  const d = new Date();
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export const NOMES: Record<string, string> = {
  SERVIDO: 'Servido',
  CANCELADO: 'Cancelado',
  AGENDADO: 'Agendado',
  REALIZADO: 'Realizado',
  PIX: 'Pix',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
};

export const NOMES_DIA = [
  '', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira',
  'Sexta-feira', 'Sábado', 'Domingo',
];

export const TIPOS_EVENTO = ['Show', 'Aniversário', 'Workshop', 'Palestra', 'Conferência', 'Casamento'] as const;
export const FORMAS_PAGAMENTO = ['PIX', 'DINHEIRO', 'CARTAO'] as const;
export const STATUS_VENDA = ['SERVIDO', 'CANCELADO'] as const;
export const STATUS_EVENTO = ['AGENDADO', 'REALIZADO', 'CANCELADO'] as const;
