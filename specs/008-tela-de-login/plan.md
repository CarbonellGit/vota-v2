# Implementation Plan: Tela de Login Antecedente Obrigatória e Bloqueio de Acesso a Fotos (Padrão cv-face)

**Branch**: `antigravity-008/feat-tela-de-login` | **Date**: 2026-09-29 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/008-tela-de-login/spec.md)

**Input**: Solicitação do usuário para criar uma tela de login antecendendo as fotos dos colaboradores para que nenhum usuário veja as fotos antes de autenticar, no mesmo padrão visual do projeto `C:\Users\thiago.luiz\Desktop\Desenvolvimento\cv-face`.

---

## 1. Summary

Implementar a barreira de segurança e privacidade (gating) para a aplicação de votação, impedindo terminantemente que fotos ou nomes dos participantes sejam expostos antes do login:
1. **Frontend (`LoginPage.jsx`)**: Criação de um componente de página inteira centralizado, espelhado no padrão estrutural e visual do projeto `cv-face` (`.login-container`, logotipo oficial `logo-fundo-branco.png` / `logo2.png` com largura contida até 200px, título sólido em azul marinho `#1e2a4d`, instrução para uso de conta `@colegiocarbonell.com.br`, botão Google Sign-In via GSI e atalhos DEV locais);
2. **Roteamento Raiz (`App.jsx`)**: Condicionar a montagem da `Navbar`, da galeria de votação (`VotingPage`), das abas administrativas e do rodapé estritamente à presença de usuário autenticado (`user !== null`). Se deslogado, a aplicação renderiza unicamente a `LoginPage`;
3. **Carregamento Sob Demanda de Fotos**: Desacoplar a requisição `fetchCandidates()` da inicialização anônima e vinculá-la ao momento pós-login; ao deslogar ou expirar a sessão, descarregar a lista de candidatos e fotos da memória do estado React;
4. **Blindagem Backend (`server/routes/vote.js`)**: Aplicar `authMiddleware` na rota `GET /api/vote/candidates` para rejeitar requisições diretas anônimas com status HTTP 401.

---

## 2. Technical Context

**Language/Version**: JavaScript (ES2022+), React 19.x, Node.js 20+  
**Primary Dependencies**: Vite 8.x, Tailwind CSS 4.x, Lucide React (ícones vetoriais SVG), Express, JSON Web Token (`jsonwebtoken`)  
**Target Platform**: Mobile Web (smartphones iOS Safari e Android Chrome de 360px a 430px) e Desktop  
**Project Type**: Single Page Application (SPA) React com API REST Express  
**Performance Goals**: Tempo de renderização da tela de login < 1s; transição para votação pós-autenticação < 1.5s; retorno imediato ao deslogar (< 200ms)  
**Constraints**: Zero emojis conforme `DESIGN_SYSTEM_PRD.md`; paleta institucional estrita Carbonell (`#1e2a4d`, `#2b3a6c`, `#f7b53b`, `#f8fafc`); padrão visual do projeto `cv-face`  

---

## 3. Constitution Check & Governança SDD

*GATE: Verificação de aderência rigorosa às diretrizes de governança do [AGENTS.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/AGENTS.md).*

1. **A Especificação é a Única Fonte da Verdade (SSOT)?**  
   Sim. O [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) (requisito `RF03.1` e fluxo Mermaid) e o [DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md) (seção `3.6`) foram atualizados e commitados no Passo 1 (`/speckit-specify`) antes de qualquer planejamento técnico ou linha de código.
2. **Proibição de Suposições?**  
   Sim. Todas as características da tela foram extraídas diretamente do projeto de referência `C:\Users\thiago.luiz\Desktop\Desenvolvimento\cv-face` (`login.html` e `style.css`), confirmando dimensões do logo, tipografia, mensagens e cores.
3. **Padrão de Versionamento Git?**  
   Sim. Branch oficial criada: `antigravity-008/feat-tela-de-login`. Commits atômicos documentados com corpo descritivo detalhado em Markdown em português brasileiro.
4. **Ponto de Parada Obrigatório (Passo 4)?**  
   Sim. Ao término do plano técnico, o agente irá gerar o `tasks.md` no Passo 3 e **PARAR OBRIGATORIAMENTE** para aguardar autorização expressa do usuário antes de iniciar qualquer codificação no Passo 5.

---

## 4. Project Structure

### Documentation (this feature)

```text
specs/008-tela-de-login/
├── plan.md              # Este plano de implementação técnica
├── research.md          # Decisões de Phase 0 (arquitetura de gating, layout cv-face, proteção da API)
├── data-model.md        # Modelos de dados, estados e máquina de transições
├── contracts/           # Contratos de interfaces
│   └── auth-contracts.md # Contrato da API e props dos componentes
├── checklists/
│   └── requirements.md  # Checklist de qualidade da especificação
├── quickstart.md        # Roteiro prático de validação funcional e segurança
└── tasks.md             # Tarefas atomizadas (a ser gerado no Passo 3: /speckit-tasks)
```

### Source Code Impactado (na fase de implementação autorizada)

```text
server/
└── routes/
    └── vote.js              # Inclusão de authMiddleware na rota GET /api/vote/candidates

client/src/
├── App.jsx                  # Roteamento raiz declarativo (renderiza LoginPage se !user, descarrega candidatos no logout)
├── pages/
│   └── LoginPage.jsx        # Novo componente de página de login dedicada no padrão cv-face
└── components/
    └── LoginModal.jsx       # Descontinuação ou reaproveitamento interno apenas se necessário
```

---

## 5. Fases de Execução do Plano

### Fase 0: Pesquisa e Decisões Técnicas (Concluída)
- [x] Inspeção detalhada do projeto de referência `cv-face` (`login.html`, `style.css`, dimensões do logotipo);
- [x] Definição da arquitetura de gating em tela cheia e proteção backend em `research.md`.

### Fase 1: Arquitetura, Contratos e Roteiro de Validação (Concluída)
- [x] Modelagem de estados e ciclo de vida em `data-model.md`;
- [x] Formalização dos contratos de API e componentes em `contracts/auth-contracts.md`;
- [x] Elaboração do roteiro de validação passo a passo em `quickstart.md`.

### Fase 2: Geração de Tarefas Atomizadas (Passo 3: `/speckit-tasks`)
- [ ] Executar `/speckit-tasks` para gerar o arquivo `tasks.md` contendo tarefas ordenadas por dependência com critérios de aceite detalhados;
- [ ] Parar obrigatoriamente e aguardar autorização expressa do usuário antes de codificar.
