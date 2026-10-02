# Technical Research & Decisions: Blindagem de Concorrência, FinOps e Tolerância a Falhas no Dia D

**Spec**: [spec.md](./spec.md) | **Date**: 2026-09-29

---

## 1. Decisão 1: Leitura Pontual de Voto do Eleitor em `/api/vote/status` (`getVoteByEmail`)

### Contexto do Problema
O endpoint `GET /api/vote/status` é consumido periodicamente via polling assíncrono a cada 12 segundos por todos os celulares conectados ([`App.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/App.jsx)). Na implementação anterior, esse endpoint invocava `getVotes()`, que realizava uma varredura completa (`db.collection('votes').get()`) em todos os documentos da coleção `votes` no Google Cloud Firestore.
Com 160 colaboradores votando na festa, 13,3 requisições por segundo resultavam em **2.128 leituras de documentos por segundo** (~127.000 leituras/minuto), provocando latências observadas de até 903ms por requisição no Cloud Run e gerando risco real de saturação de conexões ou custos desnecessários de banco de dados.

### Decisão Técnica
Implementar a função de consulta pontual `getVoteByEmail(email)` no módulo de banco de dados ([`server/db.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/db.js)):
- Se a requisição contiver um token JWT válido, extrair o e-mail normalizado (`normalizedEmail`) e executar uma leitura pontual no documento indexado: `db.collection('votes').doc(normalizedEmail).get()`.
- Se o documento existir, retornar os dados do voto (`candidateId`, `timestamp`); caso contrário, retornar `null`.
- Se a requisição for anônima (sem header `Authorization`), **nenhuma leitura de voto é executada** no Firestore, retornando `userVote: null` imediatamente.

### Racional & Benefícios
- **Redução de Carga:** O volume de leituras no Firestore cai de $N$ documentos (onde $N \le 161$) para **exatamente 1 documento** para usuários autenticados e **0 documentos** para requisições sem sessão.
- **Redução de Latência:** O tempo de resposta da rota passa de ~900ms para **menos de 30ms**, liberando o event loop do Node.js e evitando filas de requisições pendentes no Cloud Run.
- **Integridade dos Dados:** Como a chave primária da coleção `votes` é o próprio e-mail normalizado do colaborador, a leitura direta por ID de documento é a operação mais rápida, barata e atômica disponível no Firestore.

### Alternativas Consideradas e Descartadas
- *Uso de WebSockets / Server-Sent Events (SSE):* Exigiria conexões TCP persistentes abertas no Cloud Run, incompatível com o modelo serverless sem instâncias dedicadas de alto custo ou infraestrutura externa de pub/sub (Redis).
- *Cache em memória da coleção de votos no servidor:* Em ambiente Cloud Run com múltiplas instâncias (autoscaling até 10 containers), caches de escrita gerariam inconsistência entre instâncias, podendo fazer com que um voto emitido no container A parecesse "não votado" no container B. A leitura pontual direta no Firestore garante 100% de consistência sem desatualização.

---

## 2. Decisão 2: Cache em Memória com TTL Curto para a Configuração Global (`configCache`)

### Contexto do Problema
O documento `config/app_state` armazena o status da votação (`waiting`, `open`, `closed`), o título e as regras. Esse documento era consultado a cada requisição de status, gerando cerca de 13 leituras por segundo (mais de 46.000 leituras por hora) para ler exatamente os mesmos valores estáticos durante toda a festa.

### Decisão Técnica
Implementar um cache volátil em memória no Node.js ([`server/db.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/db.js)) para `config`:
- **Estrutura:** `let configCache = { data: null, expiresAt: 0 }`.
- **TTL (Time to Live):** 10 segundos. Se `Date.now() < configCache.expiresAt` e `!options.forceRefresh`, retornar os dados em memória sem acessar o Firestore.
- **Invalidação Atômica:** Criar a função `invalidateConfigCache()`, que deve ser obrigatoriamente chamada sempre que um administrador acionar o endpoint de alteração de status (`POST /api/admin/status`) ou qualquer mutação de configuração em `updateConfig()`.

### Racional & Benefícios
- Reduz em mais de 90% as leituras na coleção `config`.
- Garante resposta em tempo real: no exato momento em que o administrador clica no palco para abrir ou encerrar a votação, o cache é invalidado e a alteração é propagada no Firestore instantaneamente.

---

## 3. Decisão 3: Tolerância Estendida de Rede no Google Identity Services (GSI)

### Contexto do Problema
No componente de login ([`LoginPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/LoginPage.jsx)), o script `https://accounts.google.com/gsi/client` era aguardado com um teto de 40 iterações de 100ms (máximo de 4 segundos).
Em eventos presenciais com mais de 160 dispositivos concorrendo pelo mesmo ponto de acesso Wi-Fi ou rede móvel no salão, downloads de scripts externos podem sofrer latência transitória de 5 a 8 segundos. Com o limite de 4 segundos, alguns aparelhos exibiam erroneamente a mensagem de falha *"Serviço do Google indisponível no momento"* antes do término do download.

### Decisão Técnica
- Elevar o limite de espera para **150 iterações de 100ms** (tolerância total de **15 segundos**).
- Manter o spinner animado suave (`<Loader2 className="animate-spin" />`) durante o carregamento.
- Preservar o botão "Tentar Novamente" (`RefreshCw`) caso a conexão ultrapasse os 15 segundos ou ocorra falha persistente de rede.

---

## 4. Decisão 4: Isenção de Rate Limiting por IP para Autenticação Institucional (`/api/auth/google`)

### Contexto do Problema
No middleware de rate limiting global ([`server/index.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/index.js)), o limite configurado é de 300 requisições por minuto por IP. Como mais de 160 colaboradores estarão conectados à mesma rede Wi-Fi do salão, todos compartilharão o mesmo endereço IP público (NAT).
Embora as rotas de voto e status já estivessem isentas por IP, a rota `POST /api/auth/google` não constava na lista de exceções (`skip`). Caso dezenas de colaboradores realizassem login simultaneamente ou atualizassem a página no mesmo minuto, a rede corria o risco de atingir o limite e retornar erro HTTP 429.

### Decisão Técnica
Incluir `url.includes('/auth/google')` e `url.includes('/auth/dev-login')` na função `skip` do `globalApiLimiter` em `server/index.js`. A segurança individual contra abusos permanece garantida pela validação criptográfica de token e pela verificação de domínio institucional `@colegiocarbonell.com.br`.
