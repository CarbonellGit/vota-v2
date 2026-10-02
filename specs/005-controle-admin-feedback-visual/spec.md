# Feature Specification: Controle de Acesso Restrito (Admin & Telão), Feedback Visual de Loading e Padronização de Interface

**Feature Branch**: `antigravity-005/feat-controle-admin-feedback-visual`  
**Created**: 2026-09-25  
**Status**: Draft  
**Input**: Restrição estrita de acesso às abas e rotas de Administração e Telão para apenas 4 colaboradores designados (Thiago Luiz, Patricia Santos, Marina Ribeiro e Raquel Favatto); inclusão de animação de carregamento (spinner SVG) nos botões de controle de status da votação ("Aguardando", "Abrir Votação", "Encerrar Votação"); remoção de qualquer degradê/estilo bicolor no título da tela principal ("Votação da Melhor Fantasia"), adotando cor única sólida institucional (#1e2a4d); e garantia de banimento total de emojis em favor de ícones vetoriais SVG da biblioteca `lucide-react`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Controle de Acesso Estrito aos Painéis Admin e Telão (RBAC) (Priority: P1)

Como colaborador comum do Colégio Carbonell participando da festa, quero acessar o sistema pelo meu smartphone, visualizar exclusivamente a galeria de fotos dos colegas e emitir meu voto, sem ter acesso ou visualizar as abas e funcionalidades da comissão organizadora (Admin e Telão). E como membro designado da comissão organizadora (Thiago Luiz, Patricia Santos, Marina Ribeiro e Raquel Favatto), quero autenticar com minha conta institucional e ter acesso pleno ao Painel de Administração e ao Modo Telão/Pódio.

**Why this priority**: É uma regra de negócio e segurança fundamental para o evento. O painel administrativo expõe dados de apuração em tempo real, controle de urnas e projeção de vencedores, que não podem estar visíveis nem acessíveis para o público geral da confraternização.

**Independent Test**: Autenticar com uma conta institucional regular (ex.: `colaborador@colegiocarbonell.com.br`) e verificar que a barra de navegação exibe apenas "Votação" e perfil, com rotas `/api/admin/*` retornando HTTP 403. Em seguida, autenticar com `thiago.luiz@colegiocarbonell.com.br`, `patricia.santos@colegiocarbonell.com.br`, `marina.ribeiro@colegiocarbonell.com.br` ou `raquel.favatto@colegiocarbonell.com.br` e confirmar que as abas "Admin" e "Telão" ficam disponíveis e operacionais.

**Acceptance Scenarios**:
1. **Given** um colaborador comum logado com qualquer e-mail institucional não listado entre os 4 administradores, **When** a interface da aplicação renderiza a barra superior (`Navbar`), **Then** as opções/botões "Admin" e "Telão" não são exibidos no DOM.
2. **Given** um colaborador comum logado que tente forçar a exibição do painel admin ou acessar endpoints `/api/admin/*`, **When** a requisição é interceptada pelo backend, **Then** o sistema rejeita a operação com código HTTP 403 Forbidden e mensagem "Acesso restrito à administração".
3. **Given** um dos 4 colaboradores autorizados (`thiago.luiz@colegiocarbonell.com.br`, `patricia.santos@colegiocarbonell.com.br`, `marina.ribeiro@colegiocarbonell.com.br`, `raquel.favatto@colegiocarbonell.com.br`), **When** o login é realizado, **Then** o payload do token de sessão contém `isAdmin: true` e a barra de navegação exibe os botões "Admin" e "Telão".
4. **Given** a persistência da configuração no banco de dados (Firestore e defaultDb), **When** a aplicação inicializa ou valida permissões, **Then** a lista oficial `adminEmails` reflete exatamente os 4 e-mails autorizados.

---

### User Story 2 - Feedback Visual de Carregamento nos Controles de Status (Priority: P1)

Como administrador da festa controlando os momentos da confraternização no painel administrativo, quero clicar em "Aguardando", "Abrir Votação" ou "Encerrar Votação" e visualizar uma animação de carregamento clara (spinner giratório) no botão acionado, para saber imediatamente que o sistema recebeu meu comando e está atualizando o status na nuvem, evitando cliques repetidos ou confusão.

**Why this priority**: A ausência de feedback de loading durante operações de escrita assíncronas gera incerteza para o operador, podendo causar múltiplos cliques e requisições concorrentes indesejadas no backend.

**Independent Test**: No painel de administração, clicar no botão "Abrir Votação" (ou "Aguardando" / "Encerrar Votação") e verificar que o botão específico exibe um spinner SVG animado (`<Loader2 className="w-4 h-4 animate-spin" />`), os botões de ação ficam desabilitados enquanto a requisição ocorre e voltam ao estado normal com notificação toast de confirmação.

**Acceptance Scenarios**:
1. **Given** o painel administrativo aberto por um administrador, **When** ele clica em "Abrir Votação", **Then** o botão clicado substitui seu ícone estático por um ícone giratório SVG de loading em tempo real.
2. **Given** uma requisição de alteração de status em processamento, **When** o administrador tenta clicar em outros botões de ação ("Aguardando", "Encerrar Votação", "Sincronizar Fotos"), **Then** todos os botões de controle permanecem desabilitados com cursor apropriado para evitar condições de corrida.
3. **Given** a conclusão bem-sucedida da alteração na API, **When** a resposta é recebida, **Then** o loading é finalizado, o badge de status atual reflete o novo estado e uma notificação toast de sucesso é apresentada.
4. **Given** uma falha eventual de comunicação de rede, **When** a API retorna erro, **Then** o loading é encerrado e uma notificação de alerta vermelha com ícone SVG de aviso informa o ocorrido ao usuário.

---

### User Story 3 - Título Principal Institucional em Cor Única Sólida (Priority: P2)

Como usuário acessando a tela principal de votação pelo celular ou computador, quero visualizar o título "Votação da Melhor Fantasia" em uma cor única sólida e institucional (Azul Marinho `#1e2a4d`), sem efeitos de degradê ou tons divididos, garantindo consistência com a identidade corporativa do Colégio Carbonell e máxima legibilidade.

**Why this priority**: Ajuste de polimento visual alinhado com o Design System oficial e solicitação explícita do usuário para remover efeitos de degradê na tipografia principal.

**Independent Test**: Inspecionar o elemento `h1` na página de votação (`VotingPage`) e verificar que todo o texto "Votação da Melhor Fantasia" possui cor única sólida `#1e2a4d`, sem quebra de `<span>` com cores secundárias, degradês ou gradientes de texto.

**Acceptance Scenarios**:
1. **Given** a tela de votação principal (`VotingPage`), **When** o cabeçalho é renderizado, **Then** o título "Votação da Melhor Fantasia" exibe todas as suas palavras na cor Azul Marinho institucional (`#1e2a4d`).
2. **Given** diferentes tamanhos de tela (mobile e desktop), **When** o título é redimensionado responsivamente, **Then** a tipografia mantém uniformidade cromática sólida sem classes de gradiente (`bg-clip-text` ou variações bicolores).

---

### User Story 4 - Varredura e Banimento Completo de Emojis em Favor de SVGs (Priority: P2)

Como colaborador ou administrador interagindo com qualquer tela ou modal do sistema, quero ver ícones vetoriais SVG profissionais, limpos e alinhados à marca Carbonell em substituição a qualquer emoji, transmitindo seriedade e elegância institucional.

**Why this priority**: Regra mandatória de Design System estabelecida no PRD (RIV03), garantindo visual profissional e eliminando discrepâncias visuais entre diferentes sistemas operacionais (Android, iOS, Windows, macOS).

**Independent Test**: Executar busca automatizada em todos os arquivos de componentes React (`client/src/**/*`) e verificar que zero caracteres emoji são encontrados no código de renderização e que todos os ícones são componentes da biblioteca `lucide-react`.

**Acceptance Scenarios**:
1. **Given** qualquer componente de interface (Navbar, CandidateCard, VoteModal, LoginModal, AdminPage, RevealPage), **When** ícones informativos ou ilustrativos são necessários, **Then** são utilizados exclusivamente componentes SVG da biblioteca `lucide-react`.
2. **Given** botões de fechamento de modal ou toasts, **When** um ícone de fechar é renderizado, **Then** é utilizado `<X className="..." />` em vez de caracteres tipográficos soltos (como "✕") ou emojis.
3. **Given** mensagens de console ou logs de servidor destinados a auditoria, **When** exibidas no terminal, **Then** utilizam formatação limpa sem emojis.

---

## Edge Cases

- **Token de sessão antigo no navegador de usuário regular:** Se um colaborador possuir um token JWT local anterior que continha `isAdmin: true` de testes passados, ao tentar executar qualquer ação administrativa na API, o backend valida em tempo real o e-mail contra a lista atualizada e rejeita a operação com status 403. Além disso, a rota `/api/auth/me` sincroniza e atualiza o estado de permissão no cliente.
- **Variação na caixa alta/baixa do e-mail do colaborador:** Os 4 e-mails de administração devem ser validados utilizando normalização estrita (`email.toLowerCase().trim()`), prevenindo falhas de permissão caso o Google envie o e-mail com capitalizações variadas.
- **Latência de rede no controle de status:** Se a rede estiver lenta durante o clique em "Abrir Votação", o botão continuará exibindo o spinner de loading até o retorno da resposta, impedindo múltiplos cliques ou envio repetido da mesma requisição.
- **Tentativa de acesso direto ao Modo Telão (`/revelacao`):** O componente `App.jsx` só permite alternar para `reveal` caso o usuário seja administrador (`user?.isAdmin`), retornando à tela de votação caso um usuário comum tente manipular o estado de abas.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE definir a lista oficial e restrita de administradores contendo exclusivamente:
  - `thiago.luiz@colegiocarbonell.com.br`
  - `patricia.santos@colegiocarbonell.com.br`
  - `marina.ribeiro@colegiocarbonell.com.br`
  - `raquel.favatto@colegiocarbonell.com.br`
- **FR-002**: O backend DEVE normalizar (caixa baixa e sem espaços) e validar o e-mail do usuário autenticado contra a lista oficial de administradores tanto na emissão do token JWT (`/api/auth/google`, `/api/auth/dev-login`) quanto nos middlewares de proteção (`adminMiddleware` e `/api/auth/me`).
- **FR-003**: O backend DEVE atualizar a configuração padrão (`defaultDb.config.adminEmails`) e o documento `config/app_state` no Firestore para conter exclusivamente os 4 administradores autorizados.
- **FR-004**: O frontend (`Navbar`) DEVE exibir as abas e atalhos para "Admin" e "Telão" apenas quando `user?.isAdmin === true`.
- **FR-005**: O frontend (`App.jsx`) DEVE restringir a renderização das telas `AdminPage` e `RevealPage` estritamente a usuários com `user?.isAdmin === true`.
- **FR-006**: O painel administrativo (`AdminPage`) DEVE controlar o estado de loading de forma granular para cada ação de status ("Aguardando", "Abrir Votação", "Encerrar Votação").
- **FR-007**: Ao clicar em um botão de controle de status, o botão DEVE renderizar um spinner giratório animado (`<Loader2 className="w-4 h-4 animate-spin" />`) enquanto a requisição assíncrona estiver pendente.
- **FR-008**: Enquanto uma ação de alteração de status estiver em andamento, todos os botões de controle de status DEVEM permanecer em estado desabilitado (`disabled`).
- **FR-009**: Na tela principal de votação (`VotingPage`), o título "Votação da Melhor Fantasia" DEVE ser renderizado integralmente em cor única sólida institucional `#1e2a4d`, sem divisões em `<span>` com cores distintas ou degradês.
- **FR-010**: A interface da aplicação DEVE banir completamente o uso de emojis, utilizando exclusivamente ícones vetoriais SVG da biblioteca `lucide-react` para todas as indicações visuais.

---

### Key Entities

- **AdminAuthorization**: Entidade de autorização contendo a lista normalizada de e-mails institucionais pertencentes à comissão organizadora autorizada.
- **VotingStatusAction**: Estado de transição do ciclo de vida da eleição (`waiting` | `open` | `closed`), acompanhado pelo estado de processamento assíncrono (`pendingStatusAction`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários logados com e-mails fora da lista de 4 administradores têm as abas "Admin" e "Telão" ocultadas na interface e recebem status HTTP 403 em qualquer tentativa de invocação de rotas administrativas.
- **SC-002**: 100% dos cliques nos botões de controle de status ("Aguardando", "Abrir Votação", "Encerrar Votação") exibem feedback visual de carregamento animado com spinner SVG em menos de 100ms após o clique.
- **SC-003**: 0 ocorrências de emojis unicode nos componentes React da interface visual da aplicação.
- **SC-004**: O título principal da página de votação é renderizado em cor sólida única `#1e2a4d` com contraste WCAG AA superior a 10:1 sobre o fundo `#f8fafc`.

---

## Assumptions

- Os 4 e-mails fornecidos pelo usuário pertencem ao domínio `@colegiocarbonell.com.br` e serão utilizados para o login oficial do Google Workspace no evento.
- A biblioteca `lucide-react` já está instalada no projeto e fornece todos os ícones necessários, incluindo `Loader2` para os spinners de carregamento.
- O documento de configuração no Firestore (`config/app_state`) será atualizado automaticamente ou inicializado com a lista dos 4 administradores sem necessidade de recriação do banco de dados.
- O ambiente de testes locais continuará funcional para simulação com os e-mails definidos.
