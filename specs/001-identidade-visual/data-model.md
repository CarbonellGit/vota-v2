# Modelo de Dados & Entidades Visuais: Identidade Visual Colégio Carbonell

**Feature**: `001-identidade-visual`  
**Data**: 2026-09-18  

---

## 1. Entidades do Sistema de Design

### 1.1 `ThemeToken` (Tokens do Tailwind CSS v4)

Representa as variáveis de cor e estilo corporativo registradas na folha de estilos global.

| Nome do Token | Valor Hex | Variável CSS | Classes Utilitárias Geradas | Finalidade |
| :--- | :--- | :--- | :--- | :--- |
| `carbonell-blue` | `#2b3a6c` | `--color-carbonell-blue` | `bg-carbonell-blue`, `text-carbonell-blue`, `border-carbonell-blue` | Cor primária institucional, botões principais de votação e confirmação. |
| `carbonell-navy` | `#1e2a4d` | `--color-carbonell-navy` | `bg-carbonell-navy`, `text-carbonell-navy`, `border-carbonell-navy` | Textos principais, títulos, cabeçalhos e fundo base do telão. |
| `carbonell-yellow` | `#f7b53b` | `--color-carbonell-yellow` | `bg-carbonell-yellow`, `text-carbonell-yellow`, `border-carbonell-yellow` | Destaque do voto ativo, troféu de 1º lugar, badges de aviso e status. |
| `carbonell-red` | `#d82a2b` | `--color-carbonell-red` | `bg-carbonell-red`, `text-carbonell-red`, `border-carbonell-red` | Alertas de erro, botões de encerrar e bloqueio de auto-voto. |
| `carbonell-white` | `#ffffff` | `--color-carbonell-white` | `bg-carbonell-white`, `text-carbonell-white` | Fundo principal de cards de candidatos, modais e containers. |
| `carbonell-bg` | `#f8fafc` | `--color-carbonell-bg` | `bg-carbonell-bg` | Fundo limpo geral da aplicação. |
| `carbonell-secondary` | `#4b5563` | `--color-carbonell-secondary` | `text-carbonell-secondary` | Textos secundários, e-mails e metadados. |
| `carbonell-border` | `#e5e7eb` | `--color-carbonell-border` | `border-carbonell-border` | Divisórias e bordas suaves. |

---

### 1.2 `BrandAsset` (Ativos de Marca e Logotipos)

Representa os arquivos de imagem oficiais da marca integrados à interface.

```json
{
  "assets": [
    {
      "id": "logo-light-bg",
      "path": "/images/logo-fundo-branco.png",
      "recommendedHeight": "36px - 48px",
      "usedIn": ["Navbar", "LoginModal"],
      "altText": "Colégio Carbonell"
    },
    {
      "id": "logo-dark-bg",
      "path": "/images/logo-fundo-azul.png",
      "recommendedHeight": "48px - 60px",
      "usedIn": ["RevealPage (Telão)"],
      "altText": "Colégio Carbonell - Celebração"
    },
    {
      "id": "favicon",
      "path": "/images/logo3.png",
      "recommendedDimensions": "32x32px ou 64x64px",
      "usedIn": ["index.html (favicon e apple-touch-icon)"],
      "altText": "Ícone Carbonell"
    }
  ]
}
```

---

### 1.3 `ComponentVisualState` (Estados Visuais de Componentes)

Define os estados visuais que cada componente adota na interface:

#### Cartão de Candidato (`CandidateCard`)
* **Estado Normal (`default`):**
  * Superfície: `bg-white border border-carbonell-border rounded-2xl shadow-sm hover:shadow-md transition-shadow`.
  * Nome: `text-carbonell-navy font-semibold`.
  * Ação: Botão `bg-carbonell-blue hover:bg-[#202c53] text-white font-medium rounded-xl`.
* **Estado Votado (`voted`):**
  * Borda destacada: `ring-2 ring-carbonell-yellow border-carbonell-yellow shadow-md`.
  * Badge superior: Fundo `bg-carbonell-yellow text-carbonell-navy` com `<CheckCircle2 />` e texto "Seu Voto Atual".
  * Botão de ação: Indica voto confirmado com opção de trocar de candidato.
* **Estado Auto-voto Bloqueado (`self`):**
  * Badge de restrição: `bg-red-50 text-carbonell-red border border-red-200`.
  * Botão desabilitado: `bg-gray-100 text-gray-400 cursor-not-allowed` com `<Ban />`.

#### Pódio de Revelação (`RevealPage`)
* **1º Lugar (Campeão Ouro):**
  * Pedestal: Elevado, borda e acentos em `border-carbonell-yellow/60 bg-gradient-to-t from-carbonell-yellow/20 to-transparent`.
  * Ícone: `<Trophy className="text-carbonell-yellow" />`.
  * Efeito: Brilho dourado pulsante e confetes em tela cheia.
* **2º Lugar (Prata):**
  * Pedestal: Intermediário, acentos prateados `border-slate-300/40 bg-gradient-to-t from-slate-400/20 to-transparent`.
  * Ícone: `<Medal className="text-slate-300" />`.
* **3º Lugar (Bronze):**
  * Pedestal: Base, acentos cobre/bronze `border-amber-600/40 bg-gradient-to-t from-amber-700/20 to-transparent`.
  * Ícone: `<Award className="text-amber-500" />`.
