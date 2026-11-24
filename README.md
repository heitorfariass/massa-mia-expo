# 🍕 Massa Mia — Sistema de Gestão de Pizzaria (Mobile & Web)

**Do site em Next.js para um aplicativo mobile multiplataforma com Expo e React Native.** Projeto acadêmico da disciplina de **Web Mobile** que adapta e expande a gestão da pizzaria Massa Mia para smartphones (Android e iOS) e web, mantendo a integração com banco de dados na nuvem: o dono acompanha vendas, eventos e relatórios na palma da mão; o funcionário registra pedidos e agenda eventos de qualquer lugar.

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Back4App](https://img.shields.io/badge/Back4App-32A07A?style=for-the-badge&logo=back4app&logoColor=white)
![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-yellow?style=for-the-badge)

➡️ **[Vídeo no YouTube](#-demonstração)** · **[Como rodar localmente](#-como-rodar-localmente)** · **[Versão Web anterior (Next.js)](https://massa-mia.vercel.app)**

## 🎬 Demonstração

Navegação real pelo aplicativo mobile: tela de entrada, área do proprietário, registro de vendas e gerenciamento de eventos.

![Demonstração do Massa Mia Mobile](docs/demo.gif) <!-- [PLACEHOLDER: substituir pelo GIF do app mobile] -->

⚡ *Gravação real do aplicativo rodando no emulador / Expo Go.*

| Acesso | Link |
|---|---|
| 📱 Build / Expo Go / APK | *[PLACEHOLDER: link do Expo / EAS Build ou APK]* |
| 📺 Vídeo completo no YouTube (demonstração com CRUD) | *[PLACEHOLDER: link do vídeo no YouTube]* |
| 🌐 Versão Web original (Atividade anterior) | *[link](https://massa-mia.vercel.app)* |

## 🎯 O projeto

O Massa Mia nasceu como um programa Java no terminal, evoluiu para um site em Next.js na atividade anterior e agora ganha sua **versão mobile com Expo (React Native)** para a disciplina de **Web Mobile**. O objetivo é resolver uma limitação da versão anterior (pensada apenas para desktop), permitindo que garçons, atendentes e o proprietário operem o sistema diretamente pelo celular, compartilhando o mesmo banco de dados na nuvem (Back4App).

| Versão Web Anterior 💻 | Nova Versão Mobile (Expo) 📱 |
|---|---|
| Interface focada em telas grandes (desktop) | Interface responsiva e nativa para Android, iOS e Web |
| Navegação via rotas web (Next.js App Router) | Navegação mobile nativa (Expo Router / Tabs / Stack) |
| Tabelas extensas com ordenação via URL | Listas otimizadas para toque, cartões e filtros rápidos |
| Mesma base de dados e regras de negócio | Reaproveitamento total do backend e Cloud Code no Back4App |

## ✨ Funcionalidades

**Área do funcionário** — agilidade no atendimento do salão:

- 🧾 **Registrar venda** — seleção rápida de cliente, data, forma de pagamento, status e itens do pedido, com **total calculado ao vivo** conforme os produtos são adicionados.
- 📋 **Vendas** — consulta das vendas registradas em lista mobile, com opção para editar cada venda ou remover um lançamento errado.
- 📅 **Agendar evento** — data, responsável, capacidade, valor do ingresso e **buffet opcional** (com consulta automática de **feriados nacionais** via BrasilAPI).
- 🔄 **Eventos** — edição dos dados de cada evento, atualização rápida de status e exclusão com confirmação.

**Área do proprietário** — indicadores do negócio na palma da mão:

- 💰 **Vendas** — histórico completo de vendas com itens, status, total, filtros e edição.
- 🎪 **Eventos** — acompanhamento de público, buffet, valores e status de cada evento.
- 📊 **Relatórios** — os 9 indicadores gerenciais em cartões adaptados para tela mobile: faturamento, produtos mais consumidos e satisfação média.

**Detalhes técnicos e experiência mobile:**

- ✅ **Validação em camadas** — validação nos formulários do app e validação rigorosa no servidor via Cloud Code (Back4App).
- 🏷️ **Status em badges coloridas** — *Servido*, *Cancelado*, *Agendado* e *Realizado* com leitura visual imediata.
- 🛡️ **Tratamento de estados e erros** — indicadores de carregamento (*loading*), estados vazios amigáveis e tratamento de falhas de conexão sem quebrar o app.
- ♿ **Usabilidade e feedback** — alertas nativos de confirmação antes de exclusões e feedback visual claro em cada ação.

## 🖼️ As telas

| Entrada — "Quem vai entrar?" | Relatórios do proprietário |
|---|---|
| ![Tela inicial](docs/screenshots/inicio.png) <!-- [PLACEHOLDER: print mobile] --> | ![Relatórios](docs/screenshots/relatorios.png) <!-- [PLACEHOLDER: print mobile] --> |

| Registrar venda — total ao vivo | Lista de vendas / eventos |
|---|---|
| ![Registrar venda](docs/screenshots/registrar-venda.png) <!-- [PLACEHOLDER: print mobile] --> | ![Listagem](docs/screenshots/listagem.png) <!-- [PLACEHOLDER: print mobile] --> |

## 🧠 Arquitetura

O aplicativo Expo se comunica com o Back4App por meio de uma camada de serviços isolada (`[PLACEHOLDER: caminho da pasta de serviços, ex: src/services/backend.ts]`), utilizando variáveis de ambiente públicas do Expo (`EXPO_PUBLIC_*`) para configurar a conexão com a API REST do Parse.

```mermaid
flowchart LR
    A["📱 App Mobile<br/>Expo + React Native"] -->|"REST API (fetch / Parse)<br/>criar · ler · atualizar · remover"| B["[PLACEHOLDER: src/services/api.ts]<br/>Camada de comunicação"]
    B -->|"HTTPS + App Keys"| C["☁️ Back4App"]
    C --> D["Cloud Code<br/>Validações e 9 relatórios"]
    D --> E[("🗄️ Produto · Pedido<br/>Evento · ItemProduto")]
    F["🇧🇷 BrasilAPI<br/>feriados nacionais"] -.->|"agendamento<br/>de eventos"| A
