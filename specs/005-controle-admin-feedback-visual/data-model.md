# Data Model & Entidades: Controle de Acesso Restrito e Estados de UI

**Feature**: `005-controle-admin-feedback-visual`  
**Data**: 2026-09-25  
**Status**: Concluído / Aprovado  

---

## 1. Entidades de Autorização & Configuração

### 1.1 Documento de Configuração da Aplicação (`config/app_state`)

Persistido no Firestore (e no fallback em memória `memoryStore` para testes locais), representa o estado global do sistema de votação.

```typescript
interface AppConfig {
  /** Status do ciclo da eleição */
  status: 'waiting' | 'open' | 'closed';
  
  /** Título do evento exibido no cabeçalho */
  title: string;
  
  /** Permissão de troca de voto enquanto a eleição estiver aberta */
  allowVoteChange: boolean;
  
  /** Lista nominal de e-mails institucionais autorizados com perfil de Administrador */
  adminEmails: string[];
}
```

#### Valor Oficial Padronizado para `adminEmails`:
```json
[
  "thiago.luiz@colegiocarbonell.com.br",
  "patricia.santos@colegiocarbonell.com.br",
  "marina.ribeiro@colegiocarbonell.com.br",
  "raquel.favatto@colegiocarbonell.com.br"
]
```

---

### 1.2 Sessão de Usuário Autenticado (`SessionUser`)

Token JWT emitido após validação do ID Token do Google Workspace (`POST /api/auth/google`) ou login de desenvolvimento (`POST /api/auth/dev-login`).

```typescript
interface SessionUser {
  /** E-mail institucional do colaborador (normalizado em minúsculas) */
  email: string;
  
  /** Nome completo do colaborador */
  name: string;
  
  /** URL do avatar de perfil do Google Workspace */
  picture: string;
  
  /** Flag calculada no backend indicando se o e-mail pertence a ADMIN_EMAILS */
  isAdmin: boolean;
}
```

#### Regra de Negócio para `isAdmin`:
```javascript
const OFFICIAL_ADMINS = [
  'thiago.luiz@colegiocarbonell.com.br',
  'patricia.santos@colegiocarbonell.com.br',
  'marina.ribeiro@colegiocarbonell.com.br',
  'raquel.favatto@colegiocarbonell.com.br'
];

function isUserAdmin(email) {
  const normalized = (email || '').toLowerCase().trim();
  return OFFICIAL_ADMINS.includes(normalized);
}
```

---

## 2. Entidades de Estado de Interface (Frontend)

### 2.1 Estado de Ação Assíncrona na AdminPage (`pendingAction`)

Controla qual ação assíncrona está em execução no painel administrativo para renderização seletiva do spinner animado (`<Loader2 animate-spin />`).

```typescript
type PendingActionType = 
  | 'status-waiting'  // Alternando status para 'waiting'
  | 'status-open'     // Alternando status para 'open'
  | 'status-closed'   // Alternando status para 'closed'
  | 'sync-photos'     // Sincronizando catálogo de fotos
  | 'reset-votes'     // Resetando apuração de votos
  | null;             // Nenhuma ação em andamento
```

### 2.2 Estado de Navegação (`currentTab`)

```typescript
type CurrentTab = 'voting' | 'admin' | 'reveal';
```

* Se `user?.isAdmin === false` ou `user === null`:
  * `currentTab` é forçado para `'voting'`.
  * As opções `'admin'` e `'reveal'` não são renderizadas no componente `Navbar`.
