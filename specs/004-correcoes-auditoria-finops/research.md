# Research & Technical Decisions: Correções de Auditoria e Otimização FinOps

**Feature**: `004-correcoes-auditoria-finops`  
**Date**: 2026-09-25  
**Status**: Approved

---

## 1. Google Identity Services (GSI) no Frontend React

### Contexto
O [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) exige login obrigatório com conta Google Workspace institucional (`@colegiocarbonell.com.br`). Na auditoria técnica, constatou-se que o backend bloqueava a rota de testes (`/api/auth/dev-login`) em produção, mas o frontend não possuía o botão nem a integração com a API oficial do Google Sign-In, gerando erro HTTP 403 e bloqueando a entrada de qualquer usuário.

### Decisão Técnica
* Carregar o SDK oficial do Google Identity Services de forma assíncrona no [`client/index.html`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/index.html):
  ```html
  <script src="https://accounts.google.com/gsi/client" async defer></script>
  ```
* No componente [`LoginModal.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/components/LoginModal.jsx), instanciar o botão oficial via `window.google.accounts.id`:
  - `initialize({ client_id, callback: handleCredentialResponse, hd: 'colegiocarbonell.com.br' })`
  - `renderButton(buttonDivRef, { theme: 'outline', size: 'large', width: '100%', text: 'signin_with', shape: 'rectangular' })`
* A propriedade `hd: 'colegiocarbonell.com.br'` (Hosted Domain) instrui o seletor de contas do Google a priorizar e destacar as contas da instituição.
* Em produção (`import.meta.env.PROD`), o modal renderiza exclusivamente o botão oficial institucional do Google.
* Em desenvolvimento (`import.meta.env.DEV`), os botões de atalho rápido continuam visíveis logo abaixo para agilizar testes locais sem necessidade de login real a cada refresh.

### Alternativas Avaliadas
- *Biblioteca `@react-oauth/google`*: Adicionaria uma dependência de terceiros ao `package.json` com compatibilidade incerta no React 19 recém-lançado.
- *Decisão*: Utilizar o SDK nativo do Google Identity Services via script tag, garantindo zero dependências extras e compatibilidade total com React 19.

---

## 2. Rate Limiting Defensivo com Suporte a Proxy (Wi-Fi da Confraternização)

### Contexto
Durante a festa da escola, dezenas de colaboradores estarão conectados à mesma rede Wi-Fi da festa (compartilhando um único endereço IP público de saída). O Express não possuía `trust proxy` ativado e o middleware de rate limiting (`voteLimiter`, máximo de 20 requisições/minuto) estava atrelado ao prefixo global `/api/vote`, interceptando inclusive o polling periódico de status (`/api/vote/status`).

### Decisão Técnica
1. **Configurar Trust Proxy no Express:**
   ```javascript
   app.set('trust proxy', 1);
   ```
   Isso permite que o Express confie no primeiro salto de proxy (Cloud Run e CDN do Firebase Hosting), lendo o IP real do cliente através do cabeçalho `X-Forwarded-For`.
2. **Desacoplamento do Limitador de Votos:**
   - Remover `app.use('/api/vote', voteLimiter)` do nível do roteador.
   - Aplicar o `voteLimiter` estrito **exclusivamente na rota `POST /api/vote`**.
   - Definir gerador de chave inteligente baseado na identidade autenticada:
     ```javascript
     keyGenerator: (req) => req.user?.email || req.ip
     ```
   - As consultas `GET /api/vote/status` e `GET /api/vote/candidates` permanecem protegidas apenas pelo `globalApiLimiter` (180 req/min por IP), sem risco de bloqueio mútuo por voto de colegas no mesmo Wi-Fi.

---

## 3. FinOps: Entrega de Fotos Estáticas via Firebase Hosting CDN

### Contexto
Atualmente, as fotos dos 162 participantes residem na pasta `server/photos/` e o arquivo `firebase.json` possui um rewrite direcionando `/photos/**` para o serviço Cloud Run. Isso gera ~16.200 requisições diretamente ao container Express logo na abertura do evento, escalando instâncias desnecessárias e gerando custos de processamento e egress.

### Decisão Técnica
* Copiar a pasta otimizada de fotos para [`client/public/photos/`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/public).
* No [`firebase.json`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/firebase.json), remover o bloco de rewrite que encaminhava `/photos/**` para o Cloud Run.
* O Firebase Hosting CDN atende automaticamente arquivos presentes na pasta pública do frontend com cache global na borda, latência sub-50ms e custo zero de execução de containers.

---

## 4. FinOps: Cache de Catálogo de Candidatos em Memória no Backend

### Contexto
O endpoint de apuração administrativa (`/api/admin/metrics`) é consultado a cada 4 segundos pelo painel do gestor. Em cada ciclo, o backend executa `getCandidates()`, lendo todos os 162 documentos da coleção `candidates` do Firestore. Isso gera **236.700 leituras por hora** para um único painel aberto, esgotando o limite gratuito (50.000 leituras/dia) em menos de 15 minutos.

### Decisão Técnica
* Implementar cache em memória no Node.js com TTL de 10 minutos para a lista de candidatos:
  ```javascript
  let candidatesCache = { data: null, expiresAt: 0 };
  ```
* Como a lista de participantes é estática durante a festa, o backend lê do Firestore apenas na inicialização (ou após 10 minutos).
* Invalidação forçada: caso um administrador sincronize fotos (`/api/admin/sync`) ou adicione um participante manualmente (`/api/admin/add-candidate`), o cache em memória é invalidado imediatamente.
* **Resultado:** Redução de mais de 98% das leituras no Firestore no painel de administração.

---

## 5. Polling Encadeado no Painel Administrativo

### Contexto
O uso de `setInterval(loadMetrics, 4000)` em [`AdminPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/AdminPage.jsx) dispara requisições fixas mesmo se a chamada anterior ainda estiver em trânsito (devido a oscilações de conexão 4G/Wi-Fi no salão da festa), provocando concorrência e acúmulo de requisições.

### Decisão Técnica
* Substituir o `setInterval` cego por um ciclo encadeado baseado em `setTimeout` com intervalo calibrado de **8 segundos**.
* O próximo agendamento só é realizado após a resposta (sucesso ou falha) da requisição anterior ter sido concluída, acompanhado de verificação de montagem do componente (`isMounted`) para evitar vazamento de memória.

---

## 6. Unificação de Persistência no Firestore & Regras de Segurança

### Contexto
A coexistência de `db.json` e Firestore em [`server/db.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/db.js) causa divergência entre instâncias do Cloud Run, onde uma lê do Firestore e outra tenta ler do disco local efêmero. Além disso, a ausência de `firestore.rules` deixa o banco desprotegido contra acessos diretos.

### Decisão Técnica
1. Unificar todas as rotas e serviços para utilizar exclusivamente a API do Firestore via `@google-cloud/firestore`.
2. Para desenvolvimento local sem credenciais GCP, suportar a variável padrão `FIRESTORE_EMULATOR_HOST=localhost:8080`.
3. Criar o arquivo [`firestore.rules`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/firestore.rules) na raiz do projeto bloqueando 100% dos acessos diretos de clientes (`allow read, write: if false;`).
4. Mover a dependência `sharp` de `dependencies` para `devDependencies` no [`server/package.json`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/package.json), reduzindo o container de produção em ~50 MB e acelerando o cold start.
