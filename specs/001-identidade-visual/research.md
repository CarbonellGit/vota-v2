# Pesquisa Técnica & Decisões Arquiteturais: Identidade Visual Colégio Carbonell

**Feature**: `001-identidade-visual`  
**Data**: 2026-09-18  
**Origem de Referência**: LMS Colégio Carbonell ([DESIGN_SYSTEM_PRD.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/DESIGN_SYSTEM_PRD.md))  

---

## 1. Tokens de Tema no Tailwind CSS v4

### Contexto
O frontend da aplicação utiliza Tailwind CSS v4 (`@tailwindcss/vite` 4.3.3) integrado ao Vite 8. No Tailwind v4, a extensão de temas não utiliza `tailwind.config.js` tradicional, mas sim a diretiva nativa `@theme` diretamente no arquivo de estilos principal (`client/src/index.css`).

### Decisão
Definir as variáveis de cor e tokens de marca na diretiva `@theme` em `client/src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-carbonell-blue: #2b3a6c;
  --color-carbonell-navy: #1e2a4d;
  --color-carbonell-yellow: #f7b53b;
  --color-carbonell-red: #d82a2b;
  --color-carbonell-white: #ffffff;
  --color-carbonell-bg: #f8fafc;
  --color-carbonell-secondary: #4b5563;
  --color-carbonell-border: #e5e7eb;
}
```

### Racional
1. **Consistência:** Gera utilitários semânticos nativos do Tailwind como `bg-carbonell-blue`, `text-carbonell-navy`, `border-carbonell-yellow`, `bg-carbonell-bg`, etc.
2. **Desempenho:** Compilação ultra-rápida no Vite sem overhead de JavaScript em runtime.
3. **Manutenibilidade:** Fonte única da verdade das cores da marca centralizada em CSS moderno.

### Alternativas Consideradas
* *Cores hexadecimais manuais inline (`bg-[#2b3a6c]`):* Rejeitada por gerar código repetitivo, difícil de manter e sujeito a inconsistências de digitação.
* *CSS Modules ou styled-components:* Rejeitada por violar a convenção do projeto (React + Tailwind CSS).

---

## 2. Estratégia de Transição Visual (Tema Claro vs. Modo Telão)

### Contexto
A versão anterior utilizava um tema global escuro (`bg-slate-950 text-slate-100`) para todas as telas. De acordo com o PRD do LMS e a aprovação expressa do usuário:
* A experiência diurna móvel (Galeria, Modais, Painel Administrativo) deve ser limpa (*clean/light*).
* A experiência do Modo Telão (`/revelacao`) necessita de um tom solene e comemorativo para auditório e telões de LED.

### Decisão
1. **Aplicação Global (`App.jsx`, `VotingPage.jsx`, `AdminPage.jsx`):**
   * Fundo padrão: `bg-carbonell-bg` (`#f8fafc`).
   * Cartões e modais: `bg-white` (`#ffffff`) com sombras sutis (`shadow-sm` / `shadow-md`) e bordas suaves (`border border-carbonell-border`).
   * Tipografia: Títulos e destaques em `text-carbonell-navy` (`#1e2a4d`), textos auxiliares em `text-carbonell-secondary` (`#4b5563`).
   * Logo institucional: `logo-fundo-branco.png`.
2. **Modo Telão (`RevealPage.jsx`):**
   * Fundo cinematográfico escuro em gradiente: `bg-gradient-to-b from-[#0f172a] via-[#1e2a4d] to-[#0f172a]`.
   * Pódio e Destaques: Acentos em Ouro institucional `text-carbonell-yellow` (`#f7b53b`) e bordas douradas.
   * Logo institucional: `logo-fundo-azul.png`.
   * Comemoração: Manutenção dos confetes comemorativos em tela cheia (`canvas-confetti`) disparados exclusivamente ao revelar o 1º colocado.

---

## 3. Banimento de Emojis e Padronização com Lucide Icons

### Contexto
O Design System estabelece proibição estrita de emojis por representarem inconsistências visuais entre sistemas operacionais (Android, iOS e Windows renderizam emojis de formas distintas).

### Mapeamento de Substituição

| Local / Uso | Emoji Anterior | Componente Vetorial (`lucide-react`) | Estilo / Cor Semântica |
| :--- | :---: | :--- | :--- |
| Revelação 1º Lugar (Campeão) | 🥇 / 👑 | `<Trophy className="w-10 h-10 text-carbonell-yellow" />` | Dourado / Amarelo `#f7b53b` |
| Revelação 2º Lugar | 🥈 | `<Medal className="w-8 h-8 text-slate-300" />` | Prateado neutro |
| Revelação 3º Lugar | 🥉 | `<Award className="w-8 h-8 text-amber-600" />` | Bronze / Cobre elegante |
| Confirmação de Voto / Voto Ativo | ✅ / 🗳️ | `<CheckCircle2 className="w-5 h-5 text-carbonell-yellow" />` | Ouro institucional |
| Auto-voto bloqueado | 🚫 | `<Ban className="w-4 h-4 text-carbonell-red" />` | Vermelho alerta `#d82a2b` |
| Busca na Galeria | 🔍 | `<Search className="w-5 h-5 text-carbonell-secondary" />` | Cinza secundário |
| Sair / Desconectar | 🚪 / ⬅️ | `<LogOut className="w-4 h-4" />` | Ação de saída discreta |
| Painel Admin / Estatísticas | 📊 / ⚙️ | `<BarChart3 className="w-5 h-5" />`, `<Settings className="w-5 h-5" />` | Ícones vetoriais de métricas |
| Sincronização de fotos | 🔄 | `<RefreshCw className="w-4 h-4" />` | Ícone de reload/sync |
| Segurança / Domínio | 🔒 | `<ShieldCheck className="w-5 h-5 text-carbonell-blue" />` | Azul institucional |

---

## 4. Otimização e Exibição de Logotipos Oficiais

### Contexto
Os três arquivos de logotipos foram importados do projeto LMS para `client/public/images/`:
* `logo-fundo-branco.png`: Versão com letras azuis institucionais e isotipo colorido para superfícies claras.
* `logo-fundo-azul.png`: Versão com tipografia branca e isotipo luminoso para fundos escuros.
* `logo3.png`: Isotipo simplificado e compacto para ícone de aba (favicon).

### Implementação
* No `client/index.html`: Atualizar `<link rel="icon" type="image/png" href="/images/logo3.png" />` e título `<title>Votação da Melhor Fantasia | Colégio Carbonell</title>`.
* Na `Navbar.jsx`: Inserir `<img src="/images/logo-fundo-branco.png" alt="Colégio Carbonell" className="h-9 w-auto object-contain" />`.
* No `LoginModal.jsx`: Inserir `logo-fundo-branco.png` no topo do card com altura 48px.
* No `RevealPage.jsx`: Inserir `<img src="/images/logo-fundo-azul.png" alt="Colégio Carbonell" className="h-12 w-auto object-contain drop-shadow-md" />`.
