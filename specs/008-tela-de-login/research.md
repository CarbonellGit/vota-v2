# Research & Technical Decisions: Tela de Login Antecedente Obrigatória e Bloqueio de Acesso a Fotos (Padrão cv-face)

**Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/008-tela-de-login/spec.md)  
**Date**: 2026-09-29  
**Feature**: `008-tela-de-login`  

---

## 1. Problema de Arquitetura e Decisão de Entrada

### Contexto
No comportamento legado do sistema, a aplicação React carregava a lista de candidatos e fotos imediatamente na montagem inicial (`useEffect` em `App.jsx`), renderizando a galeria de participantes (`VotingPage`) e a barra de navegação (`Navbar`) mesmo quando `user === null`. O `LoginModal` era exibido apenas como um diálogo flutuante em caso de clique explícito do usuário. Isso permitia que qualquer pessoa que acessasse o link ou o QR Code visualizasse antecipadamente todos os funcionários caracterizados sem se identificar.

### Decisão 1: Roteamento Declarativo com `LoginPage` Dedicada em Tela Cheia
- **Decisão**: Substituir o comportamento de modal de entrada por uma página dedicada em tela cheia (`LoginPage.jsx`), montada como a visualização raiz exclusiva sempre que o usuário não possuir credenciais válidas (`user === null`). A barra de navegação (`Navbar`), a galeria de votação (`VotingPage`), o painel de administração (`AdminPage`) e o rodapé institucional são condicionados a `user !== null`.
- **Rationale**:
  1. **Sigilo Absoluto**: Garante que nenhum componente de apresentação dos candidatos seja montado no DOM antes da autenticação com sucesso.
  2. **Fidelidade ao Sistema cv-face**: O projeto de chamada visual do Colégio Carbonell utiliza uma página de login limpa e isolada (`login.html`), sem menus ou listagens de alunos visíveis no fundo.
  3. **Simplicidade de Raciocínio de Estado**: Elimina estados intermediários de modal aberto/fechado enquanto o usuário estiver deslogado.
- **Alternativas Consideradas**:
  - *Manter `VotingPage` no fundo com `LoginModal` travado e backdrop opaco*: Rejeitado porque o DOM ainda conteria as fotos, os dados poderiam ser inspecionados no HTML ou sofrer vazamento visual (glitch) durante o carregamento inicial.

---

## 2. Padrão Visual e Alinhamento com o Projeto `cv-face`

### Contexto
O usuário especificou: *"O layout deve ser no mesmo padrao do projeto C:\Users\thiago.luiz\Desktop\Desenvolvimento\cv-face. Pode usar o mesmo logo que contem nesse projeto"*.

### Decisão 2: Mapeamento de Estilos do `cv-face` para Tailwind CSS e Tokens Carbonell
Ao inspecionar o código-fonte de `cv-face` (`login.html` e `style.css`), foram identificados os seguintes elementos essenciais:
1. **Container `.login-container`**:
   - `display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center;`
   - Mapeamento Tailwind: `min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-6 bg-slate-50` (usando `#f8fafc`).
2. **Logotipo Institucional `.login-logo-container img`**:
   - `max-width: 200px; height: auto; margin-bottom: 1rem;`
   - O arquivo `logo2.png` de `cv-face` possui exatamente os mesmos 111.894 bytes do arquivo `client/public/images/logo-fundo-branco.png` já existente em `votacao-confra`. O caminho `/images/logo-fundo-branco.png` será utilizado diretamente com `max-w-[200px] w-full h-auto mb-4`.
3. **Título Principal `h1`**:
   - `font-size: 2.5rem; font-weight: 700; color: var(--carbonell-azul-marinho);`
   - Mapeamento: `text-2xl sm:text-4xl font-extrabold text-[#1e2a4d] tracking-tight mb-2`, com texto institucional: "Votação do Melhor Traje".
4. **Mensagem Orientativa `p`**:
   - `font-size: 1.2rem; color: #6c757d;`
   - Mapeamento: `text-slate-600 text-sm sm:text-base mb-6 max-w-md font-normal leading-relaxed`, com texto: "Por favor, utilize sua conta do Colégio Carbonell para continuar.", destacando o domínio `@colegiocarbonell.com.br`.
5. **Botão de Autenticação Google**:
   - No `cv-face`, era um link direto com a logo do Google. No `votacao-confra`, a autenticação oficial é realizada via Google Identity Services (GSI) com restrição para o domínio institucional `colegiocarbonell.com.br`. O container do GSI será perfeitamente centralizado com largura de 280-320px, mantendo estado de carregamento resiliente e botão de tentar novamente em caso de falha de conexão.
6. **Formulário de Testes Locais (DEV)**:
   - Em conformidade com o `PRD_Final.md` (item 7.1), formulários manuais de login com atalhos de teste permanecem ativos exclusivamente em ambiente de desenvolvimento local (`import.meta.env.DEV`), sendo suprimidos 100% no build de produção.

---

## 3. Segurança no Backend e Proteção FinOps do Catálogo de Fotos

### Contexto
Atualmente, no arquivo `server/routes/vote.js`, a rota `GET /api/vote/candidates` é pública (sem `authMiddleware`). Qualquer script ou usuário anônimo poderia consultar `/api/vote/candidates` e obter a lista completa de colaboradores, trajes e links de fotos sem nunca ter feito login.

### Decisão 3: Proteção Estrita com `authMiddleware` na Rota de Candidatos
- **Decisão**: Aplicar `router.get('/candidates', authMiddleware, ...)` em `server/routes/vote.js`.
- **Rationale**:
  1. **Blindagem de Segurança e Privacidade**: Garante que apenas requisições portando o token JWT emitido após a validação da conta `@colegiocarbonell.com.br` possam receber os dados dos colaboradores.
  2. **FinOps & Desperdício Zero**: Evita requisições redundantes de candidatos por acessos acidentais, crawlers ou visitantes que não se autenticam.
  3. **Comportamento no Frontend**: No `App.jsx`, a execução de `fetchCandidates()` é transferida para ocorrer após a confirmação do usuário (`user !== null`). Se `user` for nulo, nenhuma requisição à API de candidatos é feita.
  4. **Purga ao Deslogar**: No `handleLogout` e no evento de auto-recovery de sessão expirada (`carbonell:session-expired`), o estado de candidatos é limpo imediatamente (`setCandidates([])`), assegurando que nada persista em memória no cliente deslogado.

---

## 4. Matriz de Decisões Técnicas

| Aspecto | Decisão Adotada | Racional |
| :--- | :--- | :--- |
| **Ponto de Entrada Deslogado** | Página inteira `LoginPage.jsx` (sem Navbar e sem fotos) | Privacidade e sigilo garantidos; sem vazamentos no DOM. |
| **Identidade Visual** | Padrão `cv-face` (layout centralizado, fundo claro `#f8fafc`, logo oficial de até 200px) | Alinhamento e padronização visual com sistemas existentes da escola. |
| **Logotipo Utilizado** | `/images/logo-fundo-branco.png` | Idêntico ao arquivo `logo2.png` de `cv-face` (111.894 bytes). |
| **Proteção da API de Candidatos** | `authMiddleware` em `GET /api/vote/candidates` | Impede scraping ou acesso anônimo aos dados dos colaboradores. |
| **Carregamento de Fotos** | Sob demanda após autenticação ativa | Economia de dados móveis e respeito ao princípio do menor privilégio. |
| **Logout & Sessão Expirada** | Limpeza de credenciais e purga de `candidates` em memória | Desmontagem instantânea da galeria e retorno seguro à `LoginPage`. |
