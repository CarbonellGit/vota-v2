# Feature Specification: Correções de Auditoria, Hardening de Autenticação e Otimização FinOps

**Feature Branch**: `antigravity-004/fix-correcoes-auditoria-finops`  
**Created**: 2026-09-25  
**Status**: Draft  
**Input**: Resolução integral dos achados da auditoria técnica: login Google oficial no frontend (GSI), remoção do bypass de dev-login em produção, proteção do rate limiter para redes Wi-Fi compartilhadas com trust proxy, unificação da persistência no Firestore eliminando db.json, entrega de fotos via Firebase Hosting CDN e cache de catálogo no backend para redução de leituras no Firestore.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticação Google Institucional & Desbloqueio em Produção (Priority: P1)

Como colaborador do Colégio Carbonell participando da festa de confraternização, quero acessar a aplicação no meu smartphone e fazer login com um toque através do botão oficial do Google Workspace (`@colegiocarbonell.com.br`), para que minha sessão seja validada de forma transparente e segura, eliminando qualquer tela de erro 403 e impedindo o acesso de e-mails externos.

**Why this priority**: É o bloqueador crítico número 1 detectado na auditoria. Atualmente o frontend chama apenas `dev-login` (que é desativado em produção), impossibilitando que qualquer colaborador ou administrador entre no sistema durante o evento real.

**Independent Test**: Em ambiente de produção ou simulado (`NODE_ENV=production`), abrir o modal de login, autenticar via Google Sign-In (GSI) com conta `@colegiocarbonell.com.br`, verificar a validação criptográfica do ID Token no backend e emissão do JWT de sessão válido.

**Acceptance Scenarios**:
1. **Given** que a aplicação está executando em produção (`import.meta.env.PROD`), **When** o usuário clica em "Entrar", **Then** o modal exibe exclusivamente o botão oficial institucional do Google Sign-In, ocultando qualquer formulário de login manual ou atalhos de desenvolvimento.
2. **Given** um colaborador autenticado com sucesso via Google, **When** o ID Token é enviado para `/api/auth/google`, **Then** o backend valida a assinatura criptográfica contra o `GOOGLE_CLIENT_ID`, verifica o domínio `@colegiocarbonell.com.br` e retorna o token de sessão JWT.
3. **Given** uma tentativa de autenticação com conta externa (ex.: `@gmail.com`), **When** o token é processado, **Then** o sistema recusa imediatamente com mensagem institucional clara e código HTTP 403.
4. **Given** ambiente local de desenvolvimento (`import.meta.env.DEV`), **When** os desenvolvedores realizam testes rápidos, **Then** os perfis de teste de atalho continuam disponíveis exclusivamente em localhost.

---

### User Story 2 - Votação Sem Falsos Bloqueios em Wi-Fi Coletivo (Rate Limiting & Proxy) (Priority: P1)

Como colaborador conectado à mesma rede Wi-Fi da festa (compartilhando o mesmo endereço IP público com centenas de colegas), quero emitir meu voto e visualizar o status da eleição sem ser bloqueado por limites globais de requisições por IP, garantindo que meu voto seja computado com sucesso.

**Why this priority**: Se o rate limiter continuar aplicado ao prefixo geral `/api/vote` sem leitura de proxy (`trust proxy`) e indexado apenas por IP, centenas de pessoas no mesmo Wi-Fi serão bloqueadas em poucos segundos pelo polling da aplicação.

**Independent Test**: Configurar o Express com `trust proxy 1`, desacoplar rotas de leitura (`GET /api/vote/status`) do limitador estrito e verificar que múltiplos votos disparados sob o mesmo IP público são autorizados desde que venham de usuários autenticados distintos (`req.user.email`).

**Acceptance Scenarios**:
1. **Given** que múltiplos colaboradores consultam `/api/vote/status` através do mesmo endereço IP (Wi-Fi da confraternização), **When** o polling periódico dispara requisições concorrentes, **Then** nenhuma requisição de leitura é bloqueada com HTTP 429 pelo limitador restrito de votos.
2. **Given** uma submissão de voto em `POST /api/vote`, **When** o limitador de submissões avalia a requisição, **Then** o limite é calculado por identidade do usuário autenticado (`req.user.email`), garantindo tolerância a redes compartilhadas e prevenindo abusos automatizados.
3. **Given** o backend hospedado atrás do Google Cloud Run e Firebase Hosting, **When** qualquer middleware de rate limit inspeciona a origem da requisição, **Then** o Express reconhece os cabeçalhos de encaminhamento (`X-Forwarded-For`) corretamente sem tratar todos os acessos como originários do IP de loopback do container.

---

### User Story 3 - Carregamento Instantâneo das Fotos via CDN com Custo Zero no Cloud Run (Priority: P2)

Como colaborador navegando pela galeria de participantes no smartphone, quero que os cards com fotos de todos os 162 colegas apareçam instantaneamente e com rolagem fluida, sem sobrecarregar a memória do dispositivo e sem fazer o servidor Cloud Run disparar milhares de invocações de container apenas para entregar imagens estáticas.

**Why this priority**: Servir fotos estáticas via Cloud Run gera mais de 16.000 requisições desnecessárias a containers gerenciados logo na abertura do evento, elevando custos de vCPU/memória e tráfego de saída (egress).

**Independent Test**: Acessar as fotos dos participantes através da URL pública do Firebase Hosting CDN (`/photos/...` ou `/images/photos/...`) e verificar que a resposta possui cabeçalho de cache de borda da CDN do Google, com status `304 Not Modified` / `200 from disk cache`, sem gerar logs de requisição no Cloud Run.

**Acceptance Scenarios**:
1. **Given** a abertura da aplicação web pelo colaborador, **When** a grade de participantes é montada, **Then** todas as imagens são entregues diretamente pelo Firebase Hosting CDN na borda com latência mínima.
2. **Given** a renderização de cada card de participante (`CandidateCard`), **When** o elemento é construído no DOM móvel, **Then** é utilizado apenas um único elemento `<img>` por participante com fallback institucional limpo em CSS, eliminando nós de imagem duplicados em segundo plano.
3. **Given** a configuração de roteamento em `firebase.json`, **When** a rota de fotos é requisitada, **Then** ela não é mais direcionada ao serviço de backend no Cloud Run, sendo atendida integralmente pela pasta estática do cliente.

---

### User Story 4 - FinOps e Estabilidade no Painel Administrativo com Cache de Catálogo (Priority: P2)

Como membro da comissão organizadora acompanhando a apuração dos votos no palco ou painel administrativo, quero que os totais e o ranking sejam atualizados em tempo real de forma estável, sem consumir centenas de milhares de leituras desnecessárias no Firestore que esgotem as quotas diárias e gerem cobranças extras.

**Why this priority**: Atualmente o painel administrativo executa polling a cada 4 segundos, relendo os 162 documentos de candidatos e todos os votos a cada ciclo, gerando ~236.000 leituras/hora no Firestore e estourando o Free Tier (50.000 leituras/dia) em apenas 12 minutos.

**Independent Test**: Manter o painel administrativo aberto durante 10 minutos, monitorar as consultas efetuadas ao Firestore e confirmar que a coleção de candidatos é lida do banco apenas uma vez (ou ao expirar o TTL de cache), conservando as quotas do projeto.

**Acceptance Scenarios**:
1. **Given** requisições sucessivas ao endpoint `/api/admin/metrics`, **When** a lista de candidatos já foi carregada recentemente, **Then** o backend recupera os candidatos a partir do cache em memória com TTL de 10 minutos, consultando no Firestore apenas os documentos voláteis de votos e status.
2. **Given** o painel administrativo aberto no navegador, **When** o loop de polling opera, **Then** o intervalo é calibrado para 8 segundos e utiliza padrão encadeado (`setTimeout`), impedindo sobreposição de requisições pendentes em momentos de oscilação de rede.
3. **Given** a inclusão de um novo participante ou sincronização manual via painel administrativo, **When** a ação é concluída com sucesso, **Then** o cache em memória do catálogo é invalidado e renovado imediatamente.

---

### User Story 5 - Unificação Arquitetural no Firestore & Blindagem de Segurança (Priority: P3)

Como engenheiro mantendo o sistema, quero que a aplicação utilize uma única arquitetura de dados confiável baseada no Google Cloud Firestore (com suporte ao Firestore Emulator em ambiente local) e regras estritas de segurança, eliminando arquivos locais `db.json`, divergências entre instâncias do Cloud Run e dependências desnecessárias no container de produção.

**Why this priority**: A coexistência de arquivos locais `db.json` e Firestore cria descompasso entre instâncias escaladas do Cloud Run e manutenção confusa de código redundante.

**Independent Test**: Executar a suíte de testes com Firestore Emulator, verificar que nenhum arquivo `.tmp` ou `db.json` é criado, validar que o arquivo `firestore.rules` impede leituras e gravações não autorizadas, e certificar que a imagem Docker de produção não contém a biblioteca pesada `sharp`.

**Acceptance Scenarios**:
1. **Given** o backend em execução, **When** operações de leitura, gravação e transação ocorrem, **Then** todas utilizam exclusivamente a API do Firestore, garantindo consistência atômica entre qualquer número de réplicas de containers.
2. **Given** um cliente tentando interagir diretamente com o banco de dados do Firestore sem passar pela API backend, **When** as regras em `firestore.rules` são avaliadas, **Then** o acesso direto é 100% rejeitado (`allow read, write: if false;`).
3. **Given** o build do container de produção no Dockerfile, **When** as dependências de produção são instaladas com `npm ci --omit=dev`, **Then** a biblioteca pesada `sharp` (usada apenas no script offline de corte de fotos) não é instalada no container de produção, diminuindo o tamanho da imagem e acelerando o cold start.
4. **Given** a suíte de validação automatizada (`server/scripts/testValidation.js`), **When** executada, **Then** todas as chamadas de API utilizam rotas existentes (`/api/admin/status`) com asserções estritas de sucesso HTTP (`res.ok`).

---

### Edge Cases

- **O que acontece se o colaborador fechar a janela do Google Sign-In antes de concluir?**  
  O modal permanece aberto, com mensagem discreta informando que o login não foi finalizado e permitindo tentar novamente sem recarregar a página.
- **O que acontece se o navegador do colaborador tiver bloqueador de pop-ups agressivo?**  
  O Google Identity Services (GSI) utiliza o fluxo One Tap / Rendered Button oficial que opera dentro dos padrões aceitos por navegadores modernos móveis (Chrome Mobile e Safari iOS).
- **O que acontece se um colaborador tentar votar repetidamente clicando no botão várias vezes por segundo?**  
  O botão de confirmação entra em estado de desabilitação e carregamento imediato (`isSubmitting = true`), e o endpoint `POST /api/vote` rejeita tentativas concorrentes pela mesma conta com rate limiter defensivo.
- **O que acontece se as credenciais do Firestore não estiverem configuradas localmente?**  
  O backend conecta-se automaticamente ao `FIRESTORE_EMULATOR_HOST` (quando a variável estiver presente) ou exibe mensagem amigável no console instruindo a iniciar o emulador oficial do Firebase.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE implementar o fluxo de autenticação oficial Google Sign-In (GSI) no frontend (`LoginModal.jsx`), capturando a credencial ID Token e enviando-a para validação no endpoint `/api/auth/google`.
- **FR-002**: O modal de login DEVE ocultar completamente o formulário manual de e-mail e atalhos de desenvolvimento quando em ambiente de produção (`import.meta.env.PROD`), renderizando exclusivamente o botão oficial de login com Google Workspace.
- **FR-003**: O backend DEVE validar rigorosamente a assinatura criptográfica do ID Token Google contra o `GOOGLE_CLIENT_ID` oficial do projeto `vota-509520` e rejeitar qualquer conta com domínio divergente de `@colegiocarbonell.com.br`.
- **FR-004**: O backend Express DEVE habilitar `app.set('trust proxy', 1)` para resolver corretamente o endereço IP e os cabeçalhos de encaminhamento através do Google Cloud Run e Firebase Hosting CDN.
- **FR-005**: O limitador de taxa de submissão de votos (`voteLimiter`) DEVE ser aplicado exclusivamente ao método `POST /api/vote`, sendo indexado pela identidade do colaborador autenticado (`req.user.email`) com fallback para IP, garantindo que usuários compartilhando a mesma rede Wi-Fi não sejam bloqueados mutuamente.
- **FR-006**: As rotas de consulta pública de status (`GET /api/vote/status`) e catálogo (`GET /api/vote/candidates`) NÃO DEVEM ser submetidas ao limitador restrito de submissão de votos, garantindo a continuidade do polling periódico.
- **FR-007**: As fotos dos 162 participantes DEVEM ser servidas diretamente pela CDN global do Firebase Hosting (através de `client/public/photos/`), eliminando o redirecionamento de fotos para o Cloud Run no arquivo `firebase.json`.
- **FR-008**: O componente de card do participante (`CandidateCard.jsx`) DEVE conter apenas uma única tag `<img>` no DOM por participante, utilizando estilização CSS pura institucional para o plano de fundo e liberando recursos de memória em smartphones.
- **FR-009**: O backend DEVE implementar cache em memória (TTL de 10 minutos) para a coleção de candidatos, de modo que requisições frequentes de métricas (`/api/admin/metrics`) não executem leituras redundantes de 162 documentos no Firestore a cada consulta.
- **FR-010**: A sincronização de participantes (`/api/admin/sync`) ou inclusão manual (`/api/admin/add-candidate`) DEVE invalidar e atualizar o cache em memória de candidatos imediatamente.
- **FR-011**: O polling do painel administrativo (`AdminPage.jsx`) DEVE operar com intervalo calibrado de 8 segundos utilizando agendamento sequencial defensivo (`setTimeout` encadeado), prevenindo acúmulo de requisições em situações de oscilação de conectividade.
- **FR-012**: A camada de persistência (`server/db.js`) DEVE ser unificada no Google Cloud Firestore, descontinuando o fallback híbrido em arquivos locais `db.json`.
- **FR-013**: O projeto DEVE conter arquivo oficial de regras de segurança `firestore.rules` bloqueando todo o acesso direto de clientes externos (`allow read, write: if false;`), canalizando 100% das operações pelo backend autenticado.
- **FR-014**: A biblioteca `sharp` DEVE ser movida para `devDependencies` no `server/package.json`, diminuindo a imagem Docker e o tempo de inicialização a frio (cold start) no Cloud Run.
- **FR-015**: O script de testes de validação automatizada (`server/scripts/testValidation.js`) DEVE validar rotas reais existentes (`POST /api/admin/status`), verificando explicitamente `res.ok` e status codes HTTP em todos os cenários.
- **FR-016**: A política de CORS no backend DEVE ser restrita às origens oficiais autorizadas (domínios Firebase Hosting do projeto e `localhost`), eliminando o uso de `origin: true` permissivo.

---

### Key Entities

- **GoogleCredentialToken**: Token JWT emitido pelo Google Identity Services (GSI) contendo email institucional, nome, foto e assinatura criptográfica verificável pela biblioteca `google-auth-library`.
- **UserSession**: Objeto de sessão decodificado a partir do token emitido pelo backend, contendo `{ email, name, picture, isAdmin, exp }`.
- **CandidateCache**: Objeto em memória no runtime Node.js contendo a lista consolidada de candidatos, timestamp de expiração e métodos de invalidação atômica.
- **RateLimitBucket**: Registro em memória no servidor mapeando o identificador do colaborador (`req.user.email`) e janela temporal de submissões permitidas.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001 (Zero Bloqueio em Produção)**: 100% dos colaboradores autenticando-se com e-mail `@colegiocarbonell.com.br` concluem o login e obtêm token válido de sessão sem receber erro 403.
- **SC-002 (Tolerância a Wi-Fi Compartilhado)**: Pelo menos 50 colaboradores simultâneos navegando sob o mesmo IP público conseguem emitir seus votos sem registrar nenhum falso positivo de `HTTP 429 Too Many Requests`.
- **SC-003 (Redução Drástica de Leituras no Firestore)**: O volume de leituras no Firestore gerado pelo painel administrativo cai de ~236.000 leituras/hora para menos de 5.000 leituras/hora (redução superior a 97%).
- **SC-004 (Custo Zero de CPU do Cloud Run para Fotos)**: 100% das requisições de fotos dos 162 participantes são atendidas pela CDN do Firebase Hosting, gerando zero requisições estáticas roteadas para o container Cloud Run.
- **SC-005 (Desempenho no DOM Móvel)**: O número de elementos `<img>` instanciados na galeria cai exatamente pela metade (de 324 para 162 imagens), reduzindo o uso de memória da GPU e garantindo rolagem a 60 FPS em smartphones comuns.
- **SC-006 (Integridade de Regras e Testes)**: 100% das asserções da suíte `npm test` no servidor passam com validação de status HTTP real e sem falsos positivos.
