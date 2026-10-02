# Quickstart & Roteiro de Validação: Feature 005

**Feature**: `005-controle-admin-feedback-visual`  
**Data**: 2026-09-25  

---

## 1. Testes Automatizados (Script Node.js)

Um script de verificação automatizada `server/scripts/testValidation.js` valida o backend contra os seguintes critérios:

1. **Permissão de Administradores Autorizados**:
   - `thiago.luiz@colegiocarbonell.com.br` -> `isAdmin: true`
   - `patricia.santos@colegiocarbonell.com.br` -> `isAdmin: true`
   - `marina.ribeiro@colegiocarbonell.com.br` -> `isAdmin: true`
   - `raquel.favatto@colegiocarbonell.com.br` -> `isAdmin: true`
2. **Bloqueio de Colaboradores Comuns**:
   - `qualquer.outro@colegiocarbonell.com.br` -> `isAdmin: false`
   - Chamada para `POST /api/admin/status` com token de colaborador regular -> HTTP 403 Forbidden.
   - Chamada para `GET /api/admin/metrics` com token de colaborador regular -> HTTP 403 Forbidden.
3. **Persistência da Configuração**:
   - Leitura de `config.adminEmails` retornando exatamente o quarteto de e-mails.

```bash
node server/scripts/testValidation.js
```

---

## 2. Testes Manuais de Interface (Frontend)

### 2.1 Validação do Perfil de Colaborador Comum (Sem Admin/Telão)
1. Abrir a aplicação no navegador em `http://localhost:5173`.
2. Fazer login com uma conta de colaborador comum (ex.: `mariana.santos@colegiocarbonell.com.br`).
3. **Verificar**: Na barra superior (`Navbar`), apenas o botão **"Votação"** deve estar visível ao lado do logo. Os botões **"Admin"** e **"Telão"** **NÃO DEVEM** ser renderizados.
4. **Verificar**: O colaborador pode votar normalmente nos cards e visualizar seu voto ativo.

### 2.2 Validação do Perfil de Administrador (Comissão da Festa)
1. Fazer login com `thiago.luiz@colegiocarbonell.com.br` (ou Patricia, Marina, Raquel).
2. **Verificar**: Na barra superior (`Navbar`), os botões **"Admin"** (com ícone Shield) e **"Telão"** (com ícone Tv e destaque dourado) aparecem ao lado de "Votação".
3. Clicar em **"Admin"**: A tela `AdminPage` carrega as métricas e os controles de votação.
4. Clicar em **"Telão"**: A tela `RevealPage` abre a projeção do pódio cinematográfico.

### 2.3 Validação da Animação de Carregamento nos Botões de Status
1. No painel de administração (`AdminPage`), localizar os botões "Aguardando", "Abrir Votação" e "Encerrar Votação".
2. Clicar no botão para alternar o status (ex.: "Abrir Votação").
3. **Verificar**:
   - O botão clicado exibe imediatamente um spinner SVG giratório (`<Loader2 className="w-4 h-4 animate-spin" />`).
   - Os demais botões de controle de status entram em estado desabilitado (`disabled`).
   - Ao finalizar a requisição, o spinner desaparece, o status é atualizado e um toast de sucesso confirma a alteração.

### 2.4 Validação do Título Principal (Cor Única Sólida)
1. Na tela de votação (`VotingPage`), inspecionar o título principal: `"Votação da Melhor Fantasia"`.
2. **Verificar**: Todo o texto está renderizado em cor sólida única institucional Azul Marinho (`#1e2a4d`), sem degradações, gradientes ou divisões de cor em `<span>`.

### 2.5 Varredura de Emojis
1. Executar no terminal:
   ```powershell
   Get-ChildItem -Path .\client\src -Recurse -Include *.jsx,*.js | Select-String -Pattern '[\uD83C-\uDBFF\uDC00-\uDFFF]'
   ```
2. **Verificar**: Nenhuma ocorrência de emoji é retornada.
