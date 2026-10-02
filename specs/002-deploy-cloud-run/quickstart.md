# Roteiro de Validação e Deploy Rápido: Spec 002

**Objetivo**: Validar de ponta a ponta o deploy da aplicação de votação no Google Cloud Run e Firebase Hosting.

---

## 1. Pré-Requisitos

- Google Cloud SDK autenticado com usuário com permissão de deploy no projeto `vota-509520`.
- Firebase CLI autenticado (`firebase login` / `firebase projects:list`).
- Docker / Cloud Build habilitado no projeto `vota-509520`.

---

## 2. Passo a Passo de Execução

### Passo 2.1: Deploy do Backend no Google Cloud Run
Executar na pasta raiz do projeto:
```bash
gcloud run deploy votacao-backend \
  --source ./server \
  --region southamerica-east1 \
  --project vota-509520 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET=carbonell-festa-2026-prod-jwt-secret,ADMIN_EMAILS=ti.github@colegiocarbonell.com.br
```

### Passo 2.2: Atualizar o Roteamento no Firebase Hosting
Configurar o `firebase.json` com os rewrites para o serviço `votacao-backend` no Cloud Run.

### Passo 2.3: Compilar e Publicar o Frontend no Firebase Hosting
Executar os comandos de build e deploy:
```bash
npm run build --prefix client
firebase deploy --only hosting
```

---

## 3. Roteiro de Testes e Homologação

1. **Acessibilidade do Domínio:**
   - Acessar `https://vota-509520.web.app` em uma aba anônima.
   - O título oficial e a identidade visual institucional devem carregar imediatamente.

2. **Roteamento de API Unificado:**
   - Acessar `https://vota-509520.web.app/api/status`.
   - Deve retornar JSON com o status atual da votação (`status: "AGUARDANDO_INICIO"` ou similar).

3. **Carregamento de Fotos via Cloud Run:**
   - Verificar se as fotos dos 21 colaboradores carregam sem erros 404 na galeria.

4. **Login e Restrição de Domínio:**
   - Testar o fluxo de login confirmando que apenas `@colegiocarbonell.com.br` é aceito.
