# Phase 0 Research: Soluções Técnicas de Responsividade e Experiência Mobile

**Feature**: `007-responsividade-mobile`  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Pesquisa e Decisões Técnicas

### Decisão 1: Prevenção de Auto-Zoom no Safari iOS (WebKit)
* **Contexto**: No iOS Safari, focar em um campo de formulário com tamanho de fonte menor que 16px (`1rem`) aciona automaticamente um zoom in compulsório na viewport, desconfigurando a visualização do usuário no smartphone.
* **Decisão**: Configurar o campo de busca de participantes e todos os inputs de formulário com a classe `text-base sm:text-sm` (16px em telas móveis, 14px em desktop).
* **Justificativa**: 16px é o tamanho padrão recomendado pelo Apple Human Interface Guidelines. Elimina 100% dos eventos de auto-zoom no Safari sem necessidade de hacks em JavaScript ou meta tags que prejudiquem a acessibilidade.
* **Alternativas consideradas**:
  - *`touch-action: manipulation` no CSS*: Previne atraso de duplo clique, mas não bloqueia o auto-zoom no foco do WebKit.
  - *Bloqueio via JavaScript no evento `focus`*: Adiciona complexidade e pode falhar em versões recentes do iOS. A solução pura via CSS/tipografia é universalmente estável.

---

### Decisão 2: Enquadramento e Proporção das Fotos dos Participantes (`CandidateCard`)
* **Contexto**: O componente utilizava `object-contain` em um container fotográfico com fundo gradiente escuro. Como as fotos recebidas possuem proporções variadas (verticais, horizontais e quadradas), o `object-contain` deixava barras escuras nas laterais e reduzia o rosto do participante a miniaturas de 50px a 70px em telas móveis.
* **Decisão**: Utilizar container com proporção estável (`aspect-square` ou `aspect-[4/4.5]`) com `overflow-hidden`, imagem com `w-full h-full object-cover object-top sm:object-center`.
* **Justificativa**: `object-cover` preenche integralmente a área do card sem faixas escuras vazias. O alinhamento facial superior (`object-top`) prioriza o enquadramento do rosto do participante (onde ficam os olhos, máscara ou maquiagem da fantasia), permitindo reconhecimento facial instantâneo mesmo a 1 metro de distância do celular.
* **Alternativas consideradas**:
  - *Manter `object-contain`*: Rejeitado porque prejudica gravemente o reconhecimento facial na tela de 150px de largura no mobile.
  - *Crop manual das imagens no servidor*: Rejeitado porque o CSS nativo `object-cover` resolve perfeitamente sem necessidade de processamento pesado de imagens.

---

### Decisão 3: Desobstrução Facial e Reposicionamento da Fantasia
* **Contexto**: Quando um participante possuía fantasia cadastrada e recebia o badge `"Seu Voto Atual"` ou `"Você"`, ambos os badges ficavam fixados sobre a imagem (`absolute top-3 inset-x-3`). Em cards móveis de 150px de largura, os badges colidiam e cobriam os olhos e rosto do colega.
* **Decisão**: 
  1. Manter exclusivamente o badge de status do voto (`Seu Voto Atual` ou `Você`) sobre a imagem no canto superior esquerdo.
  2. Mover a etiqueta da fantasia (`costumeName`) para a área de conteúdo do card, posicionada logo abaixo do nome e departamento do participante.
* **Justificativa**: Mantém a foto 100% limpa para identificação do participante, e confere legibilidade confortável ao nome do personagem/fantasia sem truncamentos agressivos.
* **Alternativas consideradas**:
  - *Empilhar os dois badges sobre a foto*: Rejeitado porque cobriria metade da foto em telas móveis pequenas.
  - *Exibir a fantasia apenas no modal de confirmação*: Rejeitado porque os colegas querem ver as fantasias já na galeria principal para decidir em quem votar.

---

### Decisão 4: Otimização da Barra Superior (`Navbar`) em Telas Móveis
* **Contexto**: Em smartphones de 360px de largura (ex.: iPhone SE), a navbar horizontal tentava exibir simultaneamente: logotipo Carbonell completo, botão "Votação", botões de admin (se aplicável), foto do perfil Google e botão de logout, provocando quebra visual ou overflow.
* **Decisão**:
  1. Para colaboradores comuns (não-administradores), ocultar o botão `"Votação"` em telas móveis (`hidden sm:inline-flex`), pois é a única tela disponível para eles.
  2. Ocultar o subtítulo "Melhor Fantasia" no mobile, mantendo o logotipo `logo3.png` com o texto compacto "VOTAÇÃO CARBONELL".
  3. Resolver a sobreposição do banner de status móvel, integrando o espaçamento para que nenhuma notificação ou cabeçalho seja encoberto.
* **Justificativa**: Libera mais de 70px de largura útil na barra, garantindo espaçamento limpo entre a marca e o avatar de login em qualquer celular.
* **Alternativas consideradas**:
  - *Reduzir o tamanho da fonte de todos os botões*: Rejeitado porque desrespeitaria a área mínima de toque de 44px e tornaria a leitura desconfortável.

---

### Decisão 5: Resiliência dos Modais sob Teclado Virtual e Telas Baixas
* **Contexto**: Em smartphones compactos (667px de altura) ou quando o teclado virtual é aberto, modais sem limite de altura podem empurrar botões essenciais ("Confirmar Voto", "Entrar") para fora da área visível da tela.
* **Decisão**: Aplicar `max-h-[90dvh] overflow-y-auto` em todos os modais (`VoteModal`, `LoginModal`, `ResetModal`), padding móvel `p-5 sm:p-8`, e largura dinâmica/contida para o botão Google Sign-In.
* **Justificativa**: Garante que o usuário consiga rolar internamente e sempre alcançar os botões de ação e cancelamento, independentemente da altura da viewport móvel.

---

### Decisão 6: Apuração de Votos Mobile no Painel do Administrador (`AdminPage`)
* **Contexto**: A tabela tradicional de 5 colunas com barra de distribuição exige rolagem horizontal contínua no celular, dificultando o acompanhamento dinâmico da apuração pelos administradores em trânsito pela festa.
* **Decisão**: Implementar layout responsivo híbrido:
  - Telas médias e grandes (`md:` ou superior): Tabela completa tradicional com barra de porcentagem e métricas detalhadas.
  - Telas móveis (`< md`): Lista de cards/linhas verticais de ranking com foto, badge de posição (1º, 2º, 3º, etc.), nome, setor, votos destacados e mini-barra de progresso.
* **Justificativa**: Elimina 100% da necessidade de scroll horizontal no smartphone dos administradores, entregando leitura limpa e imediata dos líderes e contagem de votos.
