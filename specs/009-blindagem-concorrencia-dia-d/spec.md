# Feature Specification: Blindagem de Concorrência, Otimização FinOps e Tolerância a Falhas no Dia D

**Feature Branch**: `antigravity-009/feat-blindagem-concorrencia-dia-d`  
**Created**: 2026-09-29  
**Status**: Draft  
**Input**: "Crie uma nova spec para aplicar as sugestões suas. Leia @AGENTS.md e @PRD_Final.md. Se houver alguma duvida ou ambiguidade para a criação dessa spec, pause e me pergunte"

---

## 1. Contexto e Objetivo de Negócio

Durante o teste de estresse simulando **160 usuários simultâneos** no evento de Confraternização do Colégio Carbonell, foram identificados gargalos arquiteturais de concorrência e banco de dados que expõem o sistema ao risco de lentidão severa, saturação de conexões ou falhas transitórias em produção:

1. **Gargalo Crítico de Varredura no Firestore:** A rota de polling de status (`GET /api/vote/status`), consultada a cada 12 segundos por cada um dos 160 smartphones ativos, invocava uma leitura completa de todos os documentos da coleção `votes` via `getVotes()`. Com 160 eleitores votando, isso gerava um volume projetado de mais de **2.000 leituras de documentos por segundo** (~120.000 leituras/minuto), elevando a latência da rota para ~1 segundo e desperdiçando recursos de banco de dados desnecessariamente.
2. **Ausência de Cache na Configuração Global:** A leitura do documento de estado (`config/app_state`) era executada diretamente no Firestore a cada fração de segundo sem reaproveitamento em memória, sobrecarregando a infraestrutura com dados que raramente sofrem alteração durante a noite.
3. **Fragilidade de Timeout no Carregamento do Google Sign-In:** A tela de login estabelecia um tempo limite rígido de apenas 4 segundos para a inicialização do SDK oficial do Google (`accounts.google.com/gsi/client`), insuficiente para lidar com a latência e o congestionamento típico de redes Wi-Fi coletivas ou 4G/3G oscilante em salões de eventos.
4. **Risco de Rate Limiting Compartilhado no Login:** Embora as rotas de votação e status possuam isenções defensivas por IP, a rota de autenticação institucional (`POST /api/auth/google`) ainda estava sujeita ao limite geral por IP (300 req/min), com risco de bloqueio caso dezenas de colaboradores fizessem login exatamente no mesmo instante sob o mesmo IP de saída da festa.

Esta especificação define a blindagem técnica completa da aplicação para assegurar **alta disponibilidade, baixa latência (sub-100ms) e estabilidade absoluta** para mais de 160 colaboradores simultâneos no Dia D, sem qualquer impacto negativo nas regras de negócio ou na experiência visual do usuário.

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulta Leve e Eficiente do Status de Votação (Priority: P1)

Como colaborador conectado à festa com o smartphone na mão,  
Quero que meu aplicativo atualize o status da votação de forma instantânea e contínua sem travar ou deixar o aparelho lento,  
Para que eu acompanhe a abertura, encerramento e confirmação do meu voto sem interrupções.

**Why this priority**: É a requisição de maior frequência da aplicação (13 a 15 chamadas por segundo em todo o salão). Se for pesada, ela degrada o servidor, eleva a fatura de nuvem e prejudica a experiência de todos os 160 usuários ao mesmo tempo.

**Independent Test**: Executar uma chamada à rota `/api/vote/status` com o token de um eleitor específico e verificar que o tempo de resposta do servidor cai para menos de 50ms, confirmando que o sistema recuperou exclusivamente o registro de voto desse colaborador sem realizar varredura na coleção completa de votos.

**Acceptance Scenarios**:
1. **Given** um colaborador autenticado com sessão válida, **When** seu aplicativo consultar o status da votação (`GET /api/vote/status`), **Then** o backend consulta pontualmente apenas o documento de voto correspondente ao seu e-mail (`votes/{voterEmail}`), retornando se ele já votou e os dados da votação com tempo de resposta inferior a 100ms.
2. **Given** um visitante ou requisição anônima sem token de autenticação, **When** a rota `/api/vote/status` for consultada, **Then** nenhuma leitura na coleção de votos é efetuada no banco de dados, retornando `userVote: null` imediatamente.
3. **Given** 160 usuários executando polling a cada 12 segundos, **When** a coleção de votos atingir 160 documentos, **Then** o consumo de leituras no Firestore é reduzido em pelo menos 99% em comparação à varredura total.

---

### User Story 2 - Resiliência no Carregamento do Login em Wi-Fi Congestionado (Priority: P1)

Como colaborador chegando à festa e conectando ao Wi-Fi compartilhado do salão,  
Quero acessar a tela de login e conseguir visualizar o botão institucional do Google mesmo se a internet estiver oscilando ou com lentidão temporária,  
Para que eu não receba avisos falsos de indisponibilidade logo na entrada da festa.

**Why this priority**: Se a autenticação falhar devido a lentidão na rede, o colaborador fica barrado logo na porta de entrada da votação, gerando frustração e chamados à comissão organizadora.

**Independent Test**: Simular emulador com limitação de banda ou atraso de 6 segundos no download de scripts externos. Constatar que a tela de login mantém a animação suave de carregamento e renderiza o botão do Google com sucesso até 15 segundos, sem disparar mensagem de erro antes desse intervalo.

**Acceptance Scenarios**:
1. **Given** um smartphone conectado a uma rede Wi-Fi com alta latência, **When** a tela de login for aberta, **Then** o sistema aguarda ativamente até 15 segundos (150 tentativas com intervalos de 100ms) para inicializar o SDK do Google antes de considerar falha.
2. **Given** uma instabilidade temporária onde o script demorar mais que o habitual para baixar, **When** o script do Google finalizar seu carregamento dentro da janela de tolerância, **Then** o botão oficial é renderizado perfeitamente sem necessidade de recarregar a página inteira.
3. **Given** uma falha real de conectividade após os 15 segundos, **When** a tela apresentar o estado de erro, **Then** o botão "Tentar Novamente" reinicia a rotina de detecção com feedback visual instantâneo.

---

### User Story 3 - Cache de Configuração com Invalidação Atômica pelo Administrador (Priority: P2)

Como administrador da comissão organizadora,  
Quero que o status da votação ("Aguardando", "Aberta", "Encerrada") responda com extrema rapidez no banco de dados e que minhas alterações de status reflitam imediatamente para todos os colaboradores,  
Para que a transição entre as fases do evento seja ágil e sem sobrecarga no servidor.

**Why this priority**: Garante que o documento de configuração não seja lido milhares de vezes por minuto sem necessidade, mas assegura que quando o organizador clicar em "Abrir Votação" ou "Encerrar", a mudança seja propagada de forma atômica e instantânea.

**Independent Test**: Consultar a configuração da aplicação repetidas vezes e verificar que as chamadas subsequentes utilizam o cache em memória; em seguida, enviar um comando de alteração de status via painel administrativo e constatar que o cache é invalidado imediatamente, fazendo a nova chamada refletir o novo status no mesmo segundo.

**Acceptance Scenarios**:
1. **Given** consultas contínuas de status por múltiplos usuários, **When** a configuração não tiver sido alterada, **Then** o servidor responde utilizando um cache local em memória com tempo de vida (TTL) de 10 segundos, poupando leituras repetitivas no Firestore.
2. **Given** um administrador alterando o status da votação para "open" ou "closed" no painel, **When** o endpoint `/api/admin/status` concluir a atualização no Firestore, **Then** o cache em memória de configuração é invalidado atomicamente no mesmo instante, garantindo que a próxima consulta já retorne o novo estado.

---

### User Story 4 - Login Simultâneo Seguro em Rede Wi-Fi com NAT Compartilhado (Priority: P2)

Como colaborador autenticando no mesmo minuto que outros 150 colegas sob o mesmo Wi-Fi,  
Quero que meu login com a conta Google `@colegiocarbonell.com.br` seja processado com sucesso e rapidez,  
Sem que o sistema confunda o tráfego do salão com um ataque de negação de serviço e bloqueie meu acesso por limite de IP.

**Why this priority**: Em redes corporativas ou eventos, todos os celulares compartilham um único endereço IP público de saída. Se a rota de autenticação tiver limitador rígido por IP, os usuários podem ser bloqueados em massa.

**Independent Test**: Disparar 160 requisições simultâneas para o endpoint `/api/auth/google` a partir do mesmo endereço IP local e verificar que 100% delas são aceitas e processadas sem retorno de erro HTTP 429.

**Acceptance Scenarios**:
1. **Given** múltiplos dispositivos enviando credenciais de login a partir do mesmo IP da rede da festa, **When** as requisições atingirem a rota `/api/auth/google`, **Then** o rate limiter por IP não bloqueia as conexões com erro 429.
2. **Given** a validação de segurança do backend, **When** cada token for recebido, **Then** a assinatura do Google e a restrição ao domínio `@colegiocarbonell.com.br` continuam sendo rigorosamente validadas de forma individual.

---

## 3. Edge Cases

- **Colaborador autentica mas ainda não votou:** A rota de status consulta pontualmente `votes/{voterEmail}`. Como o documento não existe, o Firestore retorna `exists: false` (apenas 1 leitura de documento não encontrado) e o backend devolve `userVote: null` de forma segura e sem erros.
- **Colaborador altera o voto:** A transação atômica em `castVoteAtomic` continua gravando exatamente no documento `votes/{voterEmail}`. O próximo polling de status lê imediatamente o novo voto atualizado.
- **Falha de rede momentânea no smartphone durante a votação:** Como a chave do voto é o e-mail institucional, se o usuário tocar duas vezes ou reenviar a requisição após uma perda de sinal, o Firestore apenas substitui o mesmo registro, impedindo rigorosamente a criação de votos duplicados.
- **Nenhum participante cadastrado:** Caso a coleção de candidatos esteja vazia, a rota de status e listagem responde normalmente com array vazio sem disparar exceções não tratadas no servidor.

---

## 4. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE fornecer uma função de busca pontual de voto do eleitor (`getVoteByEmail`), lendo exclusivamente o documento correspondente ao e-mail informado (`votes/{normalizedEmail}`) sem ler os demais documentos da coleção.
- **FR-002**: A rota `GET /api/vote/status` DEVE utilizar a busca pontual de voto para usuários autenticados e abster-se totalmente de consultar votos quando a requisição for anônima.
- **FR-003**: O sistema DEVE implementar cache em memória no módulo de banco de dados para a configuração global da aplicação (`config/app_state`), com tempo de expiração (TTL) de 10 segundos.
- **FR-004**: O sistema DEVE fornecer uma função de invalidação imediata do cache de configuração (`invalidateConfigCache`), que DEVE ser acionada obrigatoriamente em todas as rotas administrativas que modifiquem a configuração (abertura, pausa e encerramento de votação).
- **FR-005**: A rota de administração de métricas (`GET /api/admin/metrics`) DEVE manter a capacidade de apuração geral via `getVotes()` para consolidar o ranking oficial, operando de forma restrita e autenticada apenas para os 5 administradores autorizados.
- **FR-006**: A tela de login (`LoginPage.jsx`) DEVE estender a tolerância de espera ativa pelo SDK do Google Identity Services para 15 segundos (150 iterações com intervalo de 100ms), prevenindo alertas prematuros de indisponibilidade em conexões com latência.
- **FR-007**: O middleware de rate limiting global (`server/index.js`) DEVE incluir a rota `POST /api/auth/google` na lista de rotas isentas de limitação por IP (`skip`), mantendo o isolamento contra falsos positivos sob NAT compartilhado.
- **FR-008**: O limitador de submissão de voto (`submitVoteLimiter` em `server/routes/vote.js`) DEVE permanecer indexado individualmente pelo e-mail do colaborador autenticado (`req.user.email`), garantindo equidade e proteção contra spam.

---

## 5. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O tempo de resposta médio da rota `GET /api/vote/status` deve permanecer abaixo de **100 milissegundos** mesmo sob concorrência de 160 usuários simultâneos.
- **SC-002**: O volume de leituras no Firestore originado pelo polling de status deve sofrer uma **redução de pelo menos 99%** (caindo de ~160 documentos lidos por requisição para no máximo 1 documento por usuário logado ou 0 para visitantes).
- **SC-003**: A taxa de sucesso em testes de carga concorrentes com 160 usuários (autenticação, listagem, polling, votação e apuração) deve ser de **100% de respostas bem-sucedidas** com 0% de erros HTTP 429 ou 500.
- **SC-004**: A renderização do botão oficial do Google Sign-In deve tolerar até **15 segundos** de latência de rede sem disparar mensagens de erro indevidas na interface do usuário.
- **SC-005**: 100% das regras de negócio existentes (voto único, sigilo de presença no admin, auto-voto e permissão de troca de voto enquanto aberta) devem ser integralmente preservadas.

---

## 6. Assumptions

- A infraestrutura em produção no Google Cloud Run mantém a configuração mínima de 1 instância aquecida (`--min-instances 1`) provisionada para a noite da festa, eliminando Cold Start.
- O projeto oficial `vota-509520` permanece com faturamento ativo (*Blaze plan*), permitindo que a otimização atue como proteção preventiva de desempenho e custos (FinOps).
- As fotos dos participantes continuam servidas na borda pela CDN global do Firebase Hosting (`client/public/photos/`), sem transferir tráfego estático para a CPU do backend.
