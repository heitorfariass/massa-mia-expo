import { Painel } from '@/components/Painel';
const acoes = [
  { titulo: 'Registrar venda', descricao: 'Lance uma venda do salão com os itens e a forma de pagamento.', destino: '/vendas/nova' },
  { titulo: 'Vendas registradas', descricao: 'Consulte ou edite as vendas em cada registro.', destino: '/vendas' },
  { titulo: 'Agendar evento', descricao: 'Informe data, responsável, capacidade e valor do ingresso.', destino: '/eventos/novo' },
  { titulo: 'Eventos registrados', descricao: 'Consulte ou edite os eventos em cada registro.', destino: '/eventos' },
];
export default function PainelFuncionario() {
  return <Painel papel="funcionario" acoes={acoes} />;
}
