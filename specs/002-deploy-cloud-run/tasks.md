# Tasks: Deploy em Produção (Firebase Hosting + Google Cloud Run) e Google OAuth

**Input**: Documentos de design em `/specs/002-deploy-cloud-run/`  
**Prerequisites**: [plan.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/plan.md), [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/spec.md), [research.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/research.md), [data-model.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/data-model.md), [quickstart.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/quickstart.md)  

---

## Phase 1: Setup (Infraestrutura Base do Servidor)

**Purpose**: Preparar o container e as portas do servidor Express para execução em ambiente gerenciado no Cloud Run.

- [X] T001 Criar `server/Dockerfile` e `server/.dockerignore` otimizados com Node.js 20 Alpine para execução no Cloud Run
- [X] T002 Ajustar `server/index.js` para escutar na porta da variável `process.env.PORT` e no host `0.0.0.0`

---

## Phase 2: Foundational (Roteamento e Gateway)

**Purpose**: Configurar o gateway unificado do Firebase Hosting para encaminhar requisições ao Cloud Run sem necessidade de CORS.

**⚠️ CRITICAL**: Garante que o frontend consuma a API sob o mesmo domínio seguro HTTPS.

- [X] T003 Configurar regras de rewrites para o serviço Cloud Run `votacao-backend` no arquivo `firebase.json`

**Checkpoint**: Gateway de rede e arquivos de conteinerização preparados.

---

## Phase 3: User Story 1 - Deploy do Backend no Cloud Run (Priority: P1) 🎯 MVP

**Goal**: Publicar o backend Node.js Express no Google Cloud Run no projeto `vota-509520` (região `southamerica-east1`) com alta disponibilidade e escalabilidade automática.

**Independent Test**: Disparar uma requisição GET para `https://<service-url>/api/status` e verificar o retorno 200 OK com o estado do sistema.

### Implementation for User Story 1

- [X] T004 [US1] Executar a compilação e publicação do backend `votacao-backend` no Cloud Run via Google Cloud SDK (`gcloud run deploy`)
- [X] T005 [US1] Validar a resposta do endpoint de saúde `/api/status` e carregamento de fotos `/photos/` na URL oficial do Cloud Run

**Checkpoint**: Backend ativo e respondendo na nuvem em São Paulo (`southamerica-east1`).

---

## Phase 4: User Story 2 - Deploy do Frontend no Firebase Hosting (Priority: P1)

**Goal**: Disponibilizar o frontend React/Vite no Firebase Hosting com carregamento otimizado pela CDN global e integração direta com o backend.

**Independent Test**: Acessar `https://vota-509520.web.app` em um navegador/smartphone e verificar o carregamento imediato da aplicação sem erros de rede.

### Implementation for User Story 2

- [X] T006 [US2] Executar o build de produção do frontend com Vite em `client/dist`
- [X] T007 [US2] Realizar o deploy do hosting no Firebase (`firebase deploy --only hosting`) e validar o carregamento da galeria

**Checkpoint**: Aplicação completa rodando sob o domínio oficial `https://vota-509520.web.app`.

---

## Phase 5: User Story 3 - Autenticação Oficial Google OAuth 2.0 (Priority: P2)

**Goal**: Garantir a restrição ao domínio `@colegiocarbonell.com.br` e configurar o Client ID Web no Cloud Run e frontend.

**Independent Test**: Realizar login de colaborador institucional e certificar que contas externas são rejeitadas.

### Implementation for User Story 3

- [X] T008 [US3] Configurar o Client ID OAuth 2.0 e tela de consentimento no GCP / Firebase Console autorizando os domínios do Firebase Hosting
- [X] T009 [US3] Injetar `GOOGLE_CLIENT_ID` e `JWT_SECRET` nas variáveis de ambiente do Cloud Run e no frontend

**Checkpoint**: Autenticação oficial ativada com segurança em produção.

---

## Phase 6: User Story 4 - Scripts de Automação de Publicação (Priority: P3)

**Goal**: Disponibilizar comandos no `package.json` para facilitar novos deploys da comissão.

**Independent Test**: Executar `npm run deploy` a partir da raiz do projeto.

### Implementation for User Story 4

- [X] T010 [US4] Adicionar os scripts `deploy`, `deploy:server` e `deploy:client` no `package.json` raiz

---

## Phase 7: Polish & Validação Final

**Purpose**: Verificação de ponta a ponta e testes de carga/operação para o evento.

- [X] T011 Executar o roteiro de testes e homologação descrito em `specs/002-deploy-cloud-run/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 (Setup)** e **Phase 2 (Foundational)**: Podem ser executadas imediatamente.
- **Phase 3 (Backend Cloud Run)**: Depende da Phase 1.
- **Phase 4 (Frontend Firebase Hosting)**: Depende da Phase 2 e Phase 3.
- **Phase 5 (OAuth)**: Pode ser integrada após a Phase 4.
- **Phase 6 (Scripts)**: Pode ser adicionada a qualquer momento após Phase 4.
- **Phase 7 (Polish)**: Validação final após todas as fases.
