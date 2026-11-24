// Cliente HTTP do Back4App (Parse REST API). Toda conversa do app com o banco
// passa por aqui. As chaves vêm do .env.local (EXPO_PUBLIC_*): são as chaves
// públicas do cliente (App ID e JavaScript Key). A Master Key NUNCA entra no app.

// O Expo só troca process.env.EXPO_PUBLIC_X quando o nome aparece escrito por inteiro.
const SERVIDOR = (process.env.EXPO_PUBLIC_PARSE_SERVER_URL || 'https://parseapi.back4app.com').replace(/\/$/, '');
const APP_ID = process.env.EXPO_PUBLIC_PARSE_APP_ID;
const JS_KEY = process.env.EXPO_PUBLIC_PARSE_JS_KEY;

/** Erro devolvido pelo Back4App (ou de conexão). `codigo` é o código do Parse. */
export class ParseError extends Error {
  codigo: number;
  constructor(mensagem: string, codigo = 0) {
    super(mensagem);
    this.name = 'ParseError';
    this.codigo = codigo;
  }
}

export const CODIGO_SESSAO_INVALIDA = 209;

let sessionToken: string | null = null;
let aoSessaoInvalida: (() => void) | null = null;

/** O store de autenticação chama ao logar/deslogar/reabrir o app. */
export function setSessionToken(token: string | null) {
  sessionToken = token;
}

/** Função chamada quando o servidor recusa o token (sessão expirada). */
export function setAoSessaoInvalida(funcao: (() => void) | null) {
  aoSessaoInvalida = funcao;
}

export type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function pedir<T = any>(caminho: string, metodo: Metodo = 'GET', corpo?: unknown): Promise<T> {
  if (!APP_ID || !JS_KEY) {
    throw new ParseError('Back4App não configurado: crie o .env.local (veja .env.example) e reinicie o Expo.');
  }

  const cabecalhos: Record<string, string> = {
    'X-Parse-Application-Id': APP_ID,
    'X-Parse-JavaScript-Key': JS_KEY,
    'Content-Type': 'application/json',
  };
  if (sessionToken) cabecalhos['X-Parse-Session-Token'] = sessionToken;

  let resposta: Response;
  try {
    resposta = await fetch(SERVIDOR + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ParseError('Sem conexão com o servidor. Verifique sua internet e tente de novo.');
  }

  let json: any = null;
  try {
    json = await resposta.json();
  } catch {
    // resposta sem corpo JSON: segue com null
  }

  if (!resposta.ok) {
    const codigo: number = json?.code ?? 0;
    if (codigo === CODIGO_SESSAO_INVALIDA && sessionToken) aoSessaoInvalida?.();
    throw new ParseError(json?.error || 'Erro ' + resposta.status + ' no Back4App', codigo);
  }
  return json as T;
}

/** Ponteiro Parse para um objeto de outra classe. */
export function ponteiro(classe: string, id: string) {
  return { __type: 'Pointer', className: classe, objectId: id };
}
