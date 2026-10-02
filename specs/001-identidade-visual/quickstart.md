# Guia de Validação Rápida (Quickstart): Identidade Visual Colégio Carbonell

**Feature**: `001-identidade-visual`  
**Data**: 2026-09-18  

Este guia detalha os procedimentos para iniciar a aplicação e validar visualmente todas as telas e componentes alterados de acordo com os critérios de aceitação da especificação.

---

## 1. Pré-requisitos e Execução do Ambiente

Execute o comando a partir da raiz do projeto:

```bash
# Iniciar frontend e backend simultaneamente
npm run dev
```

* **Frontend:** Acessível em `http://localhost:5173`
* **Backend API:** Acessível em `http://localhost:3001`

---

## 2. Roteiro de Validação Visual Passo a Passo

### Cenário 1: Barra de Navegação (`Navbar`) e Favicon
1. Abra `http://localhost:5173` no navegador (ou modo de emulação móvel no DevTools, 390x844px).
2. Verifique a aba do navegador: o ícone deve exibir o isotipo oficial `logo3.png` e o título institucional.
3. Observe a barra superior:
   - Fundo branco translúcido com borda inferior sutil cinza.
   - Logotipo oficial `logo-fundo-branco.png` visível e nítido sem distorção.
   - Status da votação em badge semântico com ícone vetorial.
   - Ausência completa de emojis no header.

### Cenário 2: Galeria de Participantes (`VotingPage` e `CandidateCard`)
1. Observe o plano de fundo geral: cinza claro (`#f8fafc`).
2. Observe os cartões dos candidatos:
   - Fundo branco (`#ffffff`), cantos arredondados amplos e sombra suave.
   - Nomes em Azul Marinho (`#1e2a4d`) e departamento em tom cinza secundário.
   - Botão "Votar" no tom Azul Escuro Carbonell (`#2b3a6c`).
3. Clique em "Votar" em um participante:
   - O modal de confirmação deve abrir com fundo escurecido e desfoque suave.
   - Botão de confirmação em `#2b3a6c` e cancelar em contorno cinza.
   - Ao confirmar, o cartão deve receber contorno e badge em amarelo/ouro institucional (`#f7b53b`) com ícone `<CheckCircle2 />` e a etiqueta "Seu Voto Atual".
4. Verifique o próprio usuário logado:
   - Botão desabilitado em tom cinza claro com badge de bloqueio de auto-voto em vermelho e ícone `<Ban />`.

### Cenário 3: Painel Administrativo (`AdminPage`)
1. Acesse `http://localhost:5173` com uma conta administradora e alterne para a aba Admin.
2. Verifique:
   - Cards de estatísticas (Total de Votos, Participantes) com fundo branco, números em Azul Marinho e ícones vetoriais profissionais (`<BarChart3 />`, `<Users />`).
   - Botões de controle da urna: "Abrir Votação" em estilo institucional e "Encerrar Votação" em tom Vermelho Carbonell (`#d82a2b`).
   - Tabela de ranking limpa com linhas alternadas e barras de porcentagem na paleta institucional.

### Cenário 4: Modo Telão / Revelação (`RevealPage`)
1. Acesse `http://localhost:5173/revelacao` ou clique no botão de projeção.
2. Verifique:
   - Fundo cinematográfico escuro em tom Azul Marinho Profundo (`#0f172a` a `#1e2a4d`).
   - Logotipo oficial `logo-fundo-azul.png` posicionado com destaque no topo.
   - Pódio dos três primeiros colocados com pedestais destacados em Ouro (`#f7b53b`), Prata e Bronze utilizando exclusivamente ícones vetoriais de `<Trophy />`, `<Medal />` e `<Award />` (zero emojis).
   - Ao clicar no botão de revelar o 1º colocado: chuva de confetes virtuais em tela cheia com animação de celebração sem travamento.
