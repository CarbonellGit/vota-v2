# Contratos de Interface e Comportamento Responsivo (UI Contracts)

**Feature**: `007-responsividade-mobile`  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Contrato de Entrada de Busca (`VotingPage`)

| Propriedade / Comportamento | Especificação |
| :--- | :--- |
| **Classe de Tipografia** | `text-base sm:text-sm` (16px em `< sm` para impedir o zoom automático no Safari iOS). |
| **Botão de Limpeza** | Ícone vetorial `<X className="w-4 h-4 text-slate-400 hover:text-slate-600" />` exibido condicionalmente quando `searchTerm.length > 0`. |
| **Área de Toque do 'X'** | `min-w-[36px] min-h-[36px]` com preenchimento centralizado. |
| **Evento de Limpeza** | Ao clicar no botão 'X', define `searchTerm = ''` e devolve o foco ou atualiza o filtro instantaneamente. |

---

## 2. Contrato de Notificação Flutuante (`ToastNotification`)

| Propriedade / Comportamento | Especificação |
| :--- | :--- |
| **Posicionamento Mobile** | `fixed top-20 inset-x-4 max-w-sm mx-auto z-50` |
| **Posicionamento Desktop** | `sm:right-4 sm:left-auto sm:top-20` |
| **Estrutura Visual** | Borda arredondada `rounded-2xl`, sombra `shadow-xl`, ícone `CheckCircle2` (sucesso) ou `AlertCircle` (erro), texto legível sem truncar. |

---

## 3. Contrato de Ações nos Cards (`CandidateCard`)

| Estado do Voto | Ação Mobile (`< sm`) | Ação Desktop (`>= sm`) |
| :--- | :--- | :--- |
| **Sem voto emitido** | Botão `"Votar"` (44px min-h) | Botão `"Votar"` (44px min-h) |
| **Candidato já votado** | Badge estático `"Fantasia Votada"` com check | Badge estático `"Fantasia Votada"` com check |
| **Votou em outro candidato** | Botão `"Trocar Voto"` com ícone `RefreshCw` | Botão `"Mudar voto para cá"` com ícone `RefreshCw` |
| **Votação Fechada/Aguardando**| Botão cinza desabilitado `"Votação Encerrada"` / `"Aguardando"` | Botão cinza desabilitado `"Votação Encerrada"` / `"Aguardando"` |

---

## 4. Contrato de Altura e Rolagem de Modais

| Elemento | Regra de Estilo |
| :--- | :--- |
| **Container Overlay** | `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm` |
| **Card do Modal** | `w-full max-w-md bg-white rounded-3xl p-5 sm:p-8 shadow-2xl max-h-[90dvh] overflow-y-auto` |
| **Ações do Rodapé** | Botões com `min-h-[44px]` dispostos em `flex gap-3` acessíveis via rolagem interna caso o conteúdo vertical exceda a tela. |
