import { Redirect, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertMessage, Card, Header, Screen } from '@/components/ui';
import type { Papel } from '@/lib/types';
import { useAuth } from '@/store/auth';
import { useDados } from '@/store/dados';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type Acao = { titulo: string; descricao: string; destino: string };
type PainelProps = { papel: Papel; acoes: Acao[] };

export function Painel({ papel, acoes }: PainelProps) {
  const router = useRouter();
  const usuario = useAuth((state) => state.usuario);
  const sair = useAuth((state) => state.sair);
  const limparDados = useDados((state) => state.limpar);
  const [aviso, setAviso] = useState(false);
  if (!__DEV__ && (!usuario || usuario.papel !== papel)) {
    return <Redirect href="/" />;
  }
  const proprietario = papel === 'proprietario';
  const area = proprietario ? 'Proprietário' : 'Funcionário';
  async function encerrarSessao() {
    await sair();
    limparDados();
    router.replace('/');
  }
  function abrirAcao(destino: string) {
    // Relatórios já existe; as outras telas entram conforme forem migradas.
    if (destino === '/relatorios') {
      router.push('/proprietario/relatorios' as Href);
      return;
    }
    void destino;
    setAviso(true);
  }
  return (
    <Screen edges={['top', 'left', 'right']} style={styles.screen}
      header={<Header variant="painel" area={area} onLogout={encerrarSessao} />}
      contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.label}>{proprietario ? 'GESTÃO DO RESTAURANTE' : 'ROTINA DO RESTAURANTE'}</Text>
        <Text style={styles.title}>Área do {area.toLowerCase()}</Text>
        <Text style={styles.description}>{proprietario ? 'Acesse as informações do restaurante.' : 'Registre vendas e cuide dos eventos do restaurante.'}</Text>
      </View>
      {aviso ? <AlertMessage variant="empty" message="Esta função estará disponível após a integração da tela." /> : null}
      <View style={styles.cards}>
        {acoes.map((acao, index) => (
          <Card key={acao.destino} accessibilityLabel={acao.titulo} onPress={() => abrirAcao(acao.destino)} style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.numberCircle}><Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text></View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{acao.titulo}</Text>
                <Text style={styles.cardDescription}>{acao.descricao}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  screen: { backgroundColor: '#FFEB88' },
  content: { flexGrow: 1, backgroundColor: colors.background, gap: spacing.xl, paddingBottom: spacing.xxxl },
  heading: { gap: spacing.xs },
  label: { fontFamily: fontFamily.bodyBold, fontSize: fontSize.xs, color: colors.danger, letterSpacing: 1 },
  title: { fontFamily: fontFamily.display, fontSize: fontSize.xxl, color: colors.text },
  description: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.textMuted },
  cards: { gap: spacing.md },
  card: { borderColor: '#e9dfc8', shadowOpacity: 0, elevation: 0 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  numberCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFEB88', alignItems: 'center', justifyContent: 'center' },
  number: { color: colors.danger, fontFamily: fontFamily.bodyBold, fontSize: fontSize.sm },
  cardText: { flex: 1, gap: spacing.xs },
  cardTitle: { color: colors.text, fontFamily: fontFamily.display, fontSize: fontSize.lg },
  cardDescription: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.primaryDark },
  arrow: { color: colors.danger, fontSize: fontSize.xl },
});
