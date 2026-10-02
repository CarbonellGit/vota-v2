# Feature Specification: Mudança da Identidade Visual para o Padrão Colégio Carbonell

**Feature Branch**: `antigravity-001/feat-identidade-visual`  
**Created**: 2026-09-18  
**Status**: Draft  
**Input**: "Vamos criar uma spec para mudar a identidade visual de nosso projeto. Leia @[AGENTS.md] e @[PRD.md]. A identidade visual de nosso projeto deve ser igual ao projeto C:\Users\thiago.luiz\Desktop\Desenvolvimento\lms inclusive pode copiar o logo desse projeto para esse nosso."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Galeria de Votação com Identidade Institucional Carbonell (Priority: P1)

Como um colaborador do Colégio Carbonell acessando o sistema pelo smartphone durante a confraternização,  
desejo visualizar uma interface limpa, com as cores da nossa instituição, o logotipo oficial e cards de colegas com visual agradável e nítido,  
para que eu me sinta em um ambiente oficial e seguro, identificando com facilidade os colegas e meu voto ativo.

**Why this priority**: A galeria de votação é a tela principal utilizada por 100% dos colaboradores no evento. Transformar essa experiência com a marca oficial do Colégio Carbonell garante credibilidade, ergonomia visual e clareza imediata na escolha da melhor fantasia.

**Independent Test**: Pode ser testado de forma autônoma acessando a página principal de votação, verificando se o fundo é claro (`#f8fafc`), se os cartões de candidatos são brancos com cantos arredondados e sombra suave, se o candidato votado recebe o destaque institucional em tom amarelo/ouro (`#f7b53b`) e se o logotipo oficial com fundo claro é renderizado na barra de topo sem distorções.

**Acceptance Scenarios**:

1. **Given** que o colaborador acessa a página de votação em um smartphone,  
   **When** a galeria for carregada,  
   **Then** o plano de fundo da aplicação deve ser cinza claro institucional (`#f8fafc`), a barra superior deve exibir o logotipo do Colégio Carbonell (`logo-fundo-branco.png`) e o título/textos devem usar a tipografia limpa em tom Azul Marinho (`#1e2a4d`).

2. **Given** que o colaborador está visualizando os cartões dos colegas,  
   **When** ele localiza o colega em quem já votou,  
   **Then** o cartão desse colega deve exibir contorno e etiqueta destacada na cor amarelo institucional (`#f7b53b`) com a mensagem "Seu Voto Atual" e ícone vetorial de confirmação.

3. **Given** que o colaborador visualiza o próprio cartão na lista,  
   **When** a interface identificar que o candidato é o próprio usuário logado,  
   **Then** o botão de votar deve ser exibido desabilitado em tom neutro com ícone vetorial indicando que o auto-voto não é permitido.

---

### User Story 2 - Modais, Diálogos e Autenticação no Padrão Carbonell (Priority: P2)

Como um colaborador interagindo com o sistema,  
desejo abrir os modais de confirmação de voto e telas de autenticação com visual padronizado pela marca Carbonell,  
para que minhas decisões sejam claras, seguras e com feedback imediato.

**Why this priority**: Modais guiam ações críticas do usuário (login com Google e confirmação irreversível ou substituição de voto). Devem manter total harmonia visual e tipográfica com a galeria.

**Independent Test**: Pode ser testado abrindo o modal de login e o modal de confirmação de voto em qualquer candidato, validando a paleta de botões (Azul Escuro `#2b3a6c` para confirmação e cinza neutro para cancelamento) e a presença do logo institucional.

**Acceptance Scenarios**:

1. **Given** que um usuário não autenticado abre a aplicação,  
   **When** o modal de boas-vindas e login for exibido,  
   **Then** ele deve apresentar o logotipo oficial do Colégio Carbonell, texto explicativo sobre o domínio institucional `@colegiocarbonell.com.br` e botão de login em conformidade com o design system institucional.

2. **Given** que um colaborador clica em "Votar" no cartão de um colega,  
   **When** o modal de confirmação abrir,  
   **Then** o modal deve exibir a foto e o nome em superfície branca, botão de confirmação em Azul Escuro Carbonell (`#2b3a6c`) e botão de cancelar em contorno neutro.

---

### User Story 3 - Painel Administrativo Profissional e Limpo (Priority: P2)

Como um membro da comissão organizadora (Administrador),  
desejo acessar o painel de apuração e controle com uma estética limpa, cartões de métricas institucionais e tabelas legíveis,  
para que o acompanhamento do evento seja claro, ágil e livre de poluição visual.

**Why this priority**: Os administradores precisam de leitura rápida de métricas (participação, votos totais, status da urna e ranking) durante o evento sob ritmo acelerado.

**Independent Test**: Pode ser testado acessando a rota `/admin` com um usuário administrador, verificando os cards de indicadores numéricos, o badge de status da votação e a tabela de apuração com a nova paleta e ícones vetoriais.

**Acceptance Scenarios**:

1. **Given** que o administrador acessa o painel de administração,  
   **When** os dados de apuração forem exibidos,  
   **Then** os cards de estatísticas devem ter fundo branco, textos em Azul Marinho (`#1e2a4d`), barras de progresso com tons institucionais e ícones vetoriais profissionais representando votos e participantes.

2. **Given** que o administrador deseja abrir ou encerrar a votação,  
   **When** ele visualiza os botões de controle de status,  
   **Then** o botão de abrir deve refletir ação positiva institucional e o botão de encerrar deve utilizar o tom Vermelho Carbonell (`#d82a2b`), acompanhado de ícones vetoriais semânticos.

---

### User Story 4 - Modo Telão / Pódio da Revelação com Design Comemorativo Carbonell (Priority: P3)

Como apresentador do evento projetando a revelação dos vencedores no telão de LED ou projetor,  
desejo uma interface solene e festiva que utilize a variação escura da paleta Carbonell (Azul Marinho e Ouro) com o logotipo oficial para fundos escuros,  
para que a revelação do 3º, 2º e 1º lugares tenha impacto visual cinematográfico mantendo a identidade do Colégio Carbonell.

**Why this priority**: A revelação no palco é o clímax da festa, exigindo alto apelo visual para auditórios e telas grandes sem desrespeitar as diretrizes de marca da instituição.

**Independent Test**: Pode ser testado acessando `/revelacao` em resolução de telão (1080p ou 4K), validando a presença do logotipo `logo-fundo-azul.png`, o contraste do pódio e a revelação sequencial com ícones vetoriais de troféus e medalhas (sem emojis).

**Acceptance Scenarios**:

1. **Given** que o apresentador projeta a tela `/revelacao`,  
   **When** a página é carregada,  
   **Then** o cabeçalho deve exibir o logotipo `logo-fundo-azul.png`, fundo escuro em Azul Marinho Profundo (`#10172a` a `#1e2a4d`) e os pedestais do pódio destacados com as cores metálicas nobres e ouro Carbonell (`#f7b53b`).

2. **Given** que o apresentador aciona a revelação do campeão,  
   **When** o 1º lugar for revelado,  
   **Then** a animação de celebração com confetes e brilho dourado deve ser disparada, exibindo ícone vetorial de coroa/troféu institucional sem qualquer uso de emojis genéricos.

---

### Edge Cases

- **Ausência de foto do colaborador:** Quando um colaborador cadastrado não possuir foto ou houver falha de rede ao carregar a imagem, o sistema deve renderizar um avatar vetorial padronizado em escala neutra e cinza institucional, sem quebrar a proporção do cartão.
- **Nomes longos de colaboradores ou cargos:** Textos extensos de nomes e departamentos devem possuir truncamento elegante ou quebra em até duas linhas sem sobrepor badges ou distorcer a altura dos cartões no grid responsivo.
- **Telas muito estreitas (320px a 360px):** Em smartphones compactos, a barra de navegação deve ajustar a proporção do logotipo e o botão de logout de forma empilhada ou com espaçamento compacto, prevenindo *overflow* horizontal.
- **Transição de voto em tempo real:** Ao trocar de voto com a urna aberta, a remoção da borda amarela do voto anterior e a aplicação no novo cartão selecionado deve ocorrer de maneira instantânea e sem saltos visuais na rolagem da página.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE adotar integralmente as cores institucionais do Colégio Carbonell definidas no [DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md):
  - Azul Escuro Principal: `#2b3a6c`
  - Azul Marinho Base/Textos: `#1e2a4d`
  - Amarelo Acentos/Badges/Ouro: `#f7b53b`
  - Vermelho Alertas/Ações Críticas: `#d82a2b`
  - Branco para Superfícies: `#ffffff`
  - Fundo Geral da Aplicação: `#f8fafc`
- **FR-002**: O sistema DEVE utilizar os arquivos de logotipo oficiais do Colégio Carbonell:
  - Fundo claro (Navbar, Modais, Cards): `client/public/images/logo-fundo-branco.png`
  - Fundo escuro (Modo Telão): `client/public/images/logo-fundo-azul.png`
  - Favicon da aba do navegador: `client/public/images/logo3.png`
- **FR-003**: O sistema DEVE banir estritamente qualquer emoji genérico (como 🏆, 🥇, 🥈, 🥉, 👑, 🔒, 🚪, ⚙️, 🎉) de todos os componentes da interface, substituindo-os exclusivamente por ícones vetoriais SVG da biblioteca `lucide-react`.
- **FR-004**: Os cartões de candidatos na galeria DEVEM ser padronizados com superfície branca (`#ffffff`), bordas suaves (`rounded-2xl`), sombra sutil (`shadow-sm`) e destaque visual em amarelo institucional `#f7b53b` para a escolha atual do eleitor.
- **FR-005**: A barra de navegação superior (`Navbar`) DEVE exibir o logotipo oficial do Colégio Carbonell com altura proporcional contida, acompanhado do status da votação em badge semântico e ações do usuário logado com tipografia nítida.
- **FR-006**: Os modais de diálogo (Confirmação de Voto, Login e Mensagens) DEVEM adotar fundo de sobreposição com desfoque (*backdrop blur*), card central em branco com cantos arredondados amplos e botões de ação na paleta institucional.
- **FR-007**: A página do Modo Telão (`RevealPage`) DEVE adaptar sua cenografia para a paleta comemorativa oficial do Colégio Carbonell (Azul Marinho Profundo com acentos em Ouro `#f7b53b`), utilizando o logo institucional para fundos escuros e ícones vetoriais no pódio.
- **FR-008**: Os botões de ação e interação em todas as telas DEVEM possuir área de toque mínima de 44x44px em dispositivos móveis e estados visuais claros para foco, clique e carregamento.

---

### Key Entities

- **Identidade Visual Institucional (Design System Tokens):** Conjunto padronizado de cores, fontes, sombras e espaçamentos herdados das diretrizes do Colégio Carbonell (LMS) e aplicados à aplicação de votação.
- **Ativos de Marca (Logos e Ícones):** Arquivos gráficos oficiais (`logo-fundo-branco.png`, `logo-fundo-azul.png`, `logo3.png`) e coleção de componentes vetoriais SVG (`lucide-react`) que conferem integridade visual e consistência corporativa à aplicação.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos componentes e telas da aplicação (Navbar, Galeria, Modais, Painel Admin e Telão) adotam a paleta de cores institucional e os tokens definidos em `DESIGN_SYSTEM_PRD.md`.
- **SC-002**: 0 (zero) emojis residuais em toda a base de código do frontend, tendo 100% das sinalizações sido convertidas para ícones vetoriais SVG profissionais.
- **SC-003**: 100% dos logotipos exibidos mantêm suas proporções originais sem distorção ou pixelização em resoluções móveis (360px a 430px), tablets e desktops.
- **SC-004**: A aplicação atinge contraste mínimo de 4.5:1 (conforme diretrizes WCAG AA) para todos os textos institucionais e elementos interativos essenciais.
- **SC-005**: O tempo de percepção de identidade visual (reconhecimento imediato da marca Colégio Carbonell pelo colaborador) ocorre nos primeiros 3 segundos de acesso.

---

## Assumptions

- Os logotipos copiados de `C:\Users\thiago.luiz\Desktop\Desenvolvimento\lms\frontend\public\images` representam a identidade visual homologada e oficial da instituição.
- A biblioteca `lucide-react` já está presente nas dependências do projeto e atende a todos os ícones necessários para a aplicação.
- A experiência de apuração e revelação de pódio no telão deve continuar dinâmica e comemorativa, porém agora alinhada aos tons nobres da marca Carbonell (Azul Marinho e Ouro).
