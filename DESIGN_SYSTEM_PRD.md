# PRD Visual & Design System – Sistema de Votação do Melhor Traje

> [!NOTE]
> Este documento define a linguagem visual, paleta de cores, componentes e padrões de interface (UI/UX) do Sistema de Votação do Melhor Traje do Colégio Carbonell, padronizado com a identidade visual institucional estabelecida no LMS do Colégio Carbonell.

---

## 1. Identidade Visual e Paleta de Cores

A interface adota integralmente as cores institucionais do Colégio Carbonell para reforçar a marca, credibilidade e familiaridade entre os colaboradores. A experiência é primordialmente clara (*clean/light*), utilizando cores neutras de apoio para fundos e cartões, reservando as cores da marca para destaques, interações, badges e estados do sistema.

### 1.1 Cores Principais da Marca (Tokens Institucionais)

| Token | Hex | Nome / Uso Semântico |
| :--- | :--- | :--- |
| `carbonell-blue` | `#2b3a6c` | **Azul Escuro:** Cor primária da marca. Botões primários, navegação ativa, cabeçalhos institucionais e elementos em foco. |
| `carbonell-navy` | `#1e2a4d` | **Azul Marinho:** Cor base e texto principal. Títulos de página, textos de alto contraste, barras institucionais superiores e fundo de contraste no Modo Telão. |
| `carbonell-yellow` | `#f7b53b` | **Amarelo / Ouro:** Destaques, badges de estado ("Seu Voto Atual", "Em Aberto"), acentos do pódio (1º lugar) e botões secundários de atenção. |
| `carbonell-red` | `#d82a2b` | **Vermelho:** Alertas de erro, avisos de bloqueio (ex.: auto-voto bloqueado), botões de encerramento de votação e cancelamento. |
| `carbonell-white` | `#ffffff` | **Branco:** Fundo principal de cartões de participantes, modais de diálogo e superfícies de conteúdo. |

### 1.2 Cores Neutras de Apoio (Base e Superfície)

| Token | Hex / Classe | Uso |
| :--- | :--- | :--- |
| `carbonell-bg` | `#f8fafc` (`bg-slate-50`) | **Fundo da Aplicação:** Cinza muito claro, criando contraste sutil e agradável com os cartões brancos (substituindo fundos pretos escuros anteriores na galeria). |
| `carbonell-secondary` | `#4b5563` (`text-gray-600`) | **Texto Secundário:** Subtítulos, departamentos, e-mails, metadados e legendas. |
| `carbonell-border` | `#e5e7eb` (`border-gray-200`) | **Bordas e Divisórias:** Linhas sutis para separação de seções, contorno suave de inputs e cabeçalhos de tabela. |

### 1.3 Tratamento do Logotipo Institucional

*   **Fundos Claros (Branco / Cinza Claro):** Utilizar `logo-fundo-branco.png` (`/images/logo-fundo-branco.png`) na barra de navegação superior, no modal de login e nos modais de confirmação.
*   **Fundos Escuros (Azul Marinho / Telão):** Utilizar `logo-fundo-azul.png` (`/images/logo-fundo-azul.png`) no cabeçalho do Modo Telão/Pódio e em faixas institucionais escuras.
*   **Favicon e Ícone de Aba:** Utilizar `logo3.png` (`/images/logo3.png`) como ícone representativo na aba do navegador (`favicon.ico` / `<link rel="icon">`).

---

## 2. Tipografia

Para manter a legibilidade em smartphones e a sensação moderna e refinada:

*   **Família Tipográfica Principal:** `Inter` (com fallback para `Roboto`, `system-ui`, `-apple-system`, `sans-serif`).
*   **Hierarquia:**
    *   `h1` (Títulos de Tela): Bold / Semi-bold (20px a 24px no mobile, 28px a 32px no desktop), Cor: Azul Marinho (`#1e2a4d`). **Regra Obrigatória:** O título principal da galeria ("Votação do Melhor Traje") deve ser renderizado integralmente em **cor única sólida** (`#1e2a4d`), sendo expressamente proibido o uso de degradê, gradientes ou estilos bicolores em títulos da aplicação.
    *   `h2` (Títulos de Seção / Nomes dos Candidatos): Semi-bold (16px a 18px), Cor: Azul Marinho (`#1e2a4d`).
    *   `Body` (Texto normal / Instruções): Regular (14px a 16px), Cor: Texto Secundário (`#4b5563`).
    *   `Small / Badges` (Departamentos, status, etiquetas): Regular/Medium (12px), com espaçamento adequado e visual limpo.

---

## 3. Padrões de Interface (UI) e Componentes

### 3.1 Cartões de Candidatos / Colaboradores (`CandidateCard`)
*   **Superfície:** Fundo branco (`#ffffff`), bordas com cantos arredondados suaves (`rounded-2xl`), sombra sutil (`shadow-sm` com transição para `hover:shadow-md`).
*   **Foto do Colaborador:** Container com proporção visual equilibrada (`aspect-square` ou `aspect-[4/4.5]`), cantos arredondados superiores (`rounded-t-2xl`), `object-cover` com alinhamento facial superior/central de alta nitidez para reconhecimento imediato na festa, preenchendo a área sem barras vazias.
*   **Desobstrução do Rosto & Posição do Traje:**
    *   A foto deve permanecer desobstruída para permitir fácil identificação dos colegas caracterizados.
    *   A etiqueta do traje (`costumeName`) deve ser posicionada no rodapé das informações do card, **abaixo do nome e setor** do colega, evitando qualquer sobreposição ou colisão com os badges de voto.
*   **Destaque de Voto Atual:**
    *   Borda dourada/amarela institucional destacada (`ring-2 ring-[#f7b53b] border-[#f7b53b]`).
    *   Badge superior destacado: Fundo amarelo (`#f7b53b`), texto Azul Marinho (`#1e2a4d`), com ícone vetorial de confirmação (`CheckCircle`).
*   **Ações:**
    *   Botão primário de votar: Fundo Azul Escuro (`#2b3a6c`), texto branco, cantos arredondados (`rounded-xl`), área mínima de 44px de altura, com transição de clique rápida e hover escurecido.
    *   Botão de alteração de voto no mobile: Texto conciso ("Trocar Voto" ou "Alterar Voto") para manter alinhamento uniforme na grade sem quebra irregular de linha.

### 3.2 Barra de Navegação (`Navbar`)
*   **Visual:** Barra fixa superior institucional (`bg-[#1e2a4d]`), sombra suave e altura consistente (64px / `h-16`).
*   **Identidade e Logo:** Logotipo oficial do Colégio Carbonell (`logo3.png` / `logo-fundo-branco.png`) em destaque à esquerda com altura contida (32px a 40px). Em telas menores (mobile), o subtítulo "Melhor Traje" é omitido do cabeçalho para preservar espaço horizontal.
*   **Adaptação Mobile e Garantia de Logout Visível:**
    *   O botão de logout ("Sair") e o avatar do usuário autenticado DEVEM permanecer sempre visíveis no canto superior direito no mobile, sem qualquer necessidade de rolagem horizontal.
    *   Para não-administradores, o botão "Votação" é ocultado no mobile (`hidden sm:inline-flex`), pois é a única aba disponível.
    *   Para administradores no mobile (< 640px), as opções de alternância de abas ("Votação", "Admin", "Telão") são exibidas em uma **sub-barra secundária compacta de navegação** (`bg-[#141d36] border-t border-white/10`), evitando qualquer competição de espaço na linha principal e eliminando o overflow horizontal (`overflow-x-hidden`).
*   **Status da Votação:** Badge dinâmico integrado de forma harmônica na barra ou sub-barra mobile.
*   **Ações do Usuário:** Foto de perfil do Google com anel institucional sutil, alternância de abas para administradores e botão de Logout com ícone vetorial (`LogOut`).

### 3.3 Modais e Diálogos (`LoginModal`, `VoteModal`, etc.)
*   **Overlay:** Fundo escurecido suave com desfoque de fundo (`bg-slate-900/60 backdrop-blur-sm`).
*   **Card do Modal:** Fundo branco, cantos arredondados generosos (`rounded-2xl` ou `rounded-3xl`), sombra profunda (`shadow-2xl`), padding confortável adaptado para telas móveis (`p-5 sm:p-8`).
*   **Resiliência Mobile:** Todos os modais possuem altura máxima controlada (`max-h-[90dvh]`) com rolagem vertical automática (`overflow-y-auto`), assegurando que botões de confirmação e campos de entrada permaneçam acessíveis mesmo sob teclado virtual aberto ou em aparelhos compactos.
*   **Conteúdo:** Foto central em destaque, nome e departamento bem definidos, botões de ação com contraste nítido (Cancelar em contorno cinza neutro e Confirmar em Azul Escuro Carbonell `#2b3a6c`).

### 3.4 Modo Telão / Revelação (`RevealPage`)
*   **Objetivo:** Ambiente para projeção em palco/telão de LED com clima comemorativo e cinematográfico, preservando a assinatura de marca Carbonell.
*   **Paleta do Telão:** Fundo imersivo em Azul Marinho Profundo (`#10172a` a `#1e2a4d`) combinado com efeitos luminosos em Ouro/Amarelo Carbonell (`#f7b53b`) e Azul Escuro (`#2b3a6c`).
*   **Logo no Telão:** Versão `logo-fundo-azul.png` posicionada no topo com elegância.
*   **Pódio de Vencedores com Layout Adaptativo para Empates:**
    *   **1º Lugar (Ouro):** Destaque central e elevado, acentos em amarelo institucional `#f7b53b`, efeito de brilho e chuva de confetes.
        *   *Vencedor único:* Foto central em destaque ampliado (32 a 48 unidades Tailwind / 128px a 192px), badge de "Grande Campeão".
        *   *Múltiplos empatados:* Grid/Flex horizontal contido com fotos divididas proporcionalmente (ex.: 2 ou 3 avatares lado a lado, 80px a 110px cada), nomes e trajes individuais, e badge adaptativo (ex.: "1º LUGAR • 3 CAMPEÕES EMPATADOS").
    *   **2º Lugar (Prata):** Lado esquerdo, tons prateados elegantes e bordas de suporte. Em caso de empate, divide o topo do bloco com os avatares dos empatados.
    *   **3º Lugar (Bronze):** Lado direito, tons bronze/cobre refinados. Em caso de empate, divide o topo do bloco com os avatares dos empatados.

### 3.5 Botões de Ação com Estado de Carregamento (Loading States)
*   **Feedback Imediato:** Todos os botões que disparam ações assíncronas (como controle de status da votação no painel administrativo: "Aguardando", "Abrir Votação", "Encerrar Votação", ou confirmação de voto) DEVEM exibir imediatamente um indicador giratório SVG animado (`<Loader2 className="w-4 h-4 animate-spin" />`).
*   **Prevenção de Duplo Clique:** Durante o estado de carregamento, o botão em execução e seus botões irmãos devem ser desabilitados (`disabled`) para evitar requisições concorrentes ou duplicadas.
*   **Transição Suave:** Ao término da requisição, o spinner dá lugar ao ícone normal de forma instantânea, acompanhado por toast institucional de feedback.

### 3.6 Tela de Entrada e Autenticação Dedicada (`LoginPage` - Padrão cv-face)
*   **Estrutura e Enquadramento:** Tela cheia imersiva (`min-h-screen` / `h-screen`), com container centralizado vertical e horizontalmente (`flex flex-col items-center justify-center text-center p-4 sm:p-6`), espelhado na estrutura de `.login-container` do projeto institucional `cv-face`.
*   **Fundo da Página:** Fundo claro limpo institucional (`bg-[#f8fafc]` / `var(--fundo-claro)`), sem elementos da galeria de fotos ou barra de navegação visíveis.
*   **Logotipo Oficial Carbonell:** Logotipo oficial institucional com fundo transparente/branco (`logo-fundo-branco.png` / `logo2.png`), posicionado acima do título, com largura máxima contida (`max-w-[200px] w-full h-auto mb-4 sm:mb-6`).
*   **Tipografia e Título:** Título principal em cor sólida Azul Marinho (`#1e2a4d`, `text-2xl sm:text-3xl font-extrabold tracking-tight mb-2`), com texto: "Votação do Melhor Traje".
*   **Subtítulo / Instrução Institucional:** Texto informativo em cinza neutro (`text-slate-600 sm:text-base text-sm mb-6 sm:mb-8 font-normal max-w-md`): "Por favor, utilize sua conta do Colégio Carbonell para continuar." com destaque ao domínio `@colegiocarbonell.com.br`.
*   **Botão de Autenticação Google:** Botão do Google Identity Services (GSI) com largura consistente, alinhamento centralizado, exibição de status de carregamento e resiliência a falhas de rede.
*   **Ambiente de Desenvolvimento Local (DEV):** Formulário compacto de acesso rápido para testes locais mantido exclusivamente quando `import.meta.env.DEV` for verdadeiro, oculto 100% em produção.

---

## 4. Padronização Visual de Ícones e Proibição de Emojis

*   **Proibição Estrita de Emojis:** É expressamente proibido o uso de emojis (ex.: 🏆, 🥇, 🥈, 🥉, 👑, 🔒, 🚪, ⚙️, 🎉, etc.) em botões, modais, cabeçalhos, tabelas, notificações ou mensagens da interface.
*   **Ícones Profissionais Vetoriais:** Toda sinalização visual deve utilizar exclusivamente ícones vetoriais SVG da biblioteca `lucide-react`.
*   **Mapeamento Semântico de Ícones:**
    *   Troféu / Premiação: `<Trophy />`
    *   Medalha 1º Lugar / Campeão: `<Award />`, `<Crown />`, `<Medal />`
    *   Pesquisa / Filtro: `<Search />`
    *   Segurança / Domínio: `<ShieldCheck />`, `<Shield />`
    *   Voto Concluído: `<CheckCircle2 />`
    *   Painel / Gestão: `<LayoutDashboard />`, `<Settings />`
    *   Telão / Projeção: `<Maximize2 />`, `<Tv />`
    *   Sair / Logout: `<LogOut />`
    *   Usuário / Perfil: `<User />`
    *   Alerta / Auto-voto: `<AlertCircle />`, `<Ban />`
    *   Carregamento / Loading: `<Loader2 />` (com classe `animate-spin`)
    *   Status de Votação: `<Play />` (Abrir), `<Clock />` (Aguardar), `<Square />` (Encerrar)

---

## 5. Experiência Mobile First e Acessibilidade

*   **Toque Rápido:** Elementos interativos (botões de voto, busca, fechamento de modal) com área mínima de toque de 44x44px.
*   **Contraste e Legibilidade:** Relação de contraste mínima WCAG AA para todos os textos institucionais sobre os fundos claros e escuros.
*   **Responsividade:** Otimizado para visualização perfeita em telas de 360px a 430px (smartphones dos colaboradores no evento).
