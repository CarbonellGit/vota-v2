# Research & Technical Decisions: Empates no Pódio e Navbar Mobile

**Feature**: `010-empates-podio-mobile-navbar`  
**Date**: 2026-10-02  
**Status**: Concluído  

---

## 1. Decisão 1: Algoritmo de Classificação Densa (*Dense Ranking*) no Backend

### Contexto
Atualmente, em [`server/routes/admin.js`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/routes/admin.js#L48-L55), a ordenação do ranking utilizava `b.votes - a.votes` e, havendo empate, `a.name.localeCompare(b.name)`, seguido por `slice(0, 3)`. Isso causava um corte arbitrário por ordem alfabética e atribuía posições esportivas incorretas em empates.

### Decisão
Implementar o algoritmo de **Classificação Densa (*Dense Ranking*)**:
1. Agrupar os candidatos com votos válidos (`votes > 0`) por total de votos em ordem decrescente.
2. Identificar os 3 maiores totais de votos distintos:
   - `top1Votes`: maior contagem de votos.
   - `top2Votes`: segunda maior contagem de votos.
   - `top3Votes`: terceira maior contagem de votos.
3. Alocar os candidatos correspondentes em cada um dos 3 degraus do pódio:
   - `first`: todos os candidatos com `votes === top1Votes`.
   - `second`: todos os candidatos com `votes === top2Votes` (se houver).
   - `third`: todos os candidatos com `votes === top3Votes` (se houver).
4. No array plano `ranking`, atribuir a propriedade `place` numérica calculada de forma densa:
   - Candidatos com `votes === top1Votes` recebem `place: 1`.
   - Candidatos com `votes === top2Votes` recebem `place: 2`.
   - Candidatos com `votes === top3Votes` recebem `place: 3`.
   - Candidatos subsequentes recebem `place` proporcional (4, 5, etc.) ou conforme a densidade.
5. Manter retrocompatibilidade no objeto `podium`:
   - `podium` continuará sendo um array ou objeto acessível, mas cada degrau conterá a lista de seus vencedores, garantindo compatibilidade com clientes existentes.

### Alternativas Consideradas
- **Standard Competition Ranking (Padrão 1224):** Descartado porque deixaria degraus vazios no telão da festa de confraternização (ex.: se 3 pessoas empatassem em 1º lugar, o 2º e 3º lugares deixariam de existir, prejudicando o espetáculo e a celebração coletiva no palco).
- **Desempate por Ordem Alfabética:** Rejeitado terminantemente por ser arbitrário e injusto.

---

## 2. Decisão 2: Layout Adaptativo de Empates no Modo Telão (`RevealPage.jsx`)

### Contexto
No telão ([`client/src/pages/RevealPage.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/pages/RevealPage.jsx)), cada um dos 3 blocos do pódio assumia um único candidato (`first`, `second`, `third`), com avatar fixo centralizado.

### Decisão
Criar um componente/container adaptativo para renderizar os candidatos de cada degrau:
1. **Degrau com Vencedor Único:**
   - Mantém o destaque tradicional com foto grande (128px a 192px), nome e traje centralizados.
2. **Degrau com Múltiplos Empatados (2 a 4 colaboradores):**
   - Disposição em contêiner `flex flex-wrap items-center justify-center gap-2 sm:gap-4` sobre o pedestal correspondente.
   - Fotos proporcionais (80px a 110px no desktop, 64px a 80px no mobile) com anéis de destaque e molduras individuais.
   - Nome e traje exibidos abaixo de cada foto de maneira compacta (`text-xs sm:text-sm`).
   - Badge coletivo adaptativo:
     - 1º Lugar: `"1º LUGAR • {N} CAMPEÕES EMPATADOS"` com cor amarela/ouro institucional (`#f7b53b`) e ícone `Crown`.
     - 2º Lugar: `"2º LUGAR • EMPATE"` com ícone `Medal`.
     - 3º Lugar: `"3º LUGAR • EMPATE"` com ícone `Award`.
3. **Controle de Revelação do Apresentador:**
   - O fluxo passo a passo de 3 etapas (`revealStep: 1 -> 3º Lugar`, `revealStep: 2 -> 2º Lugar`, `revealStep: 3 -> 1º Lugar`) é preservado. Ao avançar cada etapa, todos os vencedores daquele degrau são revelados simultaneamente com os respectivos efeitos sonoros (rufar de tambores e fanfarra) e confetes em tela cheia no 1º lugar.

### Alternativas Consideradas
- **Carrossel rotativo no palco:** Rejeitado porque esconderia alguns dos empatados a cada segundo, tirando a foto do palco e diminuindo a celebração ao vivo.
- **Pódio estendido com mais de 3 colunas:** Rejeitado porque descaracterizaria a estrutura icônica do pódio tradicional (2º à esquerda, 1º no centro elevado, 3º à direita).

---

## 3. Decisão 3: Barra de Navegação Mobile para Administradores (`Navbar.jsx`)

### Contexto
Em [`client/src/components/Navbar.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/components/Navbar.jsx), quando o usuário é administrador (`isAdmin: true`), a linha do cabeçalho tentava acomodar na mesma linha horizontal:
- Logotipo Carbonell + Título institucional (~200px);
- 3 botões compridos de navegação: "Votação", "Admin", "Telão" (~220px);
- Avatar + Divisória + Botão "Sair" (~75px).
Essa soma (~500px) excedia a largura de telas de celulares (360px a 414px), empurrando o botão "Sair" para fora da viewport visível e forçando rolagem lateral.

### Decisão
Estruturar o cabeçalho mobile de forma responsiva e limpa:
1. **Linha Principal Superior (Sempre Contida em 100vw):**
   - À esquerda: Logotipo institucional oficial `logo3.png` com título compacto `"CARBONELL"` no mobile.
   - À direita: Foto de perfil e botão `"Sair"` com ícone `LogOut` visível e fixo, com área de toque mínima de 44x44px, sem sofrer qualquer compressão ou transbordamento.
   - Em telas maiores (`sm:` / desktop): os botões de navegação permanecem na linha principal normalmente.
2. **Sub-barra Secundária de Abas para Administradores no Mobile (`< 640px`):**
   - Renderizada logo abaixo da barra principal para administradores autenticados.
   - Fundo escuro institucional de contraste (`bg-[#141d36]` com borda sutil `border-t border-white/10`).
   - Abas ("Votação", "Admin", "Telão") distribuídas harmoniosamente com toques amplos e destaque na aba ativa.
   - Integração limpa do badge de status da votação, garantindo zero sobreposição e zero overflow.

### Alternativas Consideradas
- **Menu Hambúrguer / Dropdown:** Rejeitado para atalhos de uso rápido como "Telão" e "Admin", pois exigiria dois cliques e esconderia o status da navegação.
- **Apenas ícones na linha principal:** Rejeitado porque ainda competiria com o logo e o perfil em telas estreitas de 360px.

---

## 4. Decisão 4: Blindagem Global contra Transbordamento Horizontal

### Contexto
Mesmo que um componente apresente leve variação de largura, navegadores móveis (Safari iOS e Chrome Android) permitem rolagem horizontal elástica involuntária da página inteira caso a raiz não declare contenção.

### Decisão
Aplicar `overflow-x-hidden` explicitamente no elemento raiz em [`client/src/App.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/App.jsx) e na regra global do `body` / `#root` em [`client/src/index.css`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/index.css), blindando toda a aplicação contra rolagem horizontal acidental.
