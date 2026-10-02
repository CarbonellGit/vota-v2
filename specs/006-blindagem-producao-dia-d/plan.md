# Implementation Plan: 006 - Blindagem de Produção e Estabilidade para o Dia da Votação

**Branch**: `antigravity-006/fix-blindagem-producao-dia-d` | **Date**: 2026-09-28 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/006-blindagem-producao-dia-d/spec.md)  
**Input**: Especificação funcional da feature de blindagem para o dia da festa do Colégio Carbonell.

---

## Summary

O objetivo deste plano é blindar a infraestrutura e os fluxos de usuário da aplicação contra os principais gargalos operacionais no dia do evento ao vivo:
1. **Desacoplamento do Rate Limiter de IP:** Isenção da rota de polling leve `/api/vote/status` do limitador por IP, garantindo que mais de 160 smartphones no mesmo Wi-Fi não recebam erro 429.
2. **Resiliência no Carregamento do SDK Google (GSI):** Implementação de polling com feedback visual no modal de login para evitar telas em branco em conexões móveis (4G/3G) oscilantes.
3. **Validade de Sessão de 24 Horas & Auto-Recovery:** Aumento do tempo de vida do JWT para 24h e interceptor defensivo no cliente para reabertura automática de login em caso de 401.
4. **Alta Disponibilidade e Zero Cold-Start:** Atualização do script de deploy para Cloud Run com `--min-instances 1` na noite do evento.

---

## Technical Context

**Language/Version**: Node.js v18+ (Backend Express 5), JavaScript ESModules / React 19 (Frontend Vite 8)  
**Primary Dependencies**: `express`, `express-rate-limit`, `jsonwebtoken`, `google-auth-library`, `lucide-react`, `tailwindcss`  
**Storage**: Google Cloud Firestore (modo Nativo em São Paulo `southamerica-east1`) com transações atômicas  
**Testing**: Bateria automatizada de testes (`server/scripts/testValidation.js`), linter `oxlint`, build Vite  
**Target Platform**: Google Cloud Run (Backend) + Firebase Hosting CDN (Frontend & Fotos)  
**Project Type**: Web Application Mobile-First com painel de apuração e modo Telão  
**Performance Goals**: Suporte a 160 colaboradores simultâneos na mesma rede Wi-Fi, latência < 1s no pico de votação  
**Constraints**: Sigilo absoluto de voto mantido, 100% de conformidade com [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e [DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md)  
**Scale/Scope**: 161 participantes cadastrados, 4 administradores autorizados com RBAC restrito  

---

## Constitution Check

*GATE: Diretrizes do projeto e conformidade com AGENTS.md e PRD_Final.md*

- [x] **SSOT Respeitada:** O [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) foi previamente atualizado antes de qualquer linha de código ou especificação.
- [x] **Identidade Visual:** Nenhuma alteração visual viola os tokens institucionais Carbonell (proibição de emojis genéricos, ícones exclusivamente Lucide SVG).
- [x] **Fluxo Sequencial:** Cumprimento rigoroso do passo a passo (Specify -> Plan -> Tasks -> Ponto de Parada -> Implement).
- [x] **Sem Suposições:** Todas as decisões técnicas foram documentadas e respaldadas nas necessidades do evento.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-blindagem-producao-dia-d/
├── plan.md              # Plano técnico de implementação (este documento)
├── research.md          # Decisões arquiteturais e justificativas técnicas
├── data-model.md        # Entidades, lifecycle de sessão e transições de estado
├── contracts/           # Contratos das APIs REST (status, auth e vote)
├── quickstart.md        # Roteiro de validação e comandos de teste
└── checklists/
    └── requirements.md  # Checklist de validação de qualidade
```

### Source Code Impacted

```text
server/
├── index.js             # Isenção de /api/vote/status e /api/health do rate limit por IP
├── routes/
│   ├── auth.js          # Emissão de JWT com expiração de 24 horas (expiresIn: '24h')
│   └── vote.js          # Manutenção de submitVoteLimiter indexado por req.user.email
└── scripts/
    └── testValidation.js # Adição de testes de concorrência e validação de token 24h

client/
├── src/
│   ├── api.js           # Interceptor de status HTTP 401 com auto-recovery e limpeza de sessão
│   ├── App.jsx          # Tratamento de logout defensivo e sincronização
│   └── components/
│       └── LoginModal.jsx # Polling resiliente (100ms até 4s) com feedback visual do Google GSI

package.json             # Ajuste de deploy com --min-instances 1 para zero cold start
```

---

## Complexity Tracking

Nenhuma complexidade adicional desnecessária foi introduzida. A arquitetura mantém-se leve, serverless e focada em resiliência operacional.
