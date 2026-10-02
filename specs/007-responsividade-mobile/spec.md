# Feature Specification: Otimização de Responsividade e Experiência Mobile no Dia da Festa

**Feature Branch**: `antigravity-007/feat-responsividade-mobile`  
**Created**: 2026-09-28  
**Status**: Draft  
**Input**: "Crie uma spec para tratar esses problemas de responsividade. Se houver duvida ou ambiguidade para a criação dessa spec, pause o serviço e me pergunte."

---

## 1. Contexto e Objetivo de Negócio

Durante a festa de confraternização do Colégio Carbonell, a esmagadora maioria dos colaboradores utilizará smartphones pessoais (iOS e Android, com larguras de tela entre 360px e 430px) para votar na melhor fantasia. O ambiente da festa impõe restrições físicas reais:
- Operação frequente com apenas uma das mãos (segurando copo/prato na outra mão);
- Necessidade de reconhecimento facial imediato através das fotos nos cards;
- Conexão de dados móveis sujeita a oscilações;
- Navegação rápida sem quebras de layout, sobreposição de barras ou zoom compulsório acidental.

Esta especificação define os requisitos funcionais e de experiência de usuário para garantir fluidez, clareza e robustez visual em todos os dispositivos móveis.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecimento Facial Desobstruído e Votação no Smartphone (Priority: P1)

Como colaborador participando da confraternização e segurando meu smartphone,  
Quero ver fotos nítidas dos meus colegas sem elementos encavalados na imagem e com botões de tamanho confortável para o polegar,  
Para que eu consiga reconhecer rapidamente quem está na foto e confirmar ou alterar meu voto com facilidade.

**Why this priority**: É a jornada central de 100% dos colaboradores na noite do evento. Se o rosto estiver pequeno, cortado ou coberto por badges, o propósito da plataforma de votação visual é prejudicado.

**Independent Test**: Acessar a aplicação em viewport mobile (360px a 390px), verificar que as fotos preenchem o card com nitidez (`object-cover`), a etiqueta da fantasia fica posicionada abaixo do nome (fora da foto) e os botões de ação ("Votar" / "Trocar Voto") mantêm alinhamento perfeito de 44px de altura.

**Acceptance Scenarios**:
1. **Given** um candidato com fantasia cadastrada e que atualmente recebeu o voto do usuário, **When** o card for renderizado em tela de 360px, **Then** o badge "Seu Voto Atual" permanece isolado no topo e a etiqueta da fantasia é exibida abaixo do nome e departamento, mantendo o rosto na foto 100% visível.
2. **Given** que o usuário já votou em outro candidato, **When** visualizar os demais cards na tela do celular, **Then** o botão exibe o texto conciso "Trocar Voto" sem quebra desalinhada de linha.
3. **Given** fotos enviadas em diferentes proporções (verticais ou horizontais), **When** renderizadas no celular, **Then** preenchem o container fotográfico com enquadramento facial nítido, sem faixas pretas/escuras vazias que miniaturizem o rosto.

---

### User Story 2 - Navegação Fluida sem Sobreposição e Busca sem Auto-Zoom no iOS (Priority: P1)

Como colaborador utilizando um iPhone ou Android na festa,  
Quero pesquisar o nome de um colega sem que a tela dê saltos de zoom e navegar sem barras encobrindo o conteúdo,  
Para encontrar rapidamente qualquer um dos mais de 160 participantes.

**Why this priority**: No iPhone (Safari), toques em campos de busca com fonte menor que 16px acionam zoom compulsório que quebra a navegação. Além disso, barras sobrepostas causam frustração visual imediata.

**Independent Test**: Tocar no campo de busca em um iPhone real ou simulado e constatar que o navegador não aplica auto-zoom; verificar que ao rolar a página o banner de status da votação não cobre o topo da lista; digitar um termo e apagá-lo tocando no botão 'X'.

**Acceptance Scenarios**:
1. **Given** um colaborador acessando pelo iPhone (Safari), **When** tocar no input de busca pelo nome do colega, **Then** o teclado virtual se abre sem provocar zoom in forçado na viewport.
2. **Given** um termo de pesquisa digitado no campo de busca, **When** o usuário tocar no ícone de limpar ('X'), **Then** o campo é esvaziado instantaneamente e a grade volta a exibir todos os candidatos.
3. **Given** um colaborador comum (não-administrador) no mobile, **When** visualizar a barra superior, **Then** apenas o logotipo institucional e a foto de login/sair são exibidos (sem o botão redundante 'Votação'), e a barra de status não encobre títulos ou notificações.

---

### User Story 3 - Modais Resilientes sob Teclado Virtual e Telas Compactas (Priority: P2)

Como colaborador confirmando meu voto ou autenticando minha conta institucional,  
Quero interagir com modais que caibam inteiramente na tela do meu celular mesmo se o teclado estiver aberto,  
Para que nenhum botão essencial (como "Confirmar Voto" ou "Entrar") fique escondido abaixo da linha de visualização.

**Why this priority**: Evita que usuários em aparelhos menores (ex.: iPhone SE) fiquem travados sem conseguir confirmar a escolha.

**Independent Test**: Abrir o modal de confirmação de voto e o modal de login em resolução de 360x667px e validar que todo o conteúdo é visível com rolagem interna suave e botão do Google Sign-In perfeitamente contido nas margens.

**Acceptance Scenarios**:
1. **Given** o modal de confirmação de voto aberto em smartphone compacto, **When** a tela tiver altura reduzida, **Then** o modal limita sua altura a `90dvh` e ativa rolagem vertical interna, mantendo os botões de "Cancelar" e "Confirmar Voto" totalmente operáveis.
2. **Given** o modal de login aberto em tela de 360px, **When** o botão do Google Sign-In for renderizado, **Then** sua largura é adaptada sem vazar as margens laterais do modal.

---

### User Story 4 - Apuração Mobile da Comissão Organizadora sem Rolagem Horizontal (Priority: P2)

Como membro da comissão organizadora (administrador) circulando pelo salão com o smartphone,  
Quero acompanhar a apuração e ranking parcial em formato de lista/cards verticais no celular,  
Para verificar os votos e porcentagens com rapidez sem precisar arrastar tabelas horizontalmente.

**Why this priority**: Os organizadores estarão em pé coordenando o evento e precisam de métricas visíveis em uma única passada de olho.

**Independent Test**: Acessar o painel administrativo com perfil de admin em tela móvel e verificar que o ranking geral e a lista de presença são exibidos em cartões verticais fluidos com foto, colocação, votos e porcentagem.

**Acceptance Scenarios**:
1. **Given** um administrador autenticado acessando `/admin` no smartphone, **When** visualizar a apuração dos votos, **Then** cada participante é apresentado em formato de card/item de ranking vertical com posição, foto, nome, votos e porcentagem sem necessidade de rolagem horizontal.
2. **Given** os botões de controle de status ("Aguardando", "Abrir Votação", "Encerrar Votação", "Modo Telão"), **When** exibidos no smartphone, **Then** distribuem-se em grade consistente com área de toque mínima de 44px.

---

## 3. Edge Cases & Casos de Borda

1. **Celular com entalhe/notch profundo ou Home Indicator (iOS/Android):**  
   O layout deve considerar áreas seguras (`safe-area-inset`) para que botões inferiores de modais ou cabeçalho superior não colidam com a barra de gestos ou câmera frontal.
2. **Nomes muito longos de participantes (ex: mais de 25 caracteres):**  
   Nos cards móveis, o nome do candidato deve permitir até 2 linhas (`line-clamp-2`) com altura mínima reservada para manter os cards vizinhos alinhados.
3. **Toasts com mensagens de erro extensas no mobile:**  
   As notificações flutuantes devem ser centralizadas com largura máxima adaptável (`max-w-sm mx-auto inset-x-4`) para nunca estourar para fora da tela.
4. **Zoom manual do usuário:**  
   Conforme deliberado na clarificação, a diretiva `user-scalable=no` permanece preservada no `index.html` para evitar zoom acidental de duplo toque durante a votação rápida na festa.

---

## 4. Requisitos Funcionais (FR)

- **FR-001**: O sistema DEVE garantir que a imagem do colaborador nos cards preencha o container fotográfico com nitidez (`object-cover`) e foco superior/central, eliminando barras vazias que miniaturizem o rosto.
- **FR-002**: A etiqueta com o nome da fantasia (`costumeName`) DEVE ser renderizada exclusivamente abaixo do nome e departamento do colega, deixando a foto livre para visualização do rosto e badges de voto.
- **FR-003**: No mobile (`< sm`), o botão de alteração de voto nos cards de colaboradores em que o usuário não votou DEVE exibir o texto conciso `"Trocar Voto"`, mantendo altura uniforme de 44px na grade.
- **FR-004**: Para colaboradores com perfil comum (não-administradores), o botão `"Votação"` na barra de navegação superior DEVE ser ocultado em telas pequenas (`< sm`), mantendo apenas o logotipo e o acesso ao perfil/login.
- **FR-005**: O banner de status da votação em dispositivos móveis DEVE ser posicionado sem encobrir o cabeçalho, títulos ou notificações de feedback do conteúdo da página.
- **FR-006**: O campo de busca DEVE possuir tamanho de fonte de 16px no mobile (`text-base sm:text-sm`) para eliminar o zoom automático do Safari no iOS ao receber foco.
- **FR-007**: O campo de busca DEVE disponibilizar um botão de limpeza instantânea (ícone de 'X') acessível quando houver qualquer caractere digitado.
- **FR-008**: As notificações flutuantes (Toasts de sucesso ou erro) DEVEM ser centralizadas horizontalmente no mobile (`inset-x-4 max-w-sm mx-auto`) para visualização harmônica.
- **FR-009**: Todos os modais da aplicação (`VoteModal`, `LoginModal`, `ResetModal`) DEVEM possuir altura máxima de `90dvh` com rolagem vertical automática (`overflow-y-auto`) e padding compacto em telas móveis (`p-5 sm:p-8`).
- **FR-010**: No painel do administrador em telas móveis, a lista de apuração de votos e a lista de presença DEVEM ser formatadas em cards de ranking vertical sem exigir rolagem horizontal.

---

## 5. Critérios de Sucesso (SC)

- **SC-001**: Em qualquer tela de smartphone entre 360px e 430px de largura, a barra de navegação superior e os cards da galeria não devem apresentar nenhum overflow horizontal ou quebra assimétrica de layout.
- **SC-002**: 100% dos elementos interativos (botões de voto, busca, fechar modal e controles de status) devem possuir área de toque mínima de 44x44px.
- **SC-003**: No navegador Safari em aparelhos iOS, o foco no campo de pesquisa deve abrir o teclado sem provocar qualquer alteração de escala/zoom na página.
- **SC-004**: No modal de confirmação de voto e login em resolução móvel compacta (360x667px), todos os botões de ação e campos devem estar visíveis e acessíveis sem cortes.

---

## 6. Premissas e Dependências

- A identidade visual Carbonell estabelecida no [DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md) é estritamente mantida (paleta `#1e2a4d`, `#2b3a6c`, `#f7b53b`, proibição total de emojis).
- A aplicação utiliza Tailwind CSS v4 configurado com tokens institucionais.
- A restrição `user-scalable=no` foi confirmada pelo usuário para preservar a rigidez da aplicação contra toques duplos acidentais no evento.
