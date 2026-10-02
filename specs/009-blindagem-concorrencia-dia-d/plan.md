# Implementation Plan: Blindagem de Concorrência, Otimização FinOps e Tolerância a Falhas no Dia D

**Branch**: `antigravity-009/feat-blindagem-concorrencia-dia-d` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Aplicação das sugestões técnicas de blindagem de concorrência e FinOps identificadas durante os testes de uso com 160 usuários simultâneos no evento.

---

## 1. Summary

Implementar a blindagem técnica e arquitetural da aplicação para suportar com extrema agilidade, baixa latência (sub-100ms) e estabilidade absoluta o pico de mais de 160 colaboradores votando na festa de confraternização:
1. **Otimização Crítica do Firestore em `/api/vote/status`**: Criar a função `getVoteByEmail(email)` em [`server/db.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/db.js) e utilizá-la em [`server/routes/vote.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/routes/vote.js). Se o usuário estiver autenticado, consultar pontualmente apenas o documento indexado `votes/{normalizedEmail}` (1 leitura de documento); se não houver token ou requisição anônima, executar 0 leituras. Eliminar 100% das varreduras completas (`getVotes()`) no polling contínuo, reduzindo a carga do Firestore em mais de 99,4%.
2. **Cache em Memória de Curta Duração para `getConfig()`**: Implementar cache em memória no Node.js com TTL de 10 segundos para o documento `config/app_state`, com função de invalidação atômica e imediata (`invalidateConfigCache`) acionada em qualquer alteração de status em `POST /api/admin/status` e mutações de configuração.
3. **Resiliência do Google Identity Services (GSI) na Tela de Login**: Elevar a tolerância de espera ativa em [`client/src/pages/LoginPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/LoginPage.jsx) de 4 segundos para 15 segundos (150 tentativas de 100ms), prevenindo alertas precipitados de indisponibilidade em conexões com latência ou Wi-Fi saturado.
4. **Isenção de Rate Limiting por IP para Autenticação Google**: Incluir a rota `POST /api/auth/google` nas exceções de IP do `globalApiLimiter` em [`server/index.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/index.js), garantindo que dezenas de colaboradores conectando pelo mesmo Wi-Fi/NAT não sofram bloqueios com erro HTTP 429.

---

## 2. Technical Context

**Language/Version**: JavaScript (ES2022+ / CommonJS no server, ES Modules no client), Node.js 20+, React 19.x  
**Primary Dependencies**: Express 5.x, `@google-cloud/firestore` 9.x, `express-rate-limit` 8.x, `jsonwebtoken` 9.x, Vite 8.x, Tailwind CSS 4.x, Lucide React  
**Storage**: Google Cloud Firestore (modo Nativo, região `southamerica-east1`) e cache transitório em memória Node.js  
**Testing**: Node.js test runner / script de validação e carga E2E (`server/scripts/testValidation.js` e `stress_test.js`)  
**Target Platform**: Google Cloud Run (container backend com autoscaling gerenciado) e Firebase Hosting CDN (frontend SPA)  
**Project Type**: Web Application Fullstack (SPA + API REST)  
**Performance Goals**: Tempo de resposta de `/api/vote/status` < 50ms (p95 < 100ms); processamento de mais de 500 votos/s sem contenção de locks; 100% de disponibilidade sob 160 usuários simultâneos  
**Constraints**: Sigilo absoluto de voto (auditoria exibe apenas presença, sem candidato); respeito integral aos PRDs ([`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e [`DESIGN_SYSTEM_PRD.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md))  

---

## 3. Constitution Check & Governança SDD

*GATE: Verificação de aderência rigorosa às diretrizes de governança do [AGENTS.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/AGENTS.md).*

1. **A Especificação é a Única Fonte da Verdade (SSOT)?**  
   Sim. O [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md#L175-L180) foi atualizado previamente no Passo 1 (`/speckit-specify`), formalizando as diretrizes de leitura pontual de voto, cache de configuração e tolerância estendida GSI.
2. **Proibição de Suposições?**  
   Sim. Todas as melhorias foram originadas de dados empíricos obtidos na análise de estresse e no log do Cloud Run (onde chamadas ao status atingiram 903ms devido a `getVotes()`).
3. **Padrão de Versionamento Git?**  
   Sim. Branch oficial: `antigravity-009/feat-blindagem-concorrencia-dia-d`. Commits formatados em Markdown com contexto, o que foi feito e o porquê.
4. **Ponto de Parada Obrigatório (Passo 4)?**  
   Sim. Após o término deste plano, será executado o Passo 3 (`/speckit-tasks`) para gerar o arquivo `tasks.md`. O agente **parará obrigatoriamente** ao final do Passo 3 e aguardará autorização expressa do usuário antes de realizar qualquer alteração de código.

---

## 4. Project Structure

### Documentation (this feature)

```text
specs/009-blindagem-concorrencia-dia-d/
├── plan.md              # Este plano de implementação técnica
├── research.md          # Decisões de Phase 0 (leitura pontual, cache config, tolerância GSI, rate limit)
├── data-model.md        # Modelos de dados, estruturas de cache e máquina de estados
├── contracts/           # Contratos de interfaces
│   └── api-contracts.md # Contratos das rotas /vote/status, /auth/google e /admin/status
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
├── quickstart.md        # Roteiro de validação ponta a ponta e testes de concorrência
└── tasks.md             # Tarefas atomizadas (a ser gerado no Passo 3: /speckit-tasks)
```

### Source Code Impactado (na fase de implementação autorizada)

```text
server/
├── db.js                # Implementação de getVoteByEmail, cache de configuração e invalidateConfigCache
├── index.js             # Inclusão de /auth/google no skip do globalApiLimiter
├── routes/
│   ├── vote.js          # Uso de getVoteByEmail em GET /status no lugar de getVotes()
│   └── admin.js         # Invalidação imediata do cache de configuração em POST /status
└── scripts/
    └── testValidation.js # Atualização da bateria de testes para cobrir consulta pontual e rate limit

client/src/
└── pages/
    └── LoginPage.jsx    # Extensão do timeout do Google Identity Services para 15 segundos (150 iterações)
```

---

## 5. Fases de Execução do Plano

### Fase 0: Pesquisa e Decisões Técnicas (Concluída)
- [x] Análise empírica do log de requisições do Cloud Run e diagnóstico de varredura no Firestore;
- [x] Consolidação das 4 decisões técnicas essenciais em [`research.md`](./research.md).

### Fase 1: Arquitetura, Modelos, Contratos e Roteiro de Testes (Concluída)
- [x] Modelagem de estruturas de cache e entidades pontuais em [`data-model.md`](./data-model.md);
- [x] Formalização dos contratos de API e interfaces em [`contracts/api-contracts.md`](./contracts/api-contracts.md);
- [x] Roteiro prático de validação automatizada e teste de estresse em [`quickstart.md`](./quickstart.md).

### Fase 2: Geração de Tarefas Atomizadas (Passo 3: `/speckit-tasks`)
- [ ] Executar `/speckit-tasks` para gerar o arquivo `tasks.md` contendo tarefas ordenadas por dependência com critérios de aceite detalhados;
- [ ] **Ponto de Parada Obrigatório**: Parar imediatamente após gerar `tasks.md` e aguardar autorização expressa do usuário antes de codificar.
