import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  AlertMessage,
  Button,
  Card,
  DateField,
  EmptyState,
  Header,
  ItemRow,
  Screen,
  SelectField,
  TextField,
} from '@/components/ui';
import {
  FORMAS_PAGAMENTO,
  NOMES,
  STATUS_VENDA,
  hojeISO,
  real,
} from '@/lib/format';
import type { FormaPagamento, ItemEntrada, StatusVenda } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useDados } from '@/store/dados';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

/** A página para de crescer em tablets e na web, como as outras telas. */
const LARGURA_MAXIMA = 720;

const OPCOES_PAGAMENTO = FORMAS_PAGAMENTO.map((valor) => ({ value: valor, label: NOMES[valor] }));
const OPCOES_STATUS = STATUS_VENDA.map((valor) => ({ value: valor, label: NOMES[valor] }));
const OPCOES_AVALIACAO = [5, 4, 3, 2, 1].map((nota) => ({
  value: String(nota),
  label: `${nota} de 5`,
}));

type Mensagem = { tipo: 'success' | 'error'; texto: string };

/** Título da tela: etiqueta, nome e explicação. */
function Titulo() {
  return (
    <View style={styles.heading}>
      <Text style={styles.eyebrow}>ROTINA DO RESTAURANTE · VENDAS</Text>
      <Text style={styles.title}>Registrar venda</Text>
      <Text style={styles.intro}>Lance os dados do pedido atendido no restaurante.</Text>
    </View>
  );
}

export default function RegistrarVendaScreen() {
  const usuario = useAuth((state) => state.usuario);

  // Cardápio vindo do store (listarProdutos no Back4App).
  const produtos = useDados((state) => state.produtos);
  const carregandoProdutos = useDados((state) => state.carregando.produtos);
  const erroProdutos = useDados((state) => state.erros.produtos);
  const carregarProdutos = useDados((state) => state.carregarProdutos);
  const registrarVenda = useDados((state) => state.registrarVenda);

  const [data, setData] = useState(hojeISO());
  const [cliente, setCliente] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('PIX');
  const [status, setStatus] = useState<StatusVenda>('SERVIDO');
  const [avaliacao, setAvaliacao] = useState('5');
  const [motivo, setMotivo] = useState('');
  const [itens, setItens] = useState<ItemEntrada[]>([]);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [quantidade, setQuantidade] = useState('1');
  const [mensagem, setMensagem] = useState<Mensagem | null>(null);
  const [enviando, setEnviando] = useState(false);
  // Muda a cada venda salva para limpar o campo de data (DateField guarda o próprio texto).
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    void carregarProdutos();
  }, [carregarProdutos]);

  if (!usuario || usuario.papel !== 'funcionario') return <Redirect href="/" />;

  const header = <Header area="Funcionário" painel="/funcionario" pagina="Registrar venda" />;
  const recarregar = () => void carregarProdutos();

  // Sem cardápio ainda: carregando ou erro com opção de tentar de novo.
  if (produtos.length === 0) {
    return (
      <Screen header={header} refreshing={carregandoProdutos} onRefresh={recarregar}>
        <View style={styles.page}>
          <Titulo />
          {erroProdutos ? (
            <>
              <AlertMessage
                variant="error"
                title="Não foi possível carregar o cardápio"
                message={erroProdutos}
              />
              <EmptyState
                title="Cardápio indisponível"
                description="Confira a conexão com o Back4App e tente novamente."
                actionLabel="Tentar novamente"
                onAction={recarregar}
              />
            </>
          ) : carregandoProdutos ? (
            <AlertMessage variant="loading" message="Carregando o cardápio..." />
          ) : (
            <EmptyState
              title="Nenhum produto cadastrado"
              description="Cadastre os produtos no Back4App para registrar vendas."
              actionLabel="Recarregar"
              onAction={recarregar}
            />
          )}
        </View>
      </Screen>
    );
  }

  const servido = status === 'SERVIDO';
  const opcoesProduto = produtos.map((produto) => ({
    value: produto.objectId,
    label: `${produto.descricao} — ${real(produto.preco)}`,
  }));
  const produtoPorId = (id: string) => produtos.find((produto) => produto.objectId === id);
  const total = itens.reduce(
    (soma, item) => soma + (produtoPorId(item.produtoId)?.preco ?? 0) * item.quantidade,
    0,
  );

  function adicionarItem() {
    const qtd = Number(quantidade);
    if (!produtoId) {
      setMensagem({ tipo: 'error', texto: 'Selecione o produto para adicionar.' });
      return;
    }
    if (!Number.isSafeInteger(qtd) || qtd < 1 || qtd > 999) {
      setMensagem({ tipo: 'error', texto: 'A quantidade deve ser de 1 a 999.' });
      return;
    }
    setMensagem(null);
    // Produto repetido soma na mesma linha.
    setItens((atuais) =>
      atuais.some((item) => item.produtoId === produtoId)
        ? atuais.map((item) =>
            item.produtoId === produtoId
              ? { ...item, quantidade: Math.min(item.quantidade + qtd, 999) }
              : item,
          )
        : [...atuais, { produtoId, quantidade: qtd }],
    );
    setProdutoId(null);
    setQuantidade('1');
  }

  function removerItem(id: string) {
    setItens((atuais) => atuais.filter((item) => item.produtoId !== id));
  }

  async function enviar() {
    setMensagem(null);
    setEnviando(true);
    try {
      const resultado = await registrarVenda({
        data,
        cliente: cliente.trim(),
        formaPagamento,
        status,
        avaliacao: Number(avaliacao),
        motivoCancelamento: motivo.trim(),
        itens: servido ? itens : [],
      });
      setMensagem({
        tipo: 'success',
        texto: resultado.numPedido
          ? `A venda ${resultado.numPedido} foi registrada com sucesso.`
          : 'A venda foi registrada com sucesso.',
      });
      setCliente('');
      setMotivo('');
      setItens([]);
      setProdutoId(null);
      setQuantidade('1');
      setData(hojeISO());
      setFormKey((atual) => atual + 1);
    } catch (e) {
      setMensagem({ tipo: 'error', texto: (e as Error).message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Screen header={header} refreshing={carregandoProdutos} onRefresh={recarregar}>
      <View style={styles.page}>
        <Titulo />

        <Card title="Informações da venda" subtitle="* Campos obrigatórios">
          <View style={styles.numero}>
            <Text style={styles.numeroLabel}>Número da venda</Text>
            <Text style={styles.numeroValor}>Gerado ao salvar</Text>
            <Text style={styles.numeroHint}>Numeração definida automaticamente pelo sistema.</Text>
          </View>

          <DateField key={formKey} label="Data da venda" value={data} onChange={setData} required />
          <TextField
            label="Nome do cliente"
            placeholder="Nome completo"
            value={cliente}
            onChangeText={setCliente}
            maxLength={100}
            autoComplete="name"
            required
          />
          <SelectField
            label="Forma de pagamento"
            value={formaPagamento}
            options={OPCOES_PAGAMENTO}
            onChange={(valor) => setFormaPagamento(valor as FormaPagamento)}
          />
          <SelectField
            label="Status da venda"
            value={status}
            options={OPCOES_STATUS}
            onChange={(valor) => setStatus(valor as StatusVenda)}
          />
          {servido ? (
            <SelectField
              label="Avaliação do cliente"
              value={avaliacao}
              options={OPCOES_AVALIACAO}
              onChange={setAvaliacao}
            />
          ) : null}
        </Card>

        {servido ? (
          <Card title="Itens do pedido" subtitle="Escolha o produto e a quantidade.">
            <SelectField
              label="Produto"
              placeholder="Selecione o produto"
              value={produtoId}
              options={opcoesProduto}
              onChange={setProdutoId}
              emptyMessage="Nenhum produto encontrado"
            />
            <TextField
              label="Quantidade"
              value={quantidade}
              onChangeText={(texto) => setQuantidade(texto.replace(/\D/g, '').slice(0, 3))}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={3}
            />
            <Button label="+ Adicionar item" variant="outline" onPress={adicionarItem} />

            {itens.length === 0 ? (
              <AlertMessage variant="empty" message="Nenhum item adicionado ainda." />
            ) : (
              <View style={styles.itens}>
                {itens.map((item) => {
                  const produto = produtoPorId(item.produtoId);
                  const preco = produto?.preco ?? 0;
                  return (
                    <ItemRow
                      key={item.produtoId}
                      produto={produto?.descricao ?? 'Produto'}
                      quantidade={item.quantidade}
                      precoUnitario={preco}
                      subtotal={preco * item.quantidade}
                      onRemove={() => removerItem(item.produtoId)}
                    />
                  );
                })}
              </View>
            )}

            <View style={styles.total}>
              <Text style={styles.totalLabel}>Total da venda</Text>
              <Text style={styles.totalValor}>{real(total)}</Text>
            </View>
          </Card>
        ) : (
          <Card title="Cancelamento">
            <TextField
              label="Motivo do cancelamento"
              placeholder="Ex.: Cliente desistiu"
              value={motivo}
              onChangeText={setMotivo}
              maxLength={200}
              multiline
              required
            />
          </Card>
        )}

        {mensagem ? (
          <AlertMessage
            variant={mensagem.tipo}
            title={mensagem.tipo === 'success' ? 'Venda registrada' : 'Não foi possível salvar'}
            message={mensagem.texto}
          />
        ) : null}

        <Button
          label="Registrar venda"
          variant="danger"
          size="lg"
          loading={enviando}
          onPress={() => void enviar()}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Página centralizada, com largura máxima em tablet e web.
  page: {
    width: '100%',
    maxWidth: LARGURA_MAXIMA,
    alignSelf: 'center',
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heading: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    color: colors.dangerDark,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  intro: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textMuted,
  },
  numero: {
    gap: 2,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  numeroLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  numeroValor: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  numeroHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  itens: {
    gap: spacing.sm,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentLight,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  totalLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  totalValor: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.xl,
    color: colors.dangerDark,
  },
});
