# Quickstart: Validação e Testes de Responsividade Mobile

**Feature**: `007-responsividade-mobile`  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Ambiente de Execução Local

Para inicializar o ambiente de teste local:

```bash
# Iniciar o frontend no modo de desenvolvimento
cd client
npm run dev
```

Acesse no navegador: `http://localhost:5173`

---

## 2. Roteiro de Validação por Viewport

Abra o **Google Chrome DevTools** (ou Safari Web Inspector) e ative a barra de emulação de dispositivos (`Ctrl+Shift+M` ou `Cmd+Shift+M`).

### Teste 1: Viewport Compacto (iPhone SE - 360 x 667px)
1. **Barra Superior (`Navbar`):**
   - Validar que o logotipo Carbonell e o botão "Entrar" (ou avatar do usuário) cabem confortavelmente em uma única linha sem quebra ou scroll lateral.
   - Confirmar que o botão redundante "Votação" está oculto para usuários comuns.
   - Confirmar que o banner de status da votação não cobre o título da página de votação.
2. **Cards de Candidatos (`CandidateCard`):**
   - Verificar que os cards estão organizados em 2 colunas com fotos nítidas preenchendo o container (`object-cover`).
   - Confirmar que a etiqueta da fantasia (`costumeName`) está posicionada abaixo do nome e departamento.
   - Confirmar que o botão para trocar voto exibe `"Trocar Voto"` em uma única linha sem desnivelar a grade.
3. **Campo de Pesquisa:**
   - Clicar no input e verificar tamanho de fonte de 16px.
   - Digitar o nome de um colega e clicar no ícone 'X' para limpar instantaneamente a pesquisa.
4. **Modais:**
   - Abrir o modal de confirmação de voto e o modal de login: validar que ambos respeitam a altura máxima (`90dvh`) e possuem rolagem interna suave sem que nenhum botão fique inacessível.

---

### Teste 2: Viewport Padrão (iPhone 14/15/16 - 390 x 844px)
1. Navegar por toda a galeria com o mouse/touch simulando rolagem rápida com uma mão.
2. Emitir um voto em um colega e verificar que a notificação flutuante (Toast) surge centralizada no topo da tela sem vazar para as laterais.
3. Observar o card votado recebendo a borda dourada e badge `"Seu Voto Atual"` no topo, mantendo a foto 100% visível.

---

### Teste 3: Painel Administrativo Mobile (Admin em 390 x 844px)
1. Fazer login com uma das contas de administrador (ex: `thiago.luiz@colegiocarbonell.com.br`).
2. Alternar para a aba **Admin**.
3. Verificar a seção **Apuração Geral dos Votos**:
   - Constatar que a classificação é renderizada em formato de cards verticais de ranking com badge de medalha/posição, miniatura da foto, nome, votos e porcentagem legíveis em tela cheia sem qualquer necessidade de rolagem horizontal.
4. Redimensionar para tela desktop (`> 768px`) e constatar que a tabela clássica completa é reexibida automaticamente.
