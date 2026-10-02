# Feature Specification: Deploy em Produção (Firebase Hosting + Google Cloud Run) e Google OAuth

**Feature Branch**: `antigravity-002/feat-deploy-cloud-run`  
**Created**: 2026-09-24  
**Status**: Draft  
**Input**: Opção A: Frontend no Firebase Hosting, Backend Node.js no Google Cloud Run no projeto GCP `vota-509520`, e autenticação oficial Google OAuth via console.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Containerização e Deploy do Backend no Google Cloud Run (Priority: P1) 🎯 MVP

Como administrador da comissão organizadora da festa,  
desejo que o backend Node.js Express seja empacotado em um container Docker e publicado no Google Cloud Run (projeto `vota-509520`, região `southamerica-east1`),  
para que a API de votação, persistência de dados e serviço de fotos estejam operacionais na nuvem com escalabilidade automática para absorver os picos simultâneos da festa.

**Why this priority**: O backend é o núcleo funcional do sistema (registra os votos, valida sessões e apura os resultados). Sem o backend publicado e acessível publicamente via HTTPS, o frontend em produção não consegue operar.

**Independent Test**: Pode ser testado executando o container localmente ou via requisição HTTP direta ao endpoint do Cloud Run (ex: `GET /api/status`), validando o retorno de status HTTP 200 com o estado atual da votação.

**Acceptance Scenarios**:

1. **Given** que o Dockerfile do backend foi construído,  
   **When** o container for iniciado pelo Google Cloud Run,  
   **Then** a porta `$PORT` fornecida pelo Cloud Run deve ser vinculada corretamente e o servidor deve responder a requisições de health check em `/api/status`.

2. **Given** que colaboradores acessam o endpoint de fotos no Cloud Run,  
   **When** uma requisição para `/photos/<arquivo>.jpg` for feita,  
   **Then** a imagem correspondente da pasta de fotos deve ser servida com os cabeçalhos apropriados de cache e MIME type.

3. **Given** que o servidor recebe variáveis de ambiente de produção,  
   **When** `JWT_SECRET`, `ADMIN_EMAILS` e `GOOGLE_CLIENT_ID` forem definidos no Cloud Run,  
   **Then** o backend deve validar tokens de sessão e proteger as rotas administrativas `/api/admin/*`.

---

### User Story 2 - Deploy do Frontend no Firebase Hosting com Integração Unificada (Priority: P1)

Como colaborador do Colégio Carbonell acessando o evento pelo smartphone,  
desejo acessar uma URL oficial do Firebase Hosting (ex: `https://vota-509520.web.app`) com HTTPS e carregamento instantâneo,  
para que eu visualize a galeria e emita meu voto sem falhas de conexão ou erros de CORS.

**Why this priority**: O Firebase Hosting provê CDN global com SSL automático, ideal para carregamento mobile ultrarrápido via QR Code impresso no evento.

**Independent Test**: Acessar `https://vota-509520.web.app` em um dispositivo móvel, verificar o carregamento do bundle React compilado pelo Vite e certificar que as requisições para `/api/**` são roteadas de forma transparente para o Cloud Run.

**Acceptance Scenarios**:

1. **Given** que o frontend foi compilado com `npm run build` na pasta `client/dist`,  
   **When** o comando `firebase deploy --only hosting` for executado,  
   **Then** os arquivos estáticos devem ser publicados e acessíveis via HTTPS em `vota-509520.web.app`.

2. **Given** que o arquivo `firebase.json` contém as regras de `rewrites`,  
   **When** o frontend faz requisições para rotas relativas `/api/*`,  
   **Then** o Firebase Hosting deve encaminhar as chamadas para o serviço backend no Cloud Run sem necessidade de CORS manual.

3. **Given** que o usuário atualiza a página ou navega para rotas SPA como `/admin` ou `/revelacao`,  
   **When** a requisição atingir o Firebase Hosting,  
   **Then** o `index.html` deve ser retornado sem erro 404, mantendo o roteamento cliente do React.

---

### User Story 3 - Autenticação Oficial Google OAuth 2.0 em Produção (Priority: P2)

Como colaborador do Colégio Carbonell,  
desejo me autenticar utilizando minha conta institucional Google (`@colegiocarbonell.com.br`) com o fluxo oficial de login do Google,  
para que meu acesso seja seguro, direto e validado pelo domínio da escola.

**Why this priority**: Em produção, o login simulado de desenvolvimento deve ser desabilitado ou reservado a testes, garantindo que apenas contas institucionais reais participem do pleito.

**Independent Test**: Clicar em "Entrar com Google" na aplicação em produção, autenticar com uma conta `@colegiocarbonell.com.br` e confirmar que o JWT é gerado e o usuário tem acesso liberado à galeria de votação. Tentar autenticar com uma conta pessoal (`@gmail.com`) e certificar que o acesso é bloqueado com mensagem de erro clara.

**Acceptance Scenarios**:

1. **Given** que o colaborador clica em login com Google,  
   **When** ele seleciona uma conta `@colegiocarbonell.com.br`,  
   **Then** o Google emite o ID Token e o backend valida a assinatura e o domínio, retornando a sessão de 12 horas.

2. **Given** que um usuário tenta utilizar um e-mail pessoal não autorizado (`usuario@gmail.com`),  
   **When** o token for validado pelo backend,  
   **Then** o sistema deve retornar status HTTP 403 com a mensagem `"Acesso permitido apenas para contas @colegiocarbonell.com.br"`.

---

### User Story 4 - Scripts e Automação de Publicação (Priority: P3)

Como mantenedor do projeto,  
desejo dispor de comandos centralizados no `package.json` para build e deploy do backend e frontend,  
para que qualquer alteração de código ou inclusão de fotos de colaboradores possa ser implantada com segurança e rapidez.

**Why this priority**: Agiliza a operação durante a preparação do evento, diminuindo a probabilidade de falhas manuais.

**Independent Test**: Executar `npm run deploy` na raiz do projeto e validar a execução sequencial do build do frontend e deploy no Firebase e Cloud Run.

**Acceptance Scenarios**:

1. **Given** que o desenvolvedor executou `npm run deploy:server`,  
   **When** o comando finalizar,  
   **Then** a imagem de container deve ser construída via Cloud Build e atualizada no Cloud Run.

2. **Given** que o desenvolvedor executou `npm run deploy:client`,  
   **When** o comando finalizar,  
   **Then** os arquivos estáticos devem ser compilados com o Vite e publicados no Firebase Hosting.

---

## Edge Cases

- **Ausência de credenciais OAuth no início**: Caso `GOOGLE_CLIENT_ID` não esteja definido inicialmente no backend, o sistema deve manter suporte controlado ao login institucional para testes de homologação pré-evento.
- **Reinicialização da instância do Cloud Run**: Como instâncias do Cloud Run podem escalar até zero quando ociosas, o cold start deve ser minimizado garantindo imagem leve (Node.js Alpine) e inicialização rápida do Express.
- **Conexões lentas ou 4G durante a festa**: As fotos dos colaboradores devem ser cacheadas via cabeçalhos HTTP `Cache-Control: public, max-age=86400` para não sobrecarregar a banda do local do evento.

---

## Requisitos Funcionais (FR)

- **FR-001**: O backend deve possuir um `Dockerfile` multi-stage ou enxuto para execução de produção no Node.js 20+ no Cloud Run.
- **FR-002**: O Cloud Run deve escutar na porta indicada pela variável de ambiente `PORT` (padrão 8080 no GCP).
- **FR-003**: O arquivo `firebase.json` deve conter configuração de `rewrites` apontando `/api/**` e `/photos/**` para o serviço do Cloud Run `votacao-api` (ou proxy reverso integrado).
- **FR-004**: O frontend Vite deve suportar a variável `VITE_API_URL` caso seja necessário conectar diretamente à URL do Cloud Run ou usar caminho relativo `/api` em modo unificado.
- **FR-005**: O backend deve aceitar a lista de `ADMIN_EMAILS` via variável de ambiente separada por vírgula.
- **FR-006**: O backend deve persistir votos e candidatos em arquivo `db.json` com gravação atômica em disco.
- **FR-007**: As fotos em `server/photos/` devem ser incluídas no container de deploy para estarem disponíveis imediatamente em produção.

---

## Requisitos Não-Funcionais (NFR)

- **NFR-001 - Latência**: Tempo de resposta médio da API inferior a 250ms na região `southamerica-east1`.
- **NFR-002 - Segurança**: Tráfego 100% criptografado sob HTTPS fornecido por certificados automáticos do Google / Firebase.
- **NFR-003 - Disponibilidade**: Autoscaling de instâncias no Cloud Run (mínimo 0 a 1 instância base e máximo de 10) para suportar os colaboradores votando simultaneamente.
- **NFR-004 - Tamanho de Imagem**: Imagem Docker do backend otimizada para download e inicialização rápida (cold start < 3s).
