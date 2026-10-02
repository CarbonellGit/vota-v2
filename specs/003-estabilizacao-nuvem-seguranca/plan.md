# Implementation Plan: Estabilização de Nuvem, FinOps e Segurança (003)

**Branch**: `antigravity-003/feat-estabilizacao-nuvem-seguranca` | **Date**: 2026-09-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-estabilizacao-nuvem-seguranca/spec.md`

---

## Summary

Implementar a camada de resiliência e segurança definitiva para o deploy em produção da aplicação no projeto GCP `vota-509520`. O plano abrange:
1. **Persistência em Nuvem (Google Cloud Firestore)**: Substituição do arquivo local `db.json` por coleções nativas no Firestore (`config`, `candidates`, `votes`), utilizando transações atômicas para garantir a integridade dos votos frente ao ciclo de vida efêmero e autoscaling do Cloud Run.
2. **Sigilo do Voto na Auditoria**: Desacoplamento da identidade do eleitor na apuração administrativa (`/api/admin/metrics`), preservando apenas lista de presença anônima.
3. **FinOps & Otimização de Imagens**: Criação de script de lote com `sharp` para redimensionar e compactar todas as fotos de 187 MB para menos de 7 MB (formato WebP/JPEG máx 500px) e inclusão de cabeçalhos de cache CDN.
4. **FinOps & Polling Eficiente**: Desacoplamento no React (`App.jsx`), buscando a lista de candidatos apenas na montagem inicial e limitando o polling ao status da eleição a cada 12 segundos.
5. **Hardening de Segurança**: Desativação obrigatória do endpoint `/api/auth/dev-login` em produção, verificação estrita de assinatura de ID Tokens do Google OAuth e inclusão de rate limiting contra flooding.

---

## Technical Context

**Language/Version**: Node.js v20 LTS (Alpine Linux no Cloud Run)  
**Primary Dependencies**: Express.js 5, `@google-cloud/firestore`, `google-auth-library`, `jsonwebtoken`, `express-rate-limit`, `sharp` (para processamento de imagens)  
**Storage**: Google Cloud Firestore (modo Nativo, região `southamerica-east1`), com cache local opcional de candidatos em memória no backend  
**Testing**: Scripts de validação de ponta a ponta e testes de carga concorrente descritos em [quickstart.md](./quickstart.md)  
**Target Platform**: Google Cloud Run (Backend API) + Firebase Hosting (Frontend SPA & CDN)  
**Project Type**: Web application (Fullstack: Node.js Express API + React 19 SPA)  
**Performance Goals**: < 10 MB transferidos na carga inicial de todas as fotos, tempo de resposta p95 < 250ms na API de votação sob 100 requisições simultâneas  
**Constraints**: Zero perda de votos por reinício de container, 0% de vazamento de voto nominal na administração, custo zero no Free Tier do Firestore  
**Scale/Scope**: ~161 participantes cadastrados, ~150 colaboradores votantes simultâneos  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio de Governança | Status | Justificativa / Verificação |
| :--- | :---: | :--- |
| **Idioma pt-BR** | ✅ Aprovado | Toda a documentação técnica, especificações e comentários de código em português brasileiro. |
| **Padrões de Branch e Commit** | ✅ Aprovado | Branch `antigravity-003/feat-estabilizacao-nuvem-seguranca` segue estritamente `<agente>-<numero-da-spec>/<prefixo>-<descricao>`. |
| **A Especificação é a SSOT** | ✅ Aprovado | [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) foi atualizado previamente com o RF14 e a seção 7.1 antes da escrita do plano. |
| **Proibido Fazer Suposições** | ✅ Aprovado | Três decisões críticas (sigilo do voto, Firestore e otimização local de fotos) foram validadas diretamente com o usuário. |
| **Fluxo Sequencial do Speckit** | ✅ Aprovado | Passo 1 (`spec.md`) concluído, Passo 2 (`plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`) executado sem pular para implementação de código. |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-estabilizacao-nuvem-seguranca/
├── spec.md              # Especificação funcional aprovada
├── plan.md              # Este plano técnico de implementação
├── research.md          # Pesquisa técnica (Firestore, Sharp, Polling e Hardening)
├── data-model.md        # Esquema das coleções do Firestore e transições de estado
├── quickstart.md        # Roteiro de validação prática de ponta a ponta
├── contracts/
│   └── api-contracts.md # Contratos das APIs de voto, status, auditoria e auth
└── checklists/
    └── requirements.md  # Validação de qualidade dos requisitos
```

### Source Code Layout

```text
votacao-confra/
├── PRD_Final.md                  # SSOT atualizado com as novas regras
├── package.json                  # Scripts gerais de orquestração
├── server/
│   ├── package.json              # Adição de @google-cloud/firestore, express-rate-limit, sharp
│   ├── index.js                  # Inicialização, rate limit e headers de cache para fotos
│   ├── firestore.js              # Cliente Firestore com inicialização automática (ADC)
│   ├── db.js                     # Camada de abstração e sincronização com fallback
│   ├── scripts/
│   │   └── optimizePhotos.js     # Script em lote para compactação e redimensionamento das fotos
│   ├── services/
│   │   └── candidateSync.js      # Sincronização inteligente com hash MD5 de ID
│   └── routes/
│       ├── auth.js               # Bloqueio de dev-login em produção e validação estrita Google
│       ├── vote.js               # Votação com transações atômicas no Firestore
│       └── admin.js              # Métricas e apuração anônima (sigilo do voto)
└── client/
    └── src/
        ├── App.jsx               # Desacoplamento de polling (candidatos 1x, status a cada 12s)
        ├── api.js                # Interceptor de chamadas
        └── pages/
            └── AdminPage.jsx     # Ajuste na tabela de auditoria para exibir apenas presença
```

**Structure Decision**: Aplicação web com separação clara de responsabilidades entre backend Node.js (camada de dados e API protegida) e frontend React (interface institucional e consumo otimizado de recursos).

---

## Complexity Tracking

| Decisão Arquitetural | Por que é necessária | Alternativa mais simples rejeitada porque |
| :--- | :--- | :--- |
| **Migração para Google Cloud Firestore** | O Cloud Run opera sobre instâncias efêmeras sem persistência local garantida. | Arquivo `db.json` perde todos os votos ao reiniciar o container ou escalar para múltiplas instâncias. |
| **Pré-processamento estático de imagens em lote** | 187 MB de fotos consomem mais de 15 GB de banda e travam conexões móveis. | Redimensionamento sob demanda via microsserviço de terceiros adicionaria latência e custos desnecessários. |
| **Desacoplamento de Polling no Frontend** | 150 colaboradores baixando 25 KB a cada 5 segundos geram sobrecarga e tráfego desnecessário. | Polling unificado consome CPU contínua do Cloud Run para dados estáticos que não mudam. |
