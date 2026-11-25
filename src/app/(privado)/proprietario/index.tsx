import { Painel } from '@/components/Painel';
const acoes = [
  { titulo: 'Vendas', descricao: 'Consulte as vendas realizadas no restaurante.', destino: '/vendas' },
  { titulo: 'Eventos', descricao: 'Acompanhe eventos realizados e informações de buffet.', destino: '/eventos' },
  { titulo: 'Relatórios', descricao: 'Acesse os indicadores de vendas, eventos e satisfação.', destino: '/relatorios' },
];
export default function PainelProprietario() {
  return <Painel papel="proprietario" acoes={acoes} />;
}
