import { useEffect, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AlertMessage, Card, EmptyState, Header, Screen } from '@/components/ui';
import { decimal, real } from '@/lib/format';
import type { MaisConsumido } from '@/lib/types';
import { useDados } from '@/store/dados';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

/** Em tablets e na web a página para de crescer, como o site (que limita a 1280px). */
const LARGURA_MAXIMA = 1080;

/** "Pizza Calabresa / Pizza Marguerita · 3" (mesmo formato do site). */
function maisConsumido(item: MaisConsumido | null): string {
  if (!item) return '—';
  return `${item.produtos.join(' / ')} · ${item.quantidade}`;
}

/**
 * Medidas da tela: no celular os cartões ficam em uma coluna; a partir de
 * 560px de conteúdo (tablet deitado / web) entram duas colunas e, com 880px,
 * três. `compacto` cobre celulares estreitos, onde os números precisam de
 * fonte menor para não serem cortados.
 */
function useLayout() {
  const { width } = useWindowDimensions();
  const disponivel = Math.max(0, Math.min(width, LARGURA_MAXIMA) - spacing.lg * 2);
  const colunas = disponivel >= 880 ? 3 : disponivel >= 560 ? 2 : 1;

  return {
    colunas,
    largo: colunas > 1,
    compacto: width < 380,
    larguraCartao:
      colunas > 1 ? Math.floor((disponivel - spacing.md * (colunas - 1)) / colunas) : undefined,
  };
}

/** Título da tela: etiqueta, nome e explicação. */
function Titulo({ compacto }: { compacto: boolean }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.eyebrow}>GESTÃO · ANÁLISE DO NEGÓCIO</Text>
      <Text style={[styles.title, compacto ? styles.titleCompacto : null]}>Relatórios</Text>
      <Text style={styles.intro}>Indicadores do salão e dos eventos em uma visão integrada.</Text>
    </View>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {titulo}
      </Text>
      {children}
    </View>
  );
}

/** Célula da grade: largura fixa em telas largas e 100% no celular. */
function Celula({ largura, children }: { largura?: number; children: ReactNode }) {
  return <View style={[styles.celula, largura ? { width: largura } : null]}>{children}</View>;
}

/** Linha "rótulo à esquerda, valor à direita" (ticket médio, buffet). */
function LinhaResumo({ label, valor, ultimo = false }: { label: string; valor: string; ultimo?: boolean }) {
  return (
    <View style={[styles.resumoRow, ultimo ? null : styles.divider]}>
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={styles.resumoValue}>{valor}</Text>
    </View>
  );
}

/** Uma das três colunas de valores de um dia da semana. */
function ValorDia({
  label,
  valor,
  compacto,
  destaque = false,
}: {
  label: string;
  valor: string;
  compacto: boolean;
  destaque?: boolean;
}) {
  return (
    <View style={styles.diaValue}>
      <Text style={styles.diaValueLabel}>{label}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={[
          styles.diaValueNumber,
          compacto ? styles.diaValueNumberCompacto : null,
          destaque ? styles.diaValueNumberStrong : null,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

export default function RelatoriosScreen() {
  const { largo, compacto, larguraCartao } = useLayout();

  // Dados vindos do store, que chama as 9 Cloud Functions (pergunta1..9) do Back4App.
  const relatorios = useDados((state) => state.relatorios);
  const carregando = useDados((state) => state.carregando.relatorios);
  const erro = useDados((state) => state.erros.relatorios);
  const carregarRelatorios = useDados((state) => state.carregarRelatorios);

  useEffect(() => {
    void carregarRelatorios();
  }, [carregarRelatorios]);

  const header = <Header area="Proprietário" painel="/proprietario" pagina="Relatórios" />;
  const recarregar = () => void carregarRelatorios();

  // Sem dados ainda: mostra carregando ou o erro com opção de tentar de novo.
  if (!relatorios) {
    return (
      <Screen header={header} refreshing={carregando} onRefresh={recarregar}>
        <View style={styles.page}>
          <Titulo compacto={compacto} />

          {erro ? (
            <>
              <AlertMessage variant="error" title="Dados indisponíveis" message={erro} />
              <EmptyState
                title="Não foi possível carregar os relatórios"
                description="Confira a conexão com o Back4App e tente novamente."
                actionLabel="Tentar novamente"
                onAction={recarregar}
              />
            </>
          ) : (
            <AlertMessage variant="loading" message="Carregando os indicadores..." />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen header={header} refreshing={carregando} onRefresh={recarregar}>
      <View style={styles.page}>
        <Titulo compacto={compacto} />

        {erro ? <AlertMessage variant="error" title="Dados indisponíveis" message={erro} /> : null}

        {/* ---------- Financeiro ---------- */}
        <Secao titulo="Financeiro">
          <Card style={styles.totalCard}>
            <Text style={styles.totalLabel}>Faturamento total combinado</Text>
            <Text style={styles.totalDetail}>Salão + eventos</Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.totalValue, compacto ? styles.totalValueCompacto : null]}
            >
              {real(relatorios.faturamento.faturamento)}
            </Text>
          </Card>

          <View style={styles.grade}>
            <Celula largura={larguraCartao}>
              <Card title="Ticket médio" subtitle="Comparativo por origem da receita">
                <View>
                  <LinhaResumo label="Salão" valor={real(relatorios.ticketMedio.salao)} />
                  <LinhaResumo label="Buffet de eventos" valor={real(relatorios.ticketMedio.eventos)} />
                  <LinhaResumo label="Combinado" valor={real(relatorios.ticketMedio.combinado)} ultimo />
                </View>
              </Card>
            </Celula>

            <Celula largura={larguraCartao}>
              <Card title="Eventos com buffet do restaurante" subtitle="Eventos realizados que contrataram o buffet">
                <View>
                  <LinhaResumo label="Eventos" valor={String(relatorios.buffet.comBuffet)} />
                  <LinhaResumo label="Receita média" valor={real(relatorios.buffet.receitaMedia)} ultimo />
                </View>
              </Card>
            </Celula>

            <Celula largura={larguraCartao}>
              <Card title="Faturamento do salão" subtitle="Nos dias em que houve eventos">
                <Text style={styles.value}>{real(relatorios.salaoEmDiasDeEvento.faturamento)}</Text>
              </Card>
            </Celula>

            <Celula largura={larguraCartao}>
              <Card title="Maior receita de buffet" subtitle="Entre os buffets do restaurante">
                <View style={styles.maiorBuffet}>
                  <Text style={styles.winner}>
                    {relatorios.maiorBuffet
                      ? relatorios.maiorBuffet.tipo || relatorios.maiorBuffet.nome || 'Evento'
                      : 'Evento —'}
                  </Text>
                  {relatorios.maiorBuffet?.nome ? (
                    <Text style={styles.cardSubtitle}>Evento: {relatorios.maiorBuffet.nome}</Text>
                  ) : null}
                  <Text style={styles.value}>
                    {relatorios.maiorBuffet ? real(relatorios.maiorBuffet.valorBuffet) : 'R$ —'}
                  </Text>
                </View>
              </Card>
            </Celula>
          </View>

          <Card title="Receita por dia da semana" subtitle="Visão combinada e participação de cada origem">
            <View>
              {relatorios.receitaPorDia.map((dia, index) => (
                <View
                  key={dia.nomeDia}
                  style={[
                    styles.diaBlock,
                    index === 0 ? null : styles.divider,
                    largo ? styles.diaBlockLargo : null,
                  ]}
                >
                  <Text style={[styles.diaName, largo ? styles.diaNameLargo : null]}>{dia.nomeDia}</Text>
                  <View style={styles.diaValues}>
                    <ValorDia label="Salão" valor={real(dia.salao)} compacto={compacto} />
                    <ValorDia label="Eventos" valor={real(dia.eventos)} compacto={compacto} />
                    <ValorDia label="Combinado" valor={real(dia.total)} compacto={compacto} destaque />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </Secao>

        {/* ---------- Produtos mais consumidos ---------- */}
        <Secao titulo="Produtos mais consumidos">
          <Card title="Mais consumido por dia da semana" subtitle="Salão, eventos e visão combinada">
            <View>
              {relatorios.maisConsumidoPorDia.map((dia, index) => (
                <View
                  key={dia.nomeDia}
                  style={[
                    styles.consumoBlock,
                    index === 0 ? null : styles.divider,
                    largo ? styles.consumoBlockLargo : null,
                  ]}
                >
                  <Text style={[styles.diaName, largo ? styles.diaNameLargo : null]}>{dia.nomeDia}</Text>
                  <View style={styles.consumoLines}>
                    <Text style={styles.consumoLine}>
                      <Text style={styles.consumoLabel}>Salão: </Text>
                      {maisConsumido(dia.salao)}
                    </Text>
                    <Text style={styles.consumoLine}>
                      <Text style={styles.consumoLabel}>Eventos: </Text>
                      {maisConsumido(dia.eventos)}
                    </Text>
                    <Text style={styles.consumoLine}>
                      <Text style={styles.consumoLabel}>Combinado: </Text>
                      {maisConsumido(dia.combinado)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>

          <Card title="Sabores mais servidos" subtitle="Salão e eventos somados">
            <View style={[styles.ranking, largo ? styles.rankingLargo : null]}>
              {[0, 1, 2].map((index) => {
                const sabor = relatorios.topSabores[index];
                return (
                  <View key={index} style={[styles.rankingRow, largo ? styles.rankingRowLargo : null]}>
                    <View style={styles.position}>
                      <Text style={styles.positionText}>{index + 1}º</Text>
                    </View>
                    <View style={styles.rankingText}>
                      <Text style={styles.rankingName}>{sabor ? sabor.sabor : '—'}</Text>
                      <Text style={styles.rankingMeta}>{sabor ? `${sabor.quantidade} servidas` : '—'}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        </Secao>

        {/* ---------- Satisfação média ---------- */}
        <Secao titulo="Satisfação média">
          <View style={styles.satisfacaoRow}>
            {[
              { label: 'Salão', valor: relatorios.satisfacao.salao },
              { label: 'Eventos', valor: relatorios.satisfacao.eventos },
              { label: 'Combinado', valor: relatorios.satisfacao.combinado },
            ].map(({ label, valor }) => (
              <Card
                key={label}
                style={[styles.satisfacaoCard, compacto ? styles.satisfacaoCardCompacta : null]}
              >
                <Text style={[styles.satisfacaoLabel, compacto ? styles.satisfacaoLabelCompacta : null]}>
                  {label}
                </Text>
                <Text style={styles.satisfacaoValue}>{valor > 0 ? decimal(valor) : '—'}</Text>
                <Text style={styles.satisfacaoDetail}>{valor > 0 ? 'de 5' : 'aguardando avaliações'}</Text>
              </Card>
            ))}
          </View>
        </Secao>
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
  titleCompacto: {
    fontSize: 26,
  },
  intro: {
    maxWidth: 640,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  // Grade de cartões: uma coluna no celular, duas ou três em telas largas.
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  celula: {
    width: '100%',
  },

  // Cartão de destaque (fundo terracota), como no site.
  totalCard: {
    gap: spacing.xs,
    backgroundColor: colors.danger,
    borderColor: colors.danger,
  },
  totalLabel: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textOnPrimary,
  },
  totalDetail: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.massaVermelho[1],
  },
  totalValue: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.displayBold,
    fontSize: 34,
    color: colors.textOnPrimary,
  },
  totalValueCompacto: {
    fontSize: 28,
  },

  cardSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  maiorBuffet: {
    gap: spacing.xs,
  },
  value: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  winner: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },

  // Ticket médio / eventos com buffet
  resumoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  resumoLabel: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  resumoValue: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.primaryDark,
  },

  // Receita por dia da semana
  diaBlock: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  diaBlockLargo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  diaName: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md,
    color: colors.text,
  },
  diaNameLargo: {
    width: 150,
  },
  diaValues: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  diaValue: {
    flex: 1,
    gap: 2,
  },
  diaValueLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  diaValueNumber: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  diaValueNumberCompacto: {
    fontSize: fontSize.xs,
  },
  diaValueNumberStrong: {
    fontFamily: fontFamily.bodyBold,
    color: colors.primaryDark,
  },

  // Mais consumido por dia
  consumoBlock: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  consumoBlockLargo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  consumoLines: {
    flex: 1,
    gap: spacing.xs,
  },
  consumoLine: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: colors.text,
  },
  consumoLabel: {
    fontFamily: fontFamily.bodyBold,
    color: colors.primaryDark,
  },

  // Top 3 sabores: empilhados no celular e lado a lado em telas largas.
  ranking: {
    gap: spacing.sm,
  },
  rankingLargo: {
    flexDirection: 'row',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  rankingRowLargo: {
    flex: 1,
  },
  position: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.massaAmarelo[4],
  },
  positionText: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.xs,
    color: colors.dangerDark,
  },
  rankingText: {
    flex: 1,
    gap: 2,
  },
  rankingName: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  rankingMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  // Satisfação média (três cartões lado a lado, como no site)
  satisfacaoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  satisfacaoCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
  },
  satisfacaoCardCompacta: {
    padding: spacing.sm,
  },
  satisfacaoLabel: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  satisfacaoLabelCompacta: {
    fontSize: fontSize.xs,
  },
  satisfacaoValue: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  satisfacaoDetail: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    textAlign: 'center',
    color: colors.textMuted,
  },
});
