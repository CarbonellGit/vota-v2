# Quickstart & Validation Guide: Tela de Login Antecedente Obrigatória (Padrão cv-face)

**Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/008-tela-de-login/spec.md)  
**Date**: 2026-09-29  
**Feature**: `008-tela-de-login`  

---

## 1. Pré-Requisitos e Ambiente de Teste

1. O backend Node.js e o frontend Vite devem estar em execução:
   ```bash
   npm run dev
   ```
2. Frontend disponível em: `http://localhost:5173` (ou porta indicada pelo Vite).
3. Backend API disponível em: `http://localhost:3001`.

---

## 2. Roteiro de Validação Passo a Passo

### Cenário 1: Bloqueio Total de Acesso Anônimo na Inicialização

1. Abra uma janela **anônima** do navegador e acesse a URL raiz: `http://localhost:5173`.
2. **Resultado Esperado (Interface):**
   - A tela renderizada deve ser exclusivamente a **Tela de Login** (`LoginPage`);
   - O logotipo do Colégio Carbonell (`logo-fundo-branco.png` / `logo2.png`) é visível no topo, com largura contida (máximo de 200px);
   - O título sólido "Votação do Melhor Traje" e o subtítulo "Por favor, utilize sua conta do Colégio Carbonell para continuar." são exibidos;
   - O botão oficial do Google Sign-In (GSI) é renderizado no centro;
   - **Nenhuma foto de candidato, card, barra de navegação superior (`Navbar`) ou rodapé é renderizado no DOM**.
3. **Resultado Esperado (Rede):**
   - Abra a aba Rede/Network nas Ferramentas de Desenvolvedor (F12);
   - Nenhuma requisição para `/api/vote/candidates` ou `/photos/*` foi disparada.

---

### Cenário 2: Validação de Segurança no Backend (`GET /api/vote/candidates`)

1. Abra o terminal (PowerShell ou Bash) e execute uma requisição direta sem token:
   ```powershell
   curl.exe -i http://localhost:3001/api/vote/candidates
   ```
2. **Resultado Esperado:**
   - Status HTTP: **401 Unauthorized**;
   - Corpo da resposta: `{"error": "Não autorizado: faça login para acessar os participantes"}`.

---

### Cenário 3: Autenticação com Sucesso e Desbloqueio da Galeria

1. Na tela de login, utilize o botão institucional do Google Sign-In (ou, em modo DEV, clique no botão de atalho rápido *"Thiago Luiz (Admin)"* ou *"Mariana Santos"*);
2. **Resultado Esperado:**
   - A tela de login é desmontada;
   - Um indicador de carregamento rápido é exibido enquanto os candidatos são obtidos;
   - A barra de navegação superior (`Navbar`) surge exibindo o nome e avatar do colaborador e o status da votação;
   - A galeria de fotos (`VotingPage`) é renderizada com todos os cards dos colegas de trabalho;
   - Se logado como administrador, as abas "Admin" e "Telão" ficam acessíveis.

---

### Cenário 4: Logout e Purga de Dados da Memória

1. Com o usuário logado e a galeria de fotos aberta, clique no botão **"Sair"** na barra de navegação superior;
2. **Resultado Esperado:**
   - O sistema limpa imediatamente o `localStorage` (removendo `token` e `user`);
   - O estado de candidatos na memória React é resetado para vazio (`[]`);
   - A aplicação retorna instantaneamente para a **Tela de Login** (`LoginPage`);
   - Pressionar F5 (refresh) na janela anônima continua exibindo estritamente a tela de login.

---

### Cenário 5: Tratamento de E-mail Não-Institucional

1. Se tentar autenticar com uma conta que não pertença ao domínio `@colegiocarbonell.com.br` (ex.: `@gmail.com`):
2. **Resultado Esperado:**
   - O backend bloqueia a emissão de token com erro HTTP 403;
   - A tela de login exibe um alerta em vermelho: *"Acesso restrito: utilize seu e-mail institucional @colegiocarbonell.com.br"*;
   - O usuário permanece bloqueado na tela de login sem acesso a fotos.
