# Implementation Plan: Correções de Auditoria, Hardening de Autenticação e Otimização FinOps

**Branch**: `antigravity-004/fix-correcoes-auditoria-finops` | **Date**: 2026-09-25 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/004-correcoes-auditoria-finops/spec.md)

---

## 1. Summary

Este plano estabelece a implementação técnica dos 6 eixos prioritários levantados na auditoria e consolidados na especificação funcional da Feature 004:
1. **Google Identity Services (GSI) no Frontend:** Renderização oficial do botão Google no modal de login, bloqueando interfaces de desenvolvimento em produção e enviando ID Tokens válidos para validação criptográfica no backend.
2. **Rate Limiting Consciente de Proxy (Wi-Fi Institucional):** Habilitação de `trust proxy` no Express e isolamento do limitador de submissão de voto para o método `POST /api/vote`, indexado pelo e-mail do colaborador autenticado (`req.user.email`).
3. **FinOps & Entrega de Fotos via CDN:** Migração das fotos dos 162 participantes para a pasta estática do cliente (`client/public/photos/`) e remoção do proxy de imagens no `firebase.json`, entregando ativos na borda via Firebase Hosting CDN com custo zero de processamento no Cloud Run.
4. **FinOps no Firestore (Cache em Memória de Catálogo):** Criação de cache no Node.js com TTL de 10 minutos para a lista de candidatos, eliminando a releitura redundante de 162 documentos a cada ciclo de polling do painel administrativo.
5. **Otimização de Renderização Móvel:** Eliminação da tag `<img>` duplicada em cada card de participante em `CandidateCard.jsx`, reduzindo o volume de nós de imagem no DOM pela metade.
6. **Unificação Arquitetural no Firestore & Hardening:** Descontinuação do fallback híbrido em `db.json`, adição do arquivo `firestore.rules` bloqueando acessos diretos de clientes, remoção de `sharp` das dependências de produção do Dockerfile e correção de asserções no script de testes `testValidation.js`.

---

## 2. Technical Context

* **Frontend:** React 19, Vite 8, Tailwind CSS v4, Lucide React, Google Identity Services SDK (`https://accounts.google.com/gsi/client`).
* **Backend:** Node.js 20, Express 5, `@google-cloud/firestore`, `google-auth-library`, `jsonwebtoken`, `express-rate-limit`.
* **Banco de Dados & Persistência:** Google Cloud Firestore (Modo Nativo, `southamerica-east1`), suporte a `FIRESTORE_EMULATOR_HOST` em ambiente local.
* **Infraestrutura & Hospedagem:** Google Cloud Run (container Express API) + Firebase Hosting (SPA e CDN global de fotos).
* **Projeto GCP / Firebase:** `vota-509520`.
* **Metas de Desempenho e FinOps:**
  - Redução de leituras no Firestore no painel admin de ~236.000 para < 5.000 leituras/hora.
  - Zero requisições de fotos estáticas direcionadas ao Cloud Run.
  - Redução de 324 para 162 elementos de imagem no DOM móvel.
  - Resposta do polling de status < 80ms sob carga simultânea.

---

## 3. Constitution & Governance Check

* **Regra 1 (Single Source of Truth):** [`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md#L158-L165) foi devidamente atualizado antes da elaboração deste plano.
* **Regra 2 (Identidade Visual Carbonell):** O botão oficial Google e os novos estilos de card respeitam a paleta Carbonell ([`DESIGN_SYSTEM_PRD.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md)), mantendo fundos institucionais e ícones Lucide.
* **Regra 3 (Fluxo do Speckit):** O plano conclui o Passo 2 (`/speckit-plan`). O agente DEVE parar ao final e sugerir a execução de `/speckit-tasks` sem implementar código antecipadamente.

---

## 4. Project Structure & Artifacts

### 4.1 Documentação da Feature
```text
specs/004-correcoes-auditoria-finops/
├── spec.md              # Especificação funcional aprovada
├── plan.md              # Este plano de implementação
├── research.md          # Decisões técnicas e benchmarks
├── data-model.md        # Modelos Firestore e cache em memória
├── quickstart.md        # Roteiro de testes de validação
├── contracts/
│   └── api-contracts.md # Contratos de endpoints REST
└── checklists/
    └── requirements.md  # Checklist de qualidade de requisitos
```

### 4.2 Arquivos de Código Afetados
```text
votacao-confra/
├── firebase.json                     # Remoção do rewrite de /photos para o Cloud Run
├── firestore.rules                   # Bloqueio total de leituras/escritas diretas
├── server/
│   ├── index.js                      # trust proxy, isolamento do rateLimiter, remoção de rotas duplicadas
│   ├── db.js                         # Unificação no Firestore, módulo de cache de candidatos
│   ├── routes/
│   │   ├── auth.js                   # Hardening de autenticação Google GSI
│   │   ├── vote.js                   # Rate limiter específico por usuário no POST /api/vote
│   │   └── admin.js                  # Uso do cache de candidatos no /metrics e invalidação reativa
│   ├── scripts/
│   │   └── testValidation.js         # Correção da rota /status e asserções estritas HTTP
│   └── package.json                  # Mover sharp para devDependencies
└── client/
    ├── index.html                    # Injeção do script Google Identity Services (GSI)
    ├── public/
    │   └── photos/                   # Fotos dos 162 colaboradores entregues diretamente via CDN
    └── src/
        ├── components/
        │   ├── LoginModal.jsx        # Botão oficial Google GSI e bloqueio de dev-login em produção
        │   └── CandidateCard.jsx     # Remoção do nó <img> duplicado (otimização DOM)
        └── pages/
            └── AdminPage.jsx         # Polling encadeado defensivo com setTimeout a cada 8s
```

---

## 5. Fases de Execução Planejadas

### Fase 1: Hardening de Autenticação e Rate Limiting (P1)
- Inserir script Google GSI no `client/index.html`.
- Renderizar o botão oficial do Google Sign-In no `LoginModal.jsx`, conectando a `googleLogin(credential)`.
- Configurar `app.set('trust proxy', 1)` no `server/index.js`.
- Aplicar o `voteLimiter` com chave por usuário (`req.user.email`) apenas em `POST /api/vote`.

### Fase 2: FinOps & Entrega de Fotos via CDN (P2)
- Copiar fotos otimizadas para `client/public/photos/`.
- Remover o bloco de rewrite `/photos/**` do `firebase.json`.
- Otimizar `CandidateCard.jsx` para instanciar apenas 1 tag `<img>` por card com background gradiente CSS institucional.

### Fase 3: FinOps no Firestore & Estabilidade no Painel Admin (P2)
- Implementar cache em memória no `server/db.js` com TTL de 10 minutos para `getCandidates()`.
- Invalidar o cache de candidatos ao adicionar participante ou sincronizar.
- Atualizar `AdminPage.jsx` para polling encadeado defensivo a cada 8 segundos via `setTimeout`.

### Fase 4: Limpeza Arquitetural, Segurança e Testes (P3)
- Criar `firestore.rules` bloqueando acessos diretos.
- Mover `sharp` para `devDependencies` no `server/package.json`.
- Corrigir asserções e rotas no `server/scripts/testValidation.js`.
- Executar bateria completa de testes automatizados e validação de build.
