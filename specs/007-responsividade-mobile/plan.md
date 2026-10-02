# Implementation Plan: Otimização de Responsividade e Experiência Mobile

**Branch**: `antigravity-007/feat-responsividade-mobile` | **Date**: 2026-09-28 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/007-responsividade-mobile/spec.md)

**Input**: Feature specification from `/specs/007-responsividade-mobile/spec.md`

---

## 1. Summary

Ajustar e blindar a responsividade da aplicação web para uso predominante em smartphones (360px a 430px de largura) durante a festa de confraternização do Colégio Carbonell. As melhorias englobam:
1. Fotos nítidas e enquadramento facial com `object-cover` nos cards dos participantes;
2. Desobstrução total do rosto posicionando a etiqueta da fantasia abaixo do nome e departamento;
3. Eliminação do auto-zoom no Safari iOS com tipografia `16px` no campo de busca e inclusão de botão 'X' de limpeza rápida;
4. Otimização da barra de navegação no mobile sem redundâncias para não-administradores e correção de sobreposição de status;
5. Resiliência de modais (`VoteModal`, `LoginModal`) com limite de altura (`90dvh`) e rolagem interna;
6. Visualização do ranking de apuração em cards verticais no mobile para a comissão organizadora.

---

## 2. Technical Context

**Language/Version**: JavaScript (ES2022+), React 19.x  
**Primary Dependencies**: Vite 8.x, Tailwind CSS 4.x, Lucide React (ícones vetoriais SVG), Canvas-Confetti  
**Target Platform**: Mobile Web (iOS Safari, Android Chrome, telas de 360px a 430px de largura) e Desktop  
**Project Type**: Single Page Application (SPA) com roteamento interno e backend Node.js Express no Cloud Run  
**Performance Goals**: Tempo de renderização inicial < 1.5s em rede 4G; rolagem a 60fps na galeria de fotos; área de toque mínima de 44x44px  
**Constraints**: Zero emojis conforme `DESIGN_SYSTEM_PRD.md`; paleta institucional estrita (`#1e2a4d`, `#2b3a6c`, `#f7b53b`); zoom manual bloqueado via `user-scalable=no` (confirmado pelo usuário)  

---

## 3. Constitution Check & Governança SDD

*GATE: Verificação de aderência às diretrizes do projeto.*

1. **A Especificação é a Única Fonte da Verdade?** Sim, o [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e o [DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md) foram atualizados e commitados previamente no Passo 1 (`/speckit-specify`).
2. **Proibição de Suposições?** Sim, as 4 decisões de design (posicionamento da fantasia, botão da navbar no mobile, zoom manual e formato da apuração) foram clarificadas diretamente com o usuário antes de avançar.
3. **Padrão de Versionamento?** Sim, branch `antigravity-007/feat-responsividade-mobile` e commits atômicos com descrições detalhadas em Markdown.
4. **Ponto de Parada Obrigatório?** Sim, nenhum código dos componentes será alterado até a aprovação formal do plano e das tasks pelo usuário.

---

## 4. Project Structure

### Documentation (this feature)

```text
specs/007-responsividade-mobile/
├── plan.md              # Este plano de implementação
├── research.md          # Decisões de Phase 0 (auto-zoom iOS, object-cover, modais)
├── data-model.md        # Modelos de propriedades e breakpoints
├── contracts/           # Contratos de componentes UI
│   └── ui-contracts.md
├── quickstart.md        # Roteiro de validação nos viewports móveis
└── tasks.md             # Tarefas atomizadas (geradas no Passo 3: /speckit-tasks)
```

### Source Code Modificado (na fase de implementação autorizada)

```text
client/src/
├── components/
│   ├── Navbar.jsx           # Ocultação do botão redundante no mobile e ajuste de status
│   ├── CandidateCard.jsx    # object-cover, fantasia abaixo do nome, botão conciso "Trocar Voto"
│   ├── VoteModal.jsx        # max-h-[90dvh], overflow-y-auto, padding adaptativo
│   └── LoginModal.jsx       # max-h-[90dvh], overflow-y-auto, botão Google contido
└── pages/
    ├── VotingPage.jsx       # Busca 16px (sem auto-zoom iOS), botão 'X', toasts centralizados
    └── AdminPage.jsx        # Apuração em cards de ranking no mobile sem scroll horizontal
```

---

## 5. Fases de Execução do Plano

### Fase 0: Pesquisa e Decisões de Design (Concluído)
- [x] Resolução de todas as dúvidas de design com o usuário;
- [x] Elaboração de `research.md` com justificativas para auto-zoom, fotos e modais.

### Fase 1: Arquitetura e Contratos de Componentes (Concluído)
- [x] Definição de breakpoints e modelos de interface em `data-model.md`;
- [x] Elaboração dos contratos de UI em `contracts/ui-contracts.md`;
- [x] Elaboração do guia de testes e validação em `quickstart.md`.

### Fase 2: Geração de Tarefas Atomizadas (Passo 3: `/speckit-tasks`)
- [ ] Geração do arquivo `tasks.md` ordenado por dependências com critérios de aceite estritos.
- [ ] Ponto de parada obrigatório (aguardar `/speckit-implement`).
