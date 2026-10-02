# Plano Técnico de Implementação: Mudança de Identidade Visual

**Branch**: `antigravity-001/feat-identidade-visual` | **Data**: 2026-09-18 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/001-identidade-visual/spec.md)  
**Input**: Feature specification de `/specs/001-identidade-visual/spec.md`  

---

## 1. Sumário Executivo

Substituir o tema escuro genérico do Sistema de Votação pela identidade visual oficial e Design System institucional do Colégio Carbonell (portado do projeto LMS). A aplicação adotará um layout *clean/light* com fundo cinza claro (`#f8fafc`) e cartões brancos para a experiência móvel dos colaboradores e gestores, reservando uma versão cinematográfica em Azul Marinho Profundo (`#0f172a` a `#1e2a4d`) e Ouro (`#f7b53b`) para a tela de Revelação dos Vencedores (Modo Telão). Todos os logotipos oficiais (`logo-fundo-branco.png`, `logo-fundo-azul.png` e `logo3.png`) e ícones vetoriais SVG (`lucide-react`) serão integrados, com eliminação irrestrita de emojis em toda a interface.

---

## 2. Contexto Técnico

* **Linguagem / Runtime**: JavaScript (ES Modules), Node.js (v20+).
* **Framework Frontend**: React 19 (`react@19.2.8`, `react-dom@19.2.8`).
* **Estilização / Engine CSS**: Tailwind CSS v4 (`@tailwindcss/vite@4.3.3`, `tailwindcss@4.3.3`).
* **Biblioteca de Ícones**: `lucide-react@1.47.0` (padronização vetorial exclusiva).
* **Efeitos de Animação**: `canvas-confetti@1.9.4` (celebração do pódio no telão).
* **Build Tool / Bundler**: Vite 8 (`vite@8.3.0`).
* **Backend API**: Node.js / Express (sem impacto estrutural de regras de negócio, apenas consumo estático dos assets).
* **Plataforma Alvo**: Web Mobile-First (responsivo para 360px a 430px nos celulares dos funcionários e 1080p/4K para o Modo Telão).
* **Acessibilidade**: Contraste mínimo WCAG AA (4.5:1 para texto normal e 3:1 para elementos de interface destacados).

---

## 3. Constitution Check (Conformidade com AGENTS.md)

*GATE: Validação obrigatória dos princípios de governança do projeto.*

| Princípio de Governança | Status | Verificação |
| :--- | :---: | :--- |
| **Idioma pt-BR** | ✅ Aprovado | Toda a documentação, comentários e mensagens ao usuário estão estritamente em português brasileiro. |
| **Padrões de Branch e Commit** | ✅ Aprovado | Branch `antigravity-001/feat-identidade-visual` criada e commits com corpo estruturado em Markdown PT-BR. |
| **Single Source of Truth (PRD e Design System)** | ✅ Aprovado | `DESIGN_SYSTEM_PRD.md` e `PRD_Final.md` criados e aprovados antes de qualquer modificação de código da interface. |
| **Proibido Fazer Suposições** | ✅ Aprovado | As opções de fundo escuro para o telão e manutenção de confetes foram previamente submetidas e aprovadas pelo usuário. |
| **Workflow Sequencial do Speckit** | ✅ Aprovado | Execução estrita do Passo 1 (`/speckit-specify`) e agora no Passo 2 (`/speckit-plan`), sem codificar nada antes de `tasks.md` e autorização do usuário. |

---

## 4. Estrutura do Projeto e Arquivos Afetados

### Documentação e Especificação
```text
specs/001-identidade-visual/
├── spec.md              # Especificação funcional aprovada
├── checklists/
│   └── requirements.md  # Checklist de qualidade de requisitos
├── plan.md              # Este plano técnico de implementação
├── research.md          # Pesquisa técnica sobre tokens Tailwind v4 e ícones
├── data-model.md        # Modelo conceitual de temas, tokens e assets
├── quickstart.md        # Roteiro de validação de ponta a ponta
├── contracts/
│   └── ui-tokens.json   # Contrato formal de tokens e componentes
└── tasks.md             # Tarefas detalhadas (geradas no próximo passo: /speckit-tasks)
```

### Arquivos de Código Fonte Envolvidos na Implementação
```text
client/
├── index.html                        # Atualização de title e favicon para logo3.png
├── public/
│   └── images/                       # Logotipos oficiais importados do LMS
│       ├── logo-fundo-azul.png       # Logo para fundos escuros (Telão)
│       ├── logo-fundo-branco.png     # Logo para fundos claros (Navbar e Modais)
│       └── logo3.png                 # Isotipo para favicon da aba
├── src/
│   ├── index.css                     # Configuração dos tokens @theme Carbonell no Tailwind v4
│   ├── App.jsx                       # Adaptação do container global para fundo claro
│   ├── components/
│   │   ├── Navbar.jsx                # Logotipo claro, badge de status e remoção de emojis
│   │   ├── CandidateCard.jsx         # Card branco, borda de voto ouro (#f7b53b) e ícones Lucide
│   │   ├── VoteModal.jsx             # Modal branco institucional e botões na paleta Carbonell
│   │   └── LoginModal.jsx            # Modal com logotipo e domínio institucional limpo
│   └── pages/
│       ├── VotingPage.jsx            # Barra de busca clara e layout responsivo
│       ├── AdminPage.jsx             # Métricas limpas em cards brancos e botões institucionais
│       └── RevealPage.jsx            # Modo Telão em Azul Marinho/Ouro, logo escuro e pódio vetorial
```

---

## 5. Rastreamento de Complexidade

Nenhuma violação ou desvio arquitetural identificado. A implementação utiliza exclusivamente os recursos nativos do Tailwind v4 (`@theme`), React e `lucide-react` já instalados no projeto, sem necessidade de novas dependências externas.
