# Feature Specification: Estabilização de Nuvem, FinOps e Segurança (Hardening)

**Feature Branch**: `antigravity-003/feat-estabilizacao-nuvem-seguranca`  
**Created**: 2026-09-24  
**Status**: Draft  
**Input**: Resolução integral dos achados da auditoria técnica (persistência em Firestore para Cloud Run, sigilo do voto, otimização FinOps de fotos e polling, blindagem de autenticação).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Voto Resiliente e Concorrente em Nuvem (Priority: P1)

Como colaborador da confraternização votando através do meu smartphone no momento de abertura da urna, quero que meu voto seja registrado de forma confiável e instantânea, mesmo que dezenas de colegas estejam votando no mesmo segundo ou o servidor em nuvem reinicie instâncias, garantindo que minha escolha nunca seja descartada ou sobrescrita.

**Why this priority**: É o valor central da aplicação. Se os votos forem perdidos devido ao reinício de instâncias efêmeras do Cloud Run ou sobrescritos por condições de corrida durante o pico da festa, o evento e o resultado da apuração serão completamente invalidados.

**Independent Test**: Simular múltiplos colaboradores emitindo votos simultaneamente e verificar que todos os votos são contabilizados com consistência transacional e persistem mesmo após reinicialização do serviço de backend.

**Acceptance Scenarios**:

1. **Given** que a votação está no status `open`, **When** um colaborador autenticado submete seu voto em um candidato válido, **Then** o sistema grava o voto de forma atômica no banco gerenciado em nuvem e retorna confirmação imediata.
2. **Given** que múltiplos colaboradores votam exatamente no mesmo segundo, **When** as requisições chegam concorrentemente a diferentes instâncias do backend, **Then** nenhuma requisição sobrescreve os dados da outra e cada voto único é persistido.
3. **Given** que um colaborador já possui um voto ativo, **When** ele altera sua escolha para outro candidato enquanto a votação estiver aberta, **Then** o registro anterior é atualizado atomicamente sem duplicar contagens no ranking.

---

### User Story 2 - Sigilo Estrito do Voto na Apuração (Priority: P1)

Como colaborador participando da votação, quero ter a garantia de que meu voto na melhor fantasia é 100% secreto, de modo que nem organizadores nem administradores possam saber em quem votei, preservando minha liberdade e privacidade no ambiente de trabalho.

**Why this priority**: A conformidade com a privacidade e o sigilo de voto em celebrações institucionais é essencial para a confiança dos colaboradores e adesão à eleição.

**Independent Test**: Acessar o painel administrativo com credencial autorizada e verificar que a lista de auditoria exibe apenas o registro de presença (quem votou e horário), sem qualquer exposição do candidato votado.

**Acceptance Scenarios**:

1. **Given** que administradores autorizados acessam a tela de apuração, **When** a lista de auditoria de votos é carregada, **Then** são exibidos apenas o nome do colaborador e o horário de votação (controle de presença), sem informar qual fantasia ele escolheu.
2. **Given** a consulta ao endpoint de métricas administrativas, **When** os dados de apuração são retornados, **Then** os votos de cada candidato são consolidados apenas em contagem numérica e percentual coletivo, sem vínculos com a identidade individual dos eleitores.

---

### User Story 3 - Carregamento Leve e Rápido em Redes Móveis (FinOps) (Priority: P2)

Como colaborador acessando a galeria de fotos através de conexão 4G/Wi-Fi da festa no meu smartphone, quero que a lista de fotos abra instantaneamente sem consumir todo o meu plano de dados ou travar o navegador, e que a aplicação não faça requisições desnecessárias que sobrecarreguem o servidor.

**Why this priority**: Reduz drásticamente os custos de transferência de dados (egress) no Cloud Run, evita a sobrecarga da infraestrutura durante o evento e elimina o tempo excessivo de carregamento para os usuários em smartphones.

**Independent Test**: Medir o tamanho total dos recursos transferidos na primeira carga da página e verificar que a listagem de candidatos é carregada uma única vez, com polling periódico limitado apenas ao status da votação.

**Acceptance Scenarios**:

1. **Given** que um usuário abre a aplicação pela primeira vez no smartphone, **When** os cards dos 161 participantes são renderizados, **Then** o peso total de todas as fotos transferidas não ultrapassa 10 MB (em contraste aos 187 MB originais).
2. **Given** que o usuário permanece com a tela da galeria aberta, **When** o ciclo de atualização periódica executa, **Then** apenas o status da votação é verificado a cada 10-15 segundos, sem recarregar a lista completa de participantes a cada ciclo.

---

### User Story 4 - Blindagem de Autenticação em Ambiente de Produção (Priority: P2)

Como comissão organizadora, quero que apenas usuários autenticados com conta oficial do Google Workspace no domínio `@colegiocarbonell.com.br` consigam emitir votos ou acessar áreas administrativas, impedindo qualquer acesso por atalhos de desenvolvimento ou tokens não verificados.

**Why this priority**: Protege o sistema contra manipulações fraudulentas de votos, aberturas indevidas da urna e acessos não autorizados por agentes externos.

**Independent Test**: Tentar autenticar utilizando endpoints de desenvolvimento em ambiente de produção e verificar a rejeição obrigatória com código de erro correspondente.

**Acceptance Scenarios**:

1. **Given** que a aplicação está executando em produção, **When** qualquer cliente tenta acessar a rota de login de desenvolvimento (`/api/auth/dev-login`), **Then** o sistema recusa a requisição com erro 403/404 informando que o modo de teste está desativado.
2. **Given** uma requisição de autenticação via Google OAuth, **When** o token de credencial é processado, **Then** a assinatura criptográfica é validada contra os servidores do Google antes de gerar a sessão do usuário.

---

### Edge Cases

- O que acontece se a conexão de internet do colaborador oscilar no momento da votação?  
  O sistema exibe mensagem amigável de erro de conectividade permitindo nova tentativa, e o feedback visual confirma apenas quando o banco em nuvem acusar recebimento bem-sucedido.
- O que acontece se o serviço do Firestore estiver temporariamente indisponível?  
  A API retorna erro 503 com instrução clara para tentar novamente em alguns segundos, sem corromper o estado em memória.
- O que acontece se uma foto falhar no carregamento pelo navegador do usuário?  
  O card exibe imediatamente o avatar vetorial institucional com as iniciais do colaborador, sem distorção visual na grade.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE persistir todos os votos emitidos de forma transacional e atômica em banco gerenciado em nuvem (Google Cloud Firestore), garantindo tolerância ao ciclo de vida efêmero do Google Cloud Run.
- **FR-002**: O sistema DEVE garantir que cada colaborador ativo possua no máximo 1 voto registrado por vez, permitindo alteração atômica de escolha enquanto o status for `open`.
- **FR-003**: O painel de auditoria administrativo DEVE manter o sigilo estrito do voto, registrando exclusivamente quem votou e o timestamp da participação, sem associar o colaborador ao candidato votado.
- **FR-004**: O sistema DEVE exibir no painel administrativo a contagem agregada de votos, taxa de participação e ranking em tempo real a partir de dados consolidados.
- **FR-005**: As imagens dos participantes DEVEM ser otimizadas e compactadas para dimensões máximas de 500px em formato web (WebP/JPEG otimizado), limitando o peso médio por foto a no máximo 60 KB.
- **FR-006**: O cliente web frontend DEVE requisitar o catálogo de participantes apenas uma única vez na inicialização da sessão, isolando o polling periódico estritamente para o status e ciclo de vida da votação (`waiting`, `open`, `closed`).
- **FR-007**: O polling do status da votação no cliente frontend DEVE operar com intervalo adaptativo entre 10 e 15 segundos para conservar banda e processamento no Cloud Run.
- **FR-008**: O endpoint de atalho de autenticação de desenvolvimento (`/api/auth/dev-login`) DEVE ser bloqueado e desativado quando `NODE_ENV === 'production'`.
- **FR-009**: O endpoint de autenticação do Google OAuth DEVE obrigatoriamente validar a assinatura criptográfica do ID Token utilizando o `GOOGLE_CLIENT_ID` oficial, rejeitando decodificações inseguras sem assinatura.
- **FR-010**: O sistema DEVE implementar limitação de taxa de requisições (rate limiting) nas rotas de votação e autenticação para mitigar abusos ou envios automatizados em lote.

### Key Entities

- **Colaborador / Candidato**: Identificador único determinístico (`id`), nome de exibição institucional, e-mail institucional `@colegiocarbonell.com.br`, URL da foto otimizada, departamento e nome da fantasia (quando cadastrado).
- **Voto**: E-mail do eleitor como chave única primária, identificador do candidato escolhido, carimbo de data/hora (timestamp).
- **Registro de Presença / Auditoria**: E-mail e nome do eleitor, timestamp da participação (sem campo de candidato).
- **Configuração da Urna**: Status da votação (`waiting`, `open`, `closed`), título oficial do evento, lista de administradores autorizados.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O volume total de dados transferidos no carregamento inicial da galeria completa de 161 participantes é reduzido em pelo menos 90% (de 187 MB para menos de 10 MB).
- **SC-002**: 100% dos votos emitidos durante a abertura da urna permanecem íntegros e persistentes, mesmo com reinício ou escalonamento automático de instâncias no Cloud Run.
- **SC-003**: 0% de vazamento de voto nominal: nenhuma resposta de API ou tela administrativa expõe a relação entre o eleitor e o candidato votado.
- **SC-004**: O número de requisições repetidas ao catálogo de participantes é reduzido a zero após o carregamento inicial da página.
- **SC-005**: 100% das tentativas de acesso à rota de login de desenvolvimento são bloqueadas em ambiente de produção.

---

## Assumptions

- O projeto Google Cloud Platform `vota-509520` possui o Google Cloud Firestore habilitado em modo Nativo na região `southamerica-east1`.
- O container do Cloud Run executará com as credenciais padrão do ambiente GCP (Default Application Credentials / IAM Role `roles/datastore.user`) para ler e escrever no Firestore sem chaves estáticas.
- A lista de e-mails de administradores autorizados permanece configurável via variável de ambiente `ADMIN_EMAILS` e Firestore.
- Os navegadores dos colaboradores possuem suporte padrão a formatos modernos de imagem (WebP/JPEG).
