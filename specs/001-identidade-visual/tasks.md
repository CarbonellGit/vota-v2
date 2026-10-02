# Tasks: Mudança de Identidade Visual para o Padrão Colégio Carbonell

**Input**: Documentos de design em `/specs/001-identidade-visual/`  
**Prerequisites**: [plan.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/plan.md), [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/spec.md), [research.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/research.md), [data-model.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/data-model.md), [contracts/](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/contracts/ui-tokens.json)  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Definição dos tokens visuais e ativos de marca compartilhados no frontend.

- [X] T001 Configurar os tokens institucionais do Colégio Carbonell (@theme) em `client/src/index.css`
- [X] T002 [P] Atualizar título, metadados e favicon oficial para logo3.png em `client/index.html`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estrutura base de layout e navegação que suporta todas as telas do sistema.

**⚠️ CRITICAL**: Nenhuma alteração das histórias de usuário deve ser iniciada antes da conclusão desta fase.

- [X] T003 Atualizar o layout global do container e rodapé para fundo limpo (#f8fafc) em `client/src/App.jsx`
- [X] T004 [P] Integrar o logotipo oficial claro (/images/logo-fundo-branco.png), badge de status institucional e remover emojis em `client/src/components/Navbar.jsx`

**Checkpoint**: Base visual e navegação institucional prontas. A implementação das telas pode prosseguir.

---

## Phase 3: User Story 1 - Galeria de Votação com Identidade Institucional (Priority: P1) 🎯 MVP

**Goal**: Permitir que os colaboradores visualizem os colegas em um ambiente visual limpo (*light/clean*), com cards institucionais brancos, feedback de voto em amarelo ouro Carbonell (`#f7b53b`) e botão de voto primário em Azul Escuro (`#2b3a6c`).

**Independent Test**: Acessar a aplicação em `http://localhost:5173`, verificar se a galeria exibe fundo cinza claro (`#f8fafc`), cards brancos com cantos arredondados, campo de busca institucional, destaque em amarelo para a escolha do eleitor e ausência de emojis.

### Implementation for User Story 1

- [X] T005 [P] [US1] Estilizar a barra de busca e cabeçalho da galeria com a paleta institucional em `client/src/pages/VotingPage.jsx`
- [X] T006 [US1] Implementar cartão de colaborador com fundo branco, anel de destaque ouro (#f7b53b), botão de voto institucional (#2b3a6c) e ícones vetoriais em `client/src/components/CandidateCard.jsx`

**Checkpoint**: MVP da experiência de votação concluído e testável de forma independente.

---

## Phase 4: User Story 2 - Modais, Diálogos e Autenticação no Padrão Carbonell (Priority: P2)

**Goal**: Garantir que as telas de autenticação e caixas de confirmação de voto sigam o design system com superfícies brancas, tipografia nítida, o logotipo oficial e botões na paleta institucional.

**Independent Test**: Abrir o modal de login e o modal de confirmação de voto em qualquer candidato, checando a presença do logo `logo-fundo-branco.png`, botões primários em Azul Escuro (`#2b3a6c`) e cancelamento neutro.

### Implementation for User Story 2

- [X] T007 [P] [US2] Redesenhar o modal de login com o logotipo oficial claro (/images/logo-fundo-branco.png), superfície branca e botões Carbonell em `client/src/components/LoginModal.jsx`
- [X] T008 [P] [US2] Ajustar o modal de confirmação e troca de voto para a estética limpa com botões institucionais e eliminação de emojis em `client/src/components/VoteModal.jsx`

**Checkpoint**: Fluxos de login e confirmação de voto integrados à identidade visual institucional.

---

## Phase 5: User Story 3 - Painel Administrativo Profissional e Limpo (Priority: P2)

**Goal**: Prover aos administradores do evento uma visão executiva dos indicadores de apuração, controles da urna e tabela de ranking com visual limpo e profissional.

**Independent Test**: Acessar a rota `/admin` com usuário gestor, validar se os cards de KPI possuem fundo branco e números em Azul Marinho, se os botões de status utilizam a paleta institucional e se a tabela de apuração está livre de emojis.

### Implementation for User Story 3

- [X] T009 [US3] Reformular os cards de métricas, botões de controle de status e tabela de apuração com paleta institucional e ícones Lucide em `client/src/pages/AdminPage.jsx`

**Checkpoint**: Painel administrativo totalmente padronizado com a marca do Colégio Carbonell.

---

## Phase 6: User Story 4 - Modo Telão / Pódio da Revelação com Design Comemorativo Carbonell (Priority: P3)

**Goal**: Oferecer uma experiência de palco/projeção solene e comemorativa em Azul Marinho Profundo e Ouro, com o logotipo oficial para fundos escuros (`logo-fundo-azul.png`), pódio com troféu e medalhas vetoriais, e efeitos de confetes no campeão.

**Independent Test**: Acessar `/revelacao` ou clicar em Modo Telão, verificar o logotipo `logo-fundo-azul.png` no cabeçalho, contraste do pódio em tons metálicos nobres e acionamento da comemoração de confetes ao revelar o 1º colocado.

### Implementation for User Story 4

- [X] T010 [US4] Implementar o palco do telão com fundo Azul Marinho Profundo, logotipo oficial (/images/logo-fundo-azul.png), pódio com ícones vetoriais de troféus/medalhas e celebração de confetes em `client/src/pages/RevealPage.jsx`

**Checkpoint**: Modo Telão concluído com visual de celebração e identidade de marca refinada.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificação de compilação, integridade de estilos e validação de critérios de aceite de ponta a ponta.

- [X] T011 Executar build de produção do frontend com Vite em `client/`
- [X] T012 Executar validação visual de ponta a ponta conforme o roteiro em `specs/001-identidade-visual/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências, inicia imediatamente.
- **Foundational (Phase 2)**: Depende da conclusão da Phase 1. Bloqueia todas as User Stories.
- **User Story 1 (Phase 3 - P1 MVP)**: Depende da Phase 2.
- **User Story 2 (Phase 4 - P2)**: Depende da Phase 2. Pode ser desenvolvida em paralelo à US1.
- **User Story 3 (Phase 5 - P2)**: Depende da Phase 2.
- **User Story 4 (Phase 6 - P3)**: Depende da Phase 2.
- **Polish (Phase 7)**: Depende da conclusão de todas as User Stories anteriores.

### Parallel Opportunities

- `T002` pode rodar em paralelo com `T001`.
- `T004` pode rodar em paralelo com `T003`.
- `T005` pode rodar em paralelo com `T006`.
- `T007` e `T008` podem ser executadas em paralelo.

---

## Implementation Strategy

### MVP First (User Story 1)
1. Concluir Setup (T001, T002).
2. Concluir Foundation (T003, T004).
3. Concluir Galeria de Votação (T005, T006).
4. Validar MVP da experiência de voto com a marca Carbonell.
5. Avançar incrementalmente para modais, administração e telão.
