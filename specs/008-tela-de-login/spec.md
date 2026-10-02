# Feature Specification: Tela de Login Antecedente Obrigatória e Bloqueio de Acesso a Fotos (Padrão cv-face)

**Feature Branch**: `antigravity-008/feat-tela-de-login`  
**Created**: 2026-09-29  
**Status**: Draft  
**Input**: "O site hoje, ele abre automaticamente na tela de votacao, mesmo sem ter login porem nao podemos deixar assim, deve existir uma tela de login antecendendo as fotos dos colaboradores para votação. Crie uma tela de login para que nenhum usuario consiga ver as fotos antes de ter feito o login. O layout deve ser no mesmo padrao do projeto C:\Users\thiago.luiz\Desktop\Desenvolvimento\cv-face. Pode usar o mesmo logo que contem nesse projeto, /speckit-specify Crie uma spec para tratar minha solicitação. Leia @AGENTS.md e @PRD_Final.md. Se houver duvida ou ambiguidade para a criação dessa spec, pause e me pergunte"

---

## 1. Contexto e Objetivo de Negócio

No modelo operacional anterior da aplicação de votação, o carregamento inicial da página inicializava diretamente a tela da galeria (`VotingPage`), requisitando o catálogo de candidatos e exibindo fotos e nomes dos colaboradores mesmo quando nenhum usuário estava logado. O modal de login só era acionado secundariamente quando o visitante clicava no botão "Entrar" na barra de navegação ou tentava submeter um voto em um card.

Esse comportamento infringe a diretriz de privacidade da festa e a exigência expressa da comissão organizadora: **nenhum usuário ou visitante pode visualizar as fotos dos colaboradores caracterizados antes de comprovar sua identidade institucional**.

Esta especificação define a criação de uma tela de login dedicada de página inteira (`LoginPage`), com arquitetura de interface e layout espelhados fielmente no projeto de chamada institucional [cv-face](file:///C:/Users/thiago.luiz/Desktop/Desenvolvimento/cv-face), estabelecendo um bloqueio de acesso (gating de fotos) absoluto:
1. **Frontend:** Usuários não autenticados são recepcionados exclusivamente pela tela de login limpa, sem carregamento ou exposição de fotos, candidatos ou controles internos.
2. **Backend:** O catálogo de participantes (`GET /api/vote/candidates`) passa a ser restrito por autenticação JWT, impedindo que requisições anônimas ou inspeções de rede acessem os dados dos colegas.
3. **Identidade Visual:** Aplicação estrita da paleta e componentes institucionais do Colégio Carbonell e do projeto `cv-face`, utilizando o logotipo oficial de fundo claro e ícones vetoriais SVG (sem emojis).

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Recepção com Tela de Login Dedicada no Padrão cv-face (Priority: P1)

Como colaborador acessando o sistema pelo smartphone através do QR Code na mesa ou link direto,  
Quero ser recebido por uma tela de login limpa, elegante e centralizada no padrão institucional do Colégio Carbonell,  
Para que eu saiba claramente que devo autenticar com minha conta institucional antes de acessar a votação.

**Why this priority**: É o primeiro contato visual de 100% dos usuários com a aplicação. Garante padronização visual com os demais sistemas da instituição (como o `cv-face`) e comunica autoridade e segurança.

**Independent Test**: Acessar o site em uma janela anônima do navegador. Constatar que a página exibe uma interface centralizada com o logotipo oficial do Colégio Carbonell (`logo-fundo-branco.png` / `logo2.png`), título "Votação do Melhor Traje", mensagem orientando o uso do e-mail institucional e botão oficial do Google Sign-In, sem barra de navegação ou fotos.

**Acceptance Scenarios**:
1. **Given** um colaborador que não possui sessão ativa no navegador, **When** ele acessa a URL raiz da aplicação, **Then** o sistema renderiza a tela cheia de login centralizada, vertical e horizontalmente, sobre fundo neutro claro institucional (`#f8fafc`).
2. **Given** a renderização da tela de login, **When** o usuário observa a interface, **Then** o logotipo institucional oficial aparece com largura contida (máximo 200px), seguido do título sólido em Azul Marinho (`#1e2a4d`) e da instrução orientando o uso de conta `@colegiocarbonell.com.br`.
3. **Given** a tela de login ativa, **When** inspecionado o código HTML/DOM, **Then** nenhum elemento da galeria de fotos, barra de navegação superior, abas de admin ou rodapé da votação está presente no documento.

---

### User Story 2 - Bloqueio Absoluto de Exibição e Carregamento de Fotos antes do Login (Priority: P1)

Como membro da comissão organizadora e gestor da privacidade dos colaboradores,  
Quero garantir que nenhuma foto ou dado de participante seja transferido pela rede ou renderizado antes da confirmação do login,  
Para proteger a privacidade dos funcionários caracterizados e impedir spoilers da festa.

**Why this priority**: É a regra fundamental estabelecida pelo usuário. Exposição antecipada de fotos sem login quebra o sigilo e a privacidade dos colaboradores na festa.

**Independent Test**: Abrir as ferramentas de desenvolvedor (aba Rede/Network), carregar a página inicial sem estar logado e verificar que nenhuma chamada para `/api/vote/candidates` é disparada e nenhuma imagem da pasta de fotos é transferida. Em seguida, enviar uma requisição HTTP direta sem token para `GET /api/vote/candidates` e verificar o retorno de erro HTTP 401.

**Acceptance Scenarios**:
1. **Given** o carregamento inicial da aplicação no cliente React, **When** o estado de autenticação for nulo (`user === null`), **Then** o hook de busca de participantes (`fetchCandidates`) não é executado e o array de candidatos permanece vazio.
2. **Given** uma requisição direta de um cliente externo para `GET /api/vote/candidates` sem header de autorização com token JWT válido, **When** a requisição atingir o backend, **Then** o servidor responde com código HTTP 401 e mensagem de erro de acesso negado.
3. **Given** uma tentativa de burla manual de rota na URL, **When** o usuário não autenticado tentar acessar visualmente a votação, **Then** a aplicação mantém o usuário retido estritamente na tela de login.

---

### User Story 3 - Transição Fluida para a Galeria de Votação após Autenticação Válida (Priority: P1)

Como colaborador na tela de login,  
Quero clicar no botão de login do Google, autorizar minha conta `@colegiocarbonell.com.br` e ser imediatamente direcionado para a votação,  
Para começar a ver as fotos dos colegas e emitir meu voto sem fricção.

**Why this priority**: É o caminho feliz obrigatório que conecta a barreira de segurança à experiência de votação no evento.

**Independent Test**: Realizar login com uma conta Google válida sob o domínio `@colegiocarbonell.com.br`. Verificar que a tela de login desaparece suavemente, os candidatos são carregados com indicador de progresso e a galeria de votação é renderizada com a barra de navegação completa.

**Acceptance Scenarios**:
1. **Given** um colaborador na tela de login, **When** concluir a autenticação Google institucional com sucesso, **Then** o token JWT e os dados do usuário são salvos localmente, a tela de login é desmontada e a aplicação passa a exibir a Navbar com seu perfil e a página de votação.
2. **Given** a autenticação confirmada, **When** o estado de usuário for ativado, **Then** o sistema dispara a requisição autenticada de candidatos (`fetchCandidates`), exibindo o indicador de carregamento durante a resposta e renderizando os cards logo em seguida.
3. **Given** um usuário com permissões de administrador autenticado, **When** a interface carregar, **Then** a Navbar exibe os botões de "Admin" e "Telão" conforme os privilégios concedidos pelo backend.

---

### User Story 4 - Logout e Encerramento de Sessão com Retorno à Tela de Login (Priority: P2)

Como colaborador ou administrador após concluir minha participação,  
Quero poder clicar em "Sair" e ter certeza de que meus dados e as fotos foram fechados no dispositivo,  
Para que outra pessoa não possa ver fotos nem votar em meu nome no mesmo aparelho.

**Why this priority**: Fundamental para ambientes compartilhados ou quando um colaborador empresta o smartphone a outro colega na festa.

**Independent Test**: Clicar no botão "Sair" na barra de navegação. Verificar que a sessão é destruída, o catálogo de fotos é apagado do estado e o navegador volta imediatamente para a tela de login inicial.

**Acceptance Scenarios**:
1. **Given** um usuário autenticado na tela de votação ou painel admin, **When** clicar no botão "Sair" (`handleLogout`), **Then** o token de autenticação e os dados do usuário no `localStorage` são removidos.
2. **Given** a ação de logout concluída, **When** a aplicação atualizar seu estado, **Then** o array de candidatos e fotos é redefinido para vazio (`setCandidates([])`) e a tela de login dedicada é renderizada imediatamente.
3. **Given** uma expiração de token (HTTP 401 retornado por qualquer chamada da API durante o evento), **When** o evento de expiração de sessão for disparado, **Then** o sistema executa o auto-recovery, limpa os dados e apresenta a tela de login para nova conexão.

---

### Edge Cases

- **Tentativa de login com conta não institucional (@gmail.com ou pessoal):** A tela de login exibe aviso em destaque: *"Acesso restrito: utilize seu e-mail institucional @colegiocarbonell.com.br"*, mantendo o usuário na tela de login e impedindo qualquer visualização de fotos.
- **Falha de carregamento do script do Google Identity Services (GSI) devido a instabilidade de rede móvel (3G/4G):** O container do botão do Google exibe estado de erro amigável com botão de "Tentar Novamente", permitindo ao usuário reintentar a inicialização sem precisar recarregar toda a página.
- **Ambiente de Desenvolvimento Local (DEV):** Quando executado localmente (`import.meta.env.DEV`), a tela de login disponibiliza uma seção inferior de atalho rápido com botões predefinidos (ex.: Thiago Luiz - Admin, Mariana Santos - Colaborador) e campo de texto manual, facilitando os testes sem depender de popups externos do Google. Em produção (`import.meta.env.PROD`), essa seção é omitida em 100%.
- **Atualização da página (F5 / Refresh) com usuário já logado:** Se houver sessão JWT válida e não expirada armazenada no `localStorage`, a tela de login é ignorada e a aplicação carrega diretamente a galeria autenticada, preservando a agilidade do usuário durante a festa.

---

## 3. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE apresentar uma tela de login dedicada de página inteira (`LoginPage`) como tela inicial para qualquer usuário que não possua sessão autenticada ativa.
- **FR-002**: O layout da tela de login DEVE ser padronizado e visualmente espelhado na estrutura do projeto `cv-face`:
  - Enquadramento vertical e horizontal centralizado na viewport (`min-h-screen`, `flex flex-col items-center justify-center`);
  - Fundo claro limpo institucional (`#f8fafc`);
  - Logotipo oficial do Colégio Carbonell para fundo claro (`logo-fundo-branco.png` / `logo2.png`) com largura contida (máximo de 200px);
  - Título principal em cor sólida Azul Marinho (`#1e2a4d`, sem degradê): "Votação do Melhor Traje";
  - Parágrafo orientativo: "Por favor, utilize sua conta do Colégio Carbonell para continuar.";
  - Botão oficial de autenticação Google Sign-In integrado com Google Identity Services (GSI) configurado com restrição ao domínio `colegiocarbonell.com.br`.
- **FR-003**: O sistema NÃO DEVE exibir a barra de navegação superior (`Navbar`), a galeria de candidatos (`VotingPage`), nem o rodapé da votação enquanto o usuário não estiver autenticado.
- **FR-004**: O frontend NÃO DEVE disparar a requisição de busca de participantes (`GET /api/vote/candidates`) durante o estado deslogado, garantindo que nenhuma foto seja baixada ou mantida em cache no navegador antes do login.
- **FR-005**: O backend DEVE proteger o endpoint de candidatos (`GET /api/vote/candidates`) aplicando o middleware de autenticação (`authMiddleware`), rejeitando com status HTTP 401 requisições sem token válido de sessão institucional.
- **FR-006**: Ao realizar o login com sucesso, o sistema DEVE alternar para a visualização autenticada, disparar a busca de candidatos e apresentar indicador visual de carregamento até que os dados estejam disponíveis.
- **FR-007**: Ao acionar a opção "Sair" ou receber sinal de sessão expirada, o sistema DEVE apagar as credenciais de autenticação, descarregar a lista de participantes e fotos da memória do navegador e retornar imediatamente para a tela de login.
- **FR-008**: Em ambiente de desenvolvimento local (`import.meta.env.DEV`), a tela de login DEVE incluir uma área com atalhos de teste e preenchimento rápido; essa área DEVE ser rigorosamente ocultada em compilações de produção (`import.meta.env.PROD`).
- **FR-009**: É terminantemente proibido o uso de caracteres emoji na tela de login e em toda a interface da aplicação, sendo obrigatório o uso exclusivo de componentes vetoriais SVG da biblioteca `lucide-react`.

### Key Entities

- **Sessão de Usuário (UserSession):**
  - `email`: Endereço de e-mail institucional (obrigatoriamente `@colegiocarbonell.com.br`).
  - `name`: Nome completo do colaborador.
  - `picture`: URL da foto de perfil corporativa fornecida pelo Google.
  - `isAdmin`: Flag booleana indicando privilégios de administração e acesso ao telão.
  - `token`: Token JWT assinado criptograficamente pelo backend com validade de 24 horas.

- **Catálogo de Participantes (Candidate):**
  - `id`: Identificador único do candidato.
  - `name`: Nome do colaborador.
  - `email`: E-mail institucional do colaborador.
  - `photoUrl`: Caminho da fotografia oficial de rosto.
  - `department`: Setor/departamento na instituição.
  - `costumeName`: Nome do personagem/traje com o qual está caracterizado.
  - *Restrição:* Dados confidenciais acessíveis estritamente sob autenticação ativa.

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos usuários não autenticados visualizam imediatamente a tela dedicada de login, sem qualquer foto ou dado de candidato visível na interface ou no DOM.
- **SC-002**: 100% das requisições diretas anônimas para `GET /api/vote/candidates` são bloqueadas com código HTTP 401.
- **SC-003**: A tela de login carrega e atinge estado interativo em menos de 1 segundo em conexões móveis comuns (4G).
- **SC-004**: Transição da tela de login para a galeria de votação após autorização do Google concluída em menos de 1,5 segundo.
- **SC-005**: Ao clicar em "Sair", o retorno para a tela de login ocorre em menos de 200ms, com purga total das fotos da memória do estado.
- **SC-006**: A tela de login atende a 100% dos padrões visuais do projeto de referência `cv-face` e das diretrizes do Colégio Carbonell, com zero ocorrências de emojis.

---

## 5. Assumptions

- O arquivo de logotipo institucional `logo-fundo-branco.png` presente no diretório `client/public/images/` é idêntico em resolução e arte visual ao arquivo `logo2.png` do projeto `cv-face`.
- O Google Identity Services (GSI) com `hd: 'colegiocarbonell.com.br'` já configurado no projeto é o mecanismo oficial de autenticação institucional do Colégio Carbonell.
- Os administradores e colaboradores utilizarão smartphones e navegadores compatíveis com JavaScript moderno (Safari iOS 14+ e Chrome Android).
- A proteção backend com `authMiddleware` na rota de candidatos é plenamente compatível com os clientes autenticados, pois o cliente Axios/fetch já injeta o header `Authorization: Bearer <token>` quando autenticado.
