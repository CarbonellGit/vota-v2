# Research & Decisões Técnicas: Controle de Acesso Restrito (Admin & Telão), Feedback Visual de Loading e Padronização de Interface

**Feature**: `005-controle-admin-feedback-visual`  
**Data**: 2026-09-25  
**Status**: Concluído / Aprovado  

---

## 1. Problemas Identificados & Objetivos de Engenharia

### 1.1 Controle de Acesso e Exposição Indevida de Abas de Administração e Telão
* **Diagnóstico**: No backend ([server/routes/auth.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/routes/auth.js) e [server/db.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/db.js)), a lista padrão de administradores continha e-mails genéricos de desenvolvimento (`admin@colegiocarbonell.com.br`, `diretoria@colegiocarbonell.com.br`, `thiago.luiz@colegiocarbonell.com.br`). Além disso, o documento `app_state` no Firestore mantinha essa lista antiga. 
* **Decisão Arquitetural**:
  * Centralizar os 4 e-mails autorizados em uma constante institucional normalizada (`ADMIN_EMAILS`):
    1. `thiago.luiz@colegiocarbonell.com.br`
    2. `patricia.santos@colegiocarbonell.com.br`
    3. `marina.ribeiro@colegiocarbonell.com.br`
    4. `raquel.favatto@colegiocarbonell.com.br`
  * Atualizar a configuração persistida no Firestore (`config/app_state`) e no `.env`/`db.js`.
  * Garantir que a função `isUserAdmin` execute normalização minuciosa (`toLowerCase().trim()`) e rejeite qualquer e-mail não pertencente a essa lista.
  * No frontend, a `Navbar` já avalia `user?.isAdmin`. Com a correção das fontes de verdade de autorização, 100% dos colaboradores não listados receberão `isAdmin: false`, ocultando imediatamente os botões "Admin" e "Telão". Além disso, caso um usuário comum tente forçar a rota ou alterar o estado `currentTab` para `'admin'` ou `'reveal'`, `App.jsx` manterá a renderização restrita à tela de votação e o backend responderá com HTTP 403.

---

### 1.2 Feedback Visual e Prevenção de Duplo Clique nos Botões de Status
* **Diagnóstico**: Em [client/src/pages/AdminPage.jsx](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/AdminPage.jsx), o estado de loading é representado por uma única variável booleana genérica (`actionLoading`), que apenas desabilita os botões sem alterar o ícone e sem identificar qual botão específico está em processamento. Isso cria confusão para o operador, transmitindo sensação de travamento ou incerteza sobre se a requisição foi disparada.
* **Decisão Arquitetural**:
  * Substituir o booleano simples por um estado discriminado: `pendingAction` (ex.: `'status-waiting'`, `'status-open'`, `'status-closed'`, `'sync-photos'`, `'reset-votes'`).
  * No botão atualmente em processamento, substituir dinamicamente o ícone estático (`<Clock />`, `<Play />` ou `<Square />`) pelo componente vetorial SVG `<Loader2 className="w-4 h-4 animate-spin" />` da biblioteca `lucide-react`.
  * Desabilitar todos os botões de ação enquanto `pendingAction !== null` para prevenir condições de corrida e múltiplos envios concorrentes à API.

---

### 1.3 Uniformidade Cromática no Título da Tela Principal
* **Diagnóstico**: No cabeçalho de [client/src/pages/VotingPage.jsx](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/VotingPage.jsx#L84-L86), o título está fragmentado em duas cores:
  ```jsx
  <h1 className="text-3xl sm:text-5xl font-black text-[#1e2a4d] tracking-tight">
    Votação da <span className="text-[#2b3a6c]">Melhor Fantasia</span>
  </h1>
  ```
  Isso gera um efeito bicolor/degradê que contraria a preferência do usuário e a sobriedade solicitada.
* **Decisão Arquitetural**:
  * Padronizar o título em uma cor única sólida e institucional: Azul Marinho Carbonell (`#1e2a4d` / `text-[#1e2a4d]`), removendo qualquer `<span>` com cor contrastante secundária:
  ```jsx
  <h1 className="text-3xl sm:text-5xl font-black text-[#1e2a4d] tracking-tight">
    Votação da Melhor Fantasia
  </h1>
  ```

---

### 1.4 Banimento Completo de Emojis e Conformidade com Ícones SVG
* **Diagnóstico**: A biblioteca `lucide-react` já está integrada no projeto, porém é necessário garantir uma auditoria estrita em todos os arquivos de código-fonte (`.jsx`, `.js`, `.html`) para certificar que nenhum caractere emoji unicode ou caractere tipográfico impróprio (como "✕") seja exibido.
* **Decisão Arquitetural**:
  * Auditar e substituir o caractere `"✕"` em botões de fechar toasts pelo componente `<X className="w-4 h-4" />` de `lucide-react`.
  * Garantir que todas as mensagens do backend, logs e respostas JSON utilizem texto profissional e limpo, sem emojis.

---

## 2. Resumo das Decisões e Padrões Adotados

| Item | Padrão Anterior | Novo Padrão Adotado | Justificativa |
| :--- | :--- | :--- | :--- |
| **Lista de Administradores** | E-mails genéricos (`admin@...`, `diretoria@...`) | Lista nominal estrita dos 4 colaboradores | Segurança e restrição de acesso exclusiva à comissão da festa. |
| **Visibilidade Admin & Telão** | Condicional ao token que continha admins legados | Restrito aos 4 e-mails verificados pelo backend | Colaboradores gerais não visualizam nem acessam painéis restritos. |
| **Botões de Status na AdminPage** | Desabilitação simples sem animação | Spinner SVG animado (`<Loader2 animate-spin />`) | Feedback imediato ao usuário e prevenção de duplo clique. |
| **Título da Página de Votação** | Bicolor (`#1e2a4d` + `#2b3a6c`) | Cor única sólida (`#1e2a4d`) | Alinhamento com a solicitação do usuário e elegância visual. |
| **Sinalização Visual** | Mistura de ícones e caracteres texto ("✕") | Exclusivamente ícones vetoriais SVG (`lucide-react`) | Conformidade total com RIV03 do PRD e Design System. |
