# Phase 1 Data Model: Entidades de Interface e Contratos de Componentes

**Feature**: `007-responsividade-mobile`  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Breakpoints e Regras de Viewport

| Dispositivo / Viewport | Breakpoint Tailwind | Largura Típica | Tratamento Visual |
| :--- | :--- | :--- | :--- |
| **Mobile Compacto** | `< sm` | 360px a 390px (iPhone SE, Galaxy A) | Grade de 2 colunas compacta, sem botão 'Votação' para colaboradores comuns, busca 16px, toasts centralizados, modais `max-h-[90dvh]`. |
| **Mobile Padrão** | `< sm` | 390px a 430px (iPhone 13/14/15/16, Galaxy S) | Grade de 2 colunas com espaçamento equilibrado, fotos com enquadramento facial `object-cover`. |
| **Tablet / Telas Médias**| `sm` a `md` | 640px a 768px (iPads, dobráveis) | Grade de 3 colunas, botões expandidos na barra superior. |
| **Desktop / Telão** | `lg:` e superior | 1024px+ | Grade de 4 colunas, tabelas analíticas completas no admin, modo telão cinematográfico. |

---

## 2. Contratos de Propriedades e Estados de Componentes

### 2.1 `CandidateCard`
Componente atômico para exibição do participante e emissão do voto.

```typescript
interface Candidate {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  department?: string;
  costumeName?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  currentUser: { email: string; name: string; isAdmin?: boolean } | null;
  currentVoteId: string | null;
  votingStatus: 'waiting' | 'open' | 'closed';
  onSelectVote: (candidate: Candidate) => void;
}
```

**Regras de Apresentação:**
- **Container da Foto**: Proporção visual `aspect-[4/4.5]`, `overflow-hidden`, imagem com `object-cover object-top sm:object-center`.
- **Top Badge**: Apenas `isVotedForThis` ("Seu Voto Atual") ou `isSelf` ("Você"). Nunca renderizar a fantasia sobre a foto.
- **Etiqueta da Fantasia**: Renderizada abaixo do nome e departamento com ícone `Sparkles`, permitindo leitura em linha ou quebra suave sem cobrir o rosto.
- **Botão de Ação**: 
  - Votação aberta e voto em outro: texto `"Trocar Voto"` no mobile (`sm:hidden`) e `"Mudar voto para cá"` em telas maiores (`hidden sm:inline-flex`).
  - Altura mínima garantida: 44px (`min-h-[44px]`).

---

### 2.2 `Navbar`
Cabeçalho fixo institucional com controle de navegação e autenticação.

```typescript
interface NavbarProps {
  user: { email: string; name: string; picture?: string; isAdmin?: boolean } | null;
  status: 'waiting' | 'open' | 'closed';
  currentTab: 'voting' | 'admin' | 'reveal';
  setCurrentTab: (tab: 'voting' | 'admin' | 'reveal') => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}
```

**Regras de Apresentação:**
- O botão `"Votação"` recebe classe `hidden sm:inline-flex` quando `!user?.isAdmin`.
- Subtítulo `"Melhor Fantasia"` recebe `hidden sm:inline-block`.
- Banner móvel de status: Posicionado e integrado sem que a altura flutuante encubra os primeiros cards ou títulos da página.

---

### 2.3 Modais (`VoteModal` e `LoginModal`)
Diálogos de alta prioridade com validação e confirmação.

```typescript
interface VoteModalProps {
  candidate: Candidate;
  isChangingVote: boolean;
  onConfirm: (candidateId: string) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}
```

**Regras de Apresentação:**
- Ambos os modais contêm `max-h-[90dvh] overflow-y-auto` na caixa interna.
- Padding adaptativo: `p-5 sm:p-8`.
- Botões de confirmação e cancelamento com área mínima de toque de 44px (`min-h-[44px]`).
- Botão do Google no `LoginModal` renderizado com largura restrita para caber com segurança em viewports de 360px.

---

### 2.4 `AdminPage` - Visualização de Apuração
Lista de classificação de votos adaptada para dispositivos móveis.

```typescript
interface RankingCandidate {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  department?: string;
  costumeName?: string;
  votes: number;
  percentage: number;
}
```

**Regras de Apresentação:**
- Modo Mobile (`block md:hidden`): Cada candidato é um card compacto vertical contendo:
  - Badge de colocação (1º Ouro, 2º Prata, 3º Bronze ou ordinal);
  - Miniatura da foto com enquadramento facial;
  - Nome completo e fantasia;
  - Total de votos em destaque numérico grande (`text-lg font-black`);
  - Barra de progresso com porcentagem legível.
- Modo Desktop (`hidden md:block`): Tabela tabular clássica com colunas completas.
