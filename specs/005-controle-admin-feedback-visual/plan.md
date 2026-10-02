# Implementation Plan: Controle de Acesso Restrito (Admin & Telão), Feedback Visual de Loading e Padronização de Interface

**Branch**: `antigravity-005/feat-controle-admin-feedback-visual` | **Date**: 2026-09-25 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/005-controle-admin-feedback-visual/spec.md)

---

## 1. Summary

Este plano estabelece as intervenções técnicas necessárias para atender às solicitações do usuário e aos requisitos de produto/design system da Feature 005:
1. **RBAC Estrito para Painel Admin e Modo Telão**: Limitar as permissões de administração exclusivamente aos 4 e-mails autorizados (`thiago.luiz@colegiocarbonell.com.br`, `patricia.santos@colegiocarbonell.com.br`, `marina.ribeiro@colegiocarbonell.com.br`, `raquel.favatto@colegiocarbonell.com.br`), garantindo que todos os demais colaboradores não visualizem as abas de Admin e Telão na `Navbar` e recebam HTTP 403 em endpoints protegidos da API.
2. **Feedback Visual Animado (Loading States)**: Implementar controle granular de estado de ação assíncrona (`pendingAction`) nos botões de controle de status ("Aguardando", "Abrir Votação", "Encerrar Votação") em `AdminPage.jsx`, exibindo o componente `<Loader2 className="w-4 h-4 animate-spin" />` de `lucide-react` no botão em processamento e desabilitando cliques concorrentes.
3. **Título Principal em Cor Única Sólida**: Padronizar o título da página de votação (`VotingPage.jsx`) para cor única sólida institucional Azul Marinho (`#1e2a4d`), removendo o estilo bicolor/degradê.
4. **Varredura e Banimento de Emojis**: Garantir a ausência total de emojis na interface e logs, assegurando uso estrito de ícones SVG da biblioteca `lucide-react`.

---

## 2. Technical Context

* **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React (`Loader2`, `Shield`, `Tv`, `CheckCircle2`, `AlertTriangle`, `X`, etc.).
* **Backend**: Node.js 20, Express 5, `@google-cloud/firestore`, `google-auth-library`, `jsonwebtoken`.
* **Banco de Dados**: Google Cloud Firestore (Modo Nativo) e fallback em memória `memoryStore` para testes locais.
* **Hospedagem & Nuvem**: Google Cloud Run + Firebase Hosting (`vota-509520`).
* **Metas de Desempenho e UX**:
  * Resposta imediata (<100ms) de feedback visual (spinner) ao clicar em qualquer botão de ação administrativa.
  * Ocultação no DOM das abas de administração para 100% dos usuários não autorizados.
  * Zero falhas de autorização por inconsistência de caixa alta/baixa de e-mail.

---

## 3. Constitution & Governance Check

* **Regra 1 (Single Source of Truth):** [`PRD_Final.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) e [`DESIGN_SYSTEM_PRD.md`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md) foram atualizados previamente no Passo 1 e refletem os requisitos da feature.
* **Regra 2 (Identidade Visual Carbonell):** Cores institucionais sólidas (`#1e2a4d`, `#2b3a6c`, `#f7b53b`) preservadas, com eliminação de degradês no texto e uso de componentes Lucide React.
* **Regra 3 (Fluxo Obrigatório do Speckit):** Este plano encerra o Passo 2 (`/speckit-plan`). O agente DEVE parar e sugerir a execução do Passo 3 (`/speckit-tasks`) sem codificar.

---

## 4. Project Structure & Artifacts

### 4.1 Documentação da Feature
```text
specs/005-controle-admin-feedback-visual/
├── spec.md              # Especificação funcional aprovada
├── plan.md              # Este plano de implementação
├── research.md          # Decisões técnicas e arquitetura
├── data-model.md        # Modelos de autorização e estados de UI
├── quickstart.md        # Roteiro de testes de validação
├── contracts/
│   └── api-contracts.md # Contratos de endpoints REST
└── checklists/
    └── requirements.md  # Checklist de qualidade de requisitos
```

### 4.2 Arquivos de Código Afetados
```text
votacao-confra/
├── server/
│   ├── .env                           # Atualização de ADMIN_EMAILS
│   ├── .env.example                   # Atualização de ADMIN_EMAILS de exemplo
│   ├── db.js                          # defaultDb.config.adminEmails com os 4 colaboradores
│   ├── routes/
│   │   └── auth.js                    # Normalização rigorosa e lista oficial de administradores
│   └── scripts/
│       └── testValidation.js          # Atualização dos testes automatizados de autorização
└── client/
    └── src/
        ├── App.jsx                    # Bloqueio de renderização de abas admin/reveal se !user?.isAdmin
        ├── components/
        │   ├── Navbar.jsx             # Preservação de user?.isAdmin para abas Admin e Telão
        │   └── LoginModal.jsx         # Ajuste dos presets de teste local (DEV) com a lista correta
        └── pages/
            ├── VotingPage.jsx         # Título "Votação da Melhor Fantasia" em cor única sólida (#1e2a4d)
            └── AdminPage.jsx          # Estado pendingAction com spinner <Loader2 animate-spin /> nos botões
```

---

## 5. Estratégia de Implementação e Fases

### Fase 1: Backend & Camada de Autorização (RBAC)
1. Atualizar as variáveis de ambiente `ADMIN_EMAILS` em `server/.env` e `server/.env.example` com os 4 e-mails oficiais.
2. Atualizar a lista padrão em `server/db.js` (`defaultDb.config.adminEmails`) e garantir atualização do documento no Firestore se aplicável.
3. Atualizar a lógica de `isUserAdmin` em `server/routes/auth.js` garantindo normalização estrita (`toLowerCase().trim()`).
4. Atualizar os testes automatizados em `server/scripts/testValidation.js` para validar a nova lista de permissões.

### Fase 2: Feedback Visual e Loading na AdminPage (Frontend)
1. Importar `Loader2` de `lucide-react` em `client/src/pages/AdminPage.jsx`.
2. Adicionar o estado `pendingAction` substituindo o booleano simples `actionLoading`.
3. Atualizar a função `handleStatusChange(newStatus)` para marcar `pendingAction = \`status-\${newStatus}\`` durante o processamento assíncrono.
4. Renderizar o spinner `<Loader2 className="w-4 h-4 animate-spin" />` no botão clicado quando sua ação estiver pendente, mantendo todos os botões desabilitados.
5. Substituir o caractere `"✕"` do botão de fechar toast pelo componente `<X className="w-4 h-4" />` de `lucide-react`.

### Fase 3: Padronização Visual & Remoção de Degradê (Frontend)
1. No arquivo `client/src/pages/VotingPage.jsx`, alterar o elemento `h1` para exibir "Votação da Melhor Fantasia" inteiramente em cor única sólida `text-[#1e2a4d]`, removendo o `<span>` com `text-[#2b3a6c]`.
2. Em `client/src/components/LoginModal.jsx`, atualizar os presets de desenvolvimento local (DEV) para usar a lista oficial de administradores.
3. Realizar auditoria e certificar a ausência completa de caracteres emoji em todo o código frontend.

### Fase 4: Validação & Testes Integrados
1. Executar a bateria de testes automatizados com `node server/scripts/testValidation.js`.
2. Realizar testes manuais de sessão de colaborador comum vs administrador.
3. Verificar a responsividade mobile e a fluidez das animações de loading.
