// Autenticação integrada ao Back4App (usuários do Parse: /login, /users, /logout).

import { ParseError, pedir } from './parse';
import type { Papel, Usuario } from './types';

type UsuarioParse = {
  objectId: string;
  username: string;
  email?: string;
  nome?: string;
  papel?: Papel;
  sessionToken: string;
};

function paraUsuario(u: UsuarioParse): Usuario {
  return {
    objectId: u.objectId,
    username: u.username,
    email: u.email ?? '',
    nome: u.nome ?? u.username,
    // Quem não tem papel definido é funcionário. O proprietário é marcado
    // direto no Dashboard do Back4App (campo `papel` = "proprietario").
    papel: u.papel === 'proprietario' ? 'proprietario' : 'funcionario',
    sessionToken: u.sessionToken,
  };
}

// Códigos do Parse -> mensagens para a tela
function traduzir(erro: unknown): Error {
  if (!(erro instanceof ParseError)) return erro as Error;
  switch (erro.codigo) {
    case 101:
      return new ParseError('Usuário ou senha incorretos.', 101);
    case 200:
    case 201:
      return new ParseError('Preencha usuário e senha.', erro.codigo);
    case 202:
      return new ParseError('Esse nome de usuário já está em uso.', 202);
    case 203:
      return new ParseError('Esse e-mail já está cadastrado.', 203);
    case 125:
      return new ParseError('E-mail inválido.', 125);
    case 209:
      return new ParseError('Sua sessão expirou. Entre novamente.', 209);
    default:
      return erro;
  }
}

export async function entrar(username: string, password: string): Promise<Usuario> {
  if (!username.trim() || !password) throw new ParseError('Preencha usuário e senha.', 200);
  try {
    const u = await pedir<UsuarioParse>('/login', 'POST', { username: username.trim(), password });
    return paraUsuario(u);
  } catch (erro) {
    throw traduzir(erro);
  }
}

export interface DadosCadastro {
  nome: string;
  email: string;
  username: string;
  password: string;
}

/** Cria a conta e já devolve o usuário logado. Toda conta nova é "funcionario". */
export async function cadastrar(dados: DadosCadastro): Promise<Usuario> {
  const { nome, email, username, password } = dados;
  if (!nome.trim() || !username.trim() || !email.trim()) throw new ParseError('Preencha todos os campos.');
  if (password.length < 6) throw new ParseError('A senha deve ter pelo menos 6 caracteres.');
  try {
    const criado = await pedir<{ objectId: string; sessionToken: string }>('/users', 'POST', {
      username: username.trim(),
      password,
      email: email.trim(),
      nome: nome.trim(),
    });
    return paraUsuario({
      objectId: criado.objectId,
      sessionToken: criado.sessionToken,
      username: username.trim(),
      email: email.trim(),
      nome: nome.trim(),
    });
  } catch (erro) {
    throw traduzir(erro);
  }
}

/** Encerra a sessão no servidor (falhas de rede são ignoradas: o app sai de qualquer jeito). */
export async function sair(): Promise<void> {
  try {
    await pedir('/logout', 'POST', {});
  } catch {
    // sessão já inválida ou sem internet
  }
}

/** Confere no servidor se o token salvo ainda vale e traz os dados atualizados. */
export async function buscarUsuarioAtual(sessionToken: string): Promise<Usuario> {
  const u = await pedir<Omit<UsuarioParse, 'sessionToken'>>('/users/me');
  return paraUsuario({ ...u, sessionToken });
}
