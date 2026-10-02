# Implementation Plan: Suporte a Empates Múltiplos no Pódio (Dense Ranking) e Correção de Navegação Mobile (Logout sem Scroll)

**Branch**: `antigravity-010/feat-empates-podio-mobile-navbar` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Suporte a empates com exibição dividida nos 3 degraus do pódio (Dense Ranking) e correção do botão de logout no mobile sem rolagem horizontal.

---

## 1. Summary

Implementar as adaptações arquiteturais e de interface para atender aos dois objetivos definidos pelo usuário e formalizados no [`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md):
1. **Classificação Densa (*Dense Ranking*) e Pódio com Empates Divididos:**
   - No backend ([`server/routes/admin.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/routes/admin.js)), substituir a ordenação provisória alfabética por *Dense Ranking*, agrupando todos os candidatos com a maior pontuação no 1º lugar, a segunda maior no 2º lugar e a terceira no 3º lugar, populando as coleções `podium.first`, `podium.second` e `podium.third`.
   - No telão ([`client/src/pages/RevealPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/RevealPage.jsx)), construir container adaptativo para cada degrau capaz de renderizar vencedores individuais ou múltiplos empatados lado a lado, com fotos proporcionais, nomes, trajes, badge de empate e efeitos sonoros/confetes simultâneos.
   - No painel administrativo ([`client/src/pages/AdminPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/AdminPage.jsx)), exibir a mesma medalha/número de colocação para colaboradores com a mesma pontuação.
2. **Navegação Mobile sem Transbordamento (Botão de Sair 100% Visível):**
   - Na barra de navegação ([`client/src/components/Navbar.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/components/Navbar.jsx)), garantir que o cabeçalho superior mantenha o logotipo e o conjunto Avatar + Botão "Sair" fixos e visíveis à direita no mobile (< 640px) sem qualquer overflow.
   - Mover as abas de alternância de administração ("Votação", "Admin", "Telão") no mobile para uma sub-barra de abas compacta logo abaixo da barra superior.
   - Adicionar contenção estrita `overflow-x-hidden` no [`client/src/App.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/App.jsx) e em [`client/src/index.css`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/index.css).

---

## 2. Technical Context

**Language/Version**: JavaScript (ES2022+ / CommonJS no server, ES Modules no client), Node.js 20+, React 19.x  
**Primary Dependencies**: Express 5.x, React 19.x, Vite 8.x, Tailwind CSS 4.x, Lucide React, Canvas-Confetti  
**Storage**: Google Cloud Firestore (persistência) e agregação em memória no endpoint `/api/admin/metrics`  
**Testing**: Scripts de validação e simulação de ranking / testes manuais em viewport móvel (360px - 414px)  
**Target Platform**: Navegadores modernos (Desktop e Mobile-first no iOS Safari / Chrome Android)  
**Project Type**: Web Application Fullstack (SPA + API REST)  
**Performance Goals**: Renderização suave a 60fps das animações do telão com múltiplos participantes; zero layout shift na navbar mobile  
**Constraints**: Respeito estrito aos PRDs ([`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e [`DESIGN_SYSTEM_PRD.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md)); sigilo total do voto; ausência de emojis  

---

## 3. Constitution Check & Governança SDD

*GATE: Verificação de conformidade com as diretrizes de [AGENTS.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/AGENTS.md).*

1. **A Especificação é a Única Fonte da Verdade (SSOT)?**  
   Sim. [`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e [`DESIGN_SYSTEM_PRD.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md) foram previamente atualizados no Passo 1, incorporando os critérios de empate e a sub-barra da navbar.
2. **Proibição de Suposições?**  
   Sim. As perguntas sobre a regra de *Dense Ranking* (ex: 4 em 1º, 2 em 2º, 1 em 3º) e sobre o modelo de sub-barra da Navbar foram explicitamente formuladas e validadas pelo usuário antes da escrita do plano.
3. **Padrão de Versionamento Git?**  
   Sim. Branch ativa: `antigravity-010/feat-empates-podio-mobile-navbar`. Commits descritivos em Markdown em PT-BR.
4. **Ponto de Parada Obrigatório (Passo 4)?**  
   Sim. Ao concluir o plano (`/speckit-plan`) e a geração de tarefas (`/speckit-tasks`), o agente **não deve codificar** sem autorização expressa do usuário.

---

## 4. Project Structure

### Documentation (this feature)

```text
specs/010-empates-podio-mobile-navbar/
├── plan.md              # Este plano de implementação técnica
├── research.md          # Decisões de Phase 0 (Dense Ranking, Layout do Pódio, Sub-barra Navbar, Overflow)
├── data-model.md        # Modelos de entidades, máquina de estados e contratos de dados
├── contracts/
│   └── api-contracts.md # Contratos da API /metrics e dos componentes Navbar e RevealPage
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação (aprovado)
├── quickstart.md        # Roteiro prático de validação e cenários ponta a ponta
└── tasks.md             # Tarefas atomizadas (a ser gerado no Passo 3: /speckit-tasks)
```

### Source Code Impactado (na fase de implementação autorizada)

```text
server/
└── routes/
    └── admin.js         # Cálculo de Dense Ranking e estruturação de podium.first, podium.second e podium.third

client/src/
├── App.jsx              # Blindagem de container com overflow-x-hidden
├── index.css            # Regra global de overflow-x-hidden no body
├── components/
│   └── Navbar.jsx       # Layout responsivo com sub-barra de administração e botão Sair fixo
└── pages/
    ├── RevealPage.jsx   # Degraus adaptativos com suporte a múltiplos participantes empatados
    └── AdminPage.jsx    # Alinhamento das medalhas e colocação de empate na apuração
```

---

## 5. Fases de Execução do Plano

### Fase 0: Pesquisa e Decisões Técnicas (Concluída)
- [x] Definição do algoritmo de *Dense Ranking* em [`research.md`](./research.md);
- [x] Definição do layout adaptativo do pódio e da sub-barra de administração mobile.

### Fase 1: Arquitetura, Modelos, Contratos e Roteiro de Testes (Concluída)
- [x] Modelagem de estruturas de dados e contratos de pódio em [`data-model.md`](./data-model.md);
- [x] Formalização dos contratos de API e componentes em [`contracts/api-contracts.md`](./contracts/api-contracts.md);
- [x] Elaboração do guia prático de testes e validação em [`quickstart.md`](./quickstart.md).

### Fase 2: Geração de Tarefas Atomizadas (Passo 3: `/speckit-tasks`)
- [ ] Executar `/speckit-tasks` para gerar o arquivo `tasks.md` estruturado com critérios de aceite detalhados;
- [ ] **Ponto de Parada Obrigatório**: Parar imediatamente após gerar `tasks.md` e aguardar autorização expressa do usuário antes de iniciar qualquer codificação.
