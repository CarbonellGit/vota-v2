# Feature Specification: Suporte a Empates Múltiplos no Pódio (Dense Ranking) e Correção de Navegação Mobile (Logout sem Scroll)

**Feature Branch**: `antigravity-010/feat-empates-podio-mobile-navbar`  
**Created**: 2026-10-02  
**Status**: Draft  
**Input**: "Por hora, iremos fazer apenas 2 mudanças. Se houver empates, na exibição no podiuam se houver empates, tem que aparecer dividido, encontre a melhor posiução para isso. Por exemplo 1 lugar teve 3 pessoas empatadas, deve apresentar as 3 pessoas no podio do primeiro lugar, isso pro 2 ou 3 lugar também. Outro pequeno ajuste é que no celular para acessar o botao de sair do sistema, tenho que scrollar pra direita para ter acesso ao botao, ele nao aparece na tela por padrao, corrige isso."

---

## 1. Contexto e Objetivo de Negócio

No concurso do "Melhor Traje" da Festa de Confraternização do Colégio Carbonell, a revelação dos vencedores é o ponto alto do evento, projetada no palco principal diante de todos os colaboradores. Dois pontos críticos foram levantados para assegurar a justiça festiva e a ergonomia de uso:

1. **Tratamento Justo de Empates no Pódio (Dense Ranking):**
   Anteriormente, o sistema utilizava a ordem alfabética do nome como critério de desempate técnico arbitrário, excluindo co-vencedores do degrau correspondente (ex.: se duas pessoas empatavam em 1º lugar, uma era colocada em 1º e a outra rebaixada para 2º). A nova regra de negócio estabelece a **Classificação Densa (*Dense Ranking*)**: se múltiplos participantes obtiverem a mesma quantidade de votos (votos > 0), todos devem ser homenageados conjuntamente no mesmo degrau do pódio (seja 1º, 2º ou 3º lugar), exibidos lado a lado com fotos, nomes e trajes divididos harmoniosamente sobre o bloco do pódio.
2. **Ergonomia Mobile da Barra de Navegação (Zero Horizontal Scroll):**
   Em smartphones, especialmente para usuários com perfil de Administrador, os controles de navegação ("Votação", "Admin", "Telão") competiam na mesma linha com o Logotipo e o Perfil, totalizando mais de 500px de largura e provocando transbordamento horizontal da página. Isso forçava o colaborador a rolar a tela para a direita para conseguir enxergar e tocar no botão de logout ("Sair"). A solução elimina o transbordamento, mantendo o botão "Sair" e o Avatar 100% visíveis no canto superior direito por padrão e movendo a alternância de abas de administradores no mobile para uma sub-barra secundária compacta e dedicada.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Exibição Dividida de Empates no Pódio do Telão (Priority: P1)

Como apresentador e comissão organizadora projetando o telão de revelação no palco da festa,  
Quero que o pódio exiba todos os colaboradores empatados dividindo o mesmo degrau (seja 1º, 2º ou 3º lugar),  
Para que todos os vencedores legítimos sejam reconhecidos perante a instituição sem favorecimentos arbitrários por ordem alfabética.

**Why this priority**: É o momento culminante do evento. Um empate mal resolvido no telão gera constrangimento e sensação de injustiça entre os colaboradores.

**Independent Test**: Simular votações com empates (ex.: 3 pessoas com 30 votos, 2 com 25 votos e 1 com 22 votos) e abrir a tela `/revelacao`. Constatar que o degrau do 1º lugar exibe as 3 fotos lado a lado com o badge de co-campeões, o degrau do 2º lugar exibe as 2 fotos, e o degrau do 3º lugar exibe o participante individual.

**Acceptance Scenarios**:
1. **Given** 4 colaboradores com a pontuação máxima de 30 votos, **When** o apresentador acionar o botão "Revelar o Grande Campeão", **Then** o degrau de 1º lugar exibe simultaneamente os 4 participantes divididos harmoniosamente no topo do bloco, com badge adaptativo ("1º LUGAR • 4 CAMPEÕES EMPATADOS"), fanfarra e chuva de confetes.
2. **Given** 2 colaboradores empatados na 2ª maior pontuação de votos (25 votos), **When** o botão "Revelar 2º Lugar" for acionado, **Then** ambos aparecem lado a lado no bloco de Prata com seus respectivos nomes e trajes.
3. **Given** 5 colaboradores empatados na 3ª maior pontuação de votos (20 votos), **When** o botão "Revelar 3º Lugar" for acionado, **Then** todos os 5 colaboradores são exibidos divididos no bloco de Bronze com suspense sonoro.
4. **Given** um vencedor isolado em qualquer um dos degraus, **When** ele for revelado, **Then** sua foto permanece em destaque único ampliado conforme o layout tradicional.

---

### User Story 2 - Visibilidade Permanente do Botão "Sair" no Mobile sem Scroll Horizontal (Priority: P1)

Como colaborador ou administrador utilizando o smartphone na festa,  
Quero acessar a aplicação e visualizar o botão de "Sair" imediatamente na barra superior sem precisar arrastar a tela para a direita,  
Para que a navegação seja fluida, ágil e livre de quebras de layout na tela móvel.

**Why this priority**: A rolagem horizontal involuntária compromete gravemente a experiência do usuário, gera frustração e quebra o padrão de usabilidade mobile-first estabelecido no LMS Carbonell.

**Independent Test**: Acessar o sistema em smartphone (ou viewport simulada de 360px a 390px) com conta de administrador e conta de colaborador. Constatar que a página não possui scroll horizontal (largura exata de 100vw) e o botão "Sair" está visível e clicável no canto superior direito sem qualquer arrasto.

**Acceptance Scenarios**:
1. **Given** um usuário administrador autenticado em tela de celular (largura <= 414px), **When** a página inicial ou de votação for carregada, **Then** a barra superior exibe o logotipo à esquerda e o Avatar com o botão "Sair" à direita, totalmente contidos na largura da tela sem transbordar.
2. **Given** o mesmo usuário administrador, **When** ele precisar alternar entre as abas "Votação", "Admin" e "Telão", **Then** essas opções estão dispostas em uma sub-barra secundária limpa logo abaixo do cabeçalho principal, com área de toque mínima de 44x44px.
3. **Given** qualquer colaborador navegando pelo celular, **When** ele tentar rolar a página para a esquerda ou direita, **Then** nenhum deslocamento horizontal ocorre (`overflow-x-hidden`).

---

### User Story 3 - Apuração Densa e Medalhas Alinhadas no Painel Administrativo (Priority: P2)

Como membro da comissão organizadora acompanhando a apuração pelo painel `/admin`,  
Quero visualizar o ranking refletindo fielmente a mesma colocação e medalha para os colaboradores com a mesma quantidade de votos,  
Para que a contagem prévia confira exatamente com o resultado que será apresentado no telão.

**Why this priority**: Garante consistência entre a visão privada da comissão organizadora e a revelação pública aos participantes.

**Independent Test**: Consultar o ranking no Painel Admin durante empate e verificar que todos os empatados na 1ª pontuação recebem o selo de 1º lugar com troféu, os da 2ª pontuação recebem o selo de 2º lugar, e os da 3ª pontuação recebem o selo de 3º lugar.

**Acceptance Scenarios**:
1. **Given** dois colaboradores empatados na liderança com 20 votos, **When** a lista de apuração for exibida (no desktop ou nos cards mobile), **Then** ambos exibem o badge e ícone dourado de "1º Lugar".
2. **Given** um terceiro colaborador com 18 votos, **When** a apuração for renderizada, **Then** ele recebe o badge de "2º Lugar" (Classificação Densa).

---

### Edge Cases

- **Nenhum voto computado:** Se a votação estiver vazia (0 votos para todos), o pódio exibe estado neutro de espera sem atribuir medalhas ou vencedores vazios.
- **Empate com grande quantidade de participantes (ex.: mais de 4 pessoas em 3º lugar):** O layout flex no degrau utiliza quebra de linha harmoniosa (`flex-wrap`) ou redução inteligente do avatar (60px a 70px) para acomodar os colaboradores sem estourar o container do palco.
- **Transição de telas no mobile:** Ao alternar entre abas na sub-barra mobile, o estado ativo deve ser claramente destacado com a cor institucional Azul Escuro (`#2b3a6c`) e contraste acessível.

---

## 3. Requirements *(mandatory)*

### Functional Requirements

- **FR-001 (Backend - Dense Ranking):** O endpoint de métricas administrativas (`GET /api/admin/metrics`) DEVE agrupar e classificar os participantes utilizando *Dense Ranking*:
  - 1º Lugar: Todos os candidatos com votos > 0 que possuem o maior número de votos.
  - 2º Lugar: Todos os candidatos com votos > 0 que possuem a segunda maior contagem de votos.
  - 3º Lugar: Todos os candidatos com votos > 0 que possuem a terceira maior contagem de votos.
- **FR-002 (Backend - Estrutura do Pódio):** A carga de resposta da API DEVE estruturar o pódio com arrays de participantes para cada uma das 3 colocações (`podium: { first: Candidate[], second: Candidate[], third: Candidate[] }` ou lista com propriedade `place: 1 | 2 | 3`).
- **FR-003 (Frontend - Pódio Adaptativo):** A tela do Modo Telão ([`RevealPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/RevealPage.jsx)) DEVE renderizar os participantes de cada degrau em disposição responsiva:
  - Participante individual: avatar ampliado de destaque (128px a 192px).
  - 2 a 4 empatados: avatares lado a lado (80px a 110px cada) com nomes e trajes de cada um, mantendo o bloco estilizado correspondente (Ouro, Prata, Bronze) posicionado logo abaixo.
- **FR-004 (Frontend - Título e Efeitos de Revelação de Empate):** 
  - Degrau do 1º lugar com empate DEVE exibir badge adaptativo `"1º LUGAR • {N} CAMPEÕES EMPATADOS"` com cor amarela/ouro institucional (`#f7b53b`).
  - Degraus de 2º e 3º lugares com empate DEVEM exibir `"2º LUGAR • EMPATE"` e `"3º LUGAR • EMPATE"`.
  - A revelação sonora e de confetes DEVE contemplar todos os vencedores do degrau revelado.
- **FR-005 (Frontend - Mobile Navbar sem Overflow):** No smartphone (< 640px), a linha superior da [`Navbar.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/components/Navbar.jsx) DEVE conter exclusivamente:
  - À esquerda: Logotipo Carbonell com marca institucional compacta.
  - À direita: Foto do perfil Google e botão de logout ("Sair") com ícone `LogOut` e área de toque acessível.
- **FR-006 (Frontend - Sub-barra Mobile para Administradores):** Para administradores em telas móveis (< 640px), as abas de alternância ("Votação", "Admin", "Telão") DEVEM ser renderizadas em uma sub-barra horizontal compacta posicionada logo abaixo do cabeçalho principal (`bg-[#141d36]`), sem disputar espaço na linha superior.
- **FR-007 (Frontend - Blindagem Global contra Transbordamento):** A aplicação DEVE aplicar `overflow-x-hidden` no elemento contêiner raiz ([`App.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/App.jsx) e `index.css`), impedindo qualquer rolagem horizontal em smartphones.
- **FR-008 (Frontend - Consistência no Painel Admin):** A lista de ranking e os cards mobile no [`AdminPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/AdminPage.jsx) DEVEM exibir o mesmo número e medalha de colocação para todos os colaboradores empatados na mesma pontuação.

---

### Key Entities

- **CandidatePodiumGroup**:
  - `place`: 1 | 2 | 3 (Posição no pódio).
  - `votes`: Número de votos recebidos pelo grupo.
  - `percentage`: Percentual dos votos válidos.
  - `candidates`: Array de candidatos vinculados àquela colocação (`id`, `name`, `costumeName`, `photoUrl`, `department`).

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos empates em 1º, 2º e 3º lugares são representados de forma dividida e simultânea em seus respectivos degraus no Modo Telão.
- **SC-002**: 0px de deslocamento horizontal involuntário (scroll horizontal) na navegação mobile em smartphones de 360px a 430px de largura.
- **SC-003**: O botão "Sair" é 100% visível e acessível imediatamente após a autenticação em qualquer largura de tela sem necessidade de interação prévia de rolagem.
- **SC-004**: Coerência absoluta (100%) entre as colocações exibidas na apuração do Painel Admin e os participantes apresentados nos 3 degraus do telão.

---

## 5. Assumptions

- A premiação de melhor traje da Confraternização prioriza a celebração coletiva, adotando a Classificação Densa (*Dense Ranking*) para que os 3 degraus simbólicos (Ouro, Prata e Bronze) sejam sempre preenchidos por grupos de pontuação decrescente.
- Dispositivos móveis com largura mínima suportada partem de 360px (Samsung Galaxy, iPhone SE, etc.).
- Os efeitos visuais de confetes e áudio sintetizado permanecem funcionando perfeitamente em telas com múltiplos campeões.
