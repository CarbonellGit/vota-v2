# Pesquisa Técnica: Deploy em Produção (Firebase Hosting + Google Cloud Run) e Google OAuth

**Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/spec.md) | **Projeto**: `vota-509520` | **Região**: `southamerica-east1`

---

## 1. Google Cloud Run para Backend Express

### 1.1 Requisitos de Runtime e Escuta de Rede
- **Porta Dinâmica:** O Cloud Run injeta a variável de ambiente `PORT` (por padrão `8080`). O servidor Express em `server/index.js` deve escutar estritamente em `process.env.PORT || 3001` no host `0.0.0.0`.
- **Dockerfile Enxuto (Node.js 20 Alpine):**
  - Base image: `node:20-alpine` para inicialização ultrarrápida (cold start < 2s).
  - Incluir `server/`, `server/package.json`, `server/package-lock.json`, `server/photos/` e o banco inicial `server/data/db.json`.
  - Definir `NODE_ENV=production`.

### 1.2 Estratégia de Deploy via Google Cloud SDK
- O `gcloud` permite deploy direto a partir do código-fonte via Cloud Build:
  ```bash
  gcloud run deploy votacao-backend \
    --source ./server \
    --region southamerica-east1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars NODE_ENV=production,JWT_SECRET=...,ADMIN_EMAILS=ti@colegiocarbonell.com.br
  ```
- Isso constrói o container automaticamente no Artifact Registry/Container Registry e provisiona a URL segura HTTPS (ex: `https://votacao-backend-xxx-rj.a.run.app`).

---

## 2. Firebase Hosting com Rewrites para Cloud Run

### 2.1 Integração Nativa de Gateway Unificado
O Firebase Hosting possui suporte nativo para encaminhar requisições diretamente para serviços do Cloud Run no mesmo projeto GCP (`vota-509520`).

Exemplo de configuração no `firebase.json`:
```json
{
  "hosting": {
    "public": "client/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "votacao-backend",
          "region": "southamerica-east1"
        }
      },
      {
        "source": "/photos/**",
        "run": {
          "serviceId": "votacao-backend",
          "region": "southamerica-east1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 2.2 Benefícios Desta Abordagem
1. **Sem Problemas de CORS**: O navegador faz chamadas relativas `/api/...` e `/photos/...` para o mesmo domínio `vota-509520.web.app`.
2. **SSL Automático**: Domínio seguro `https://vota-509520.web.app` e `https://vota-509520.firebaseapp.com` fornecido pela infraestrutura global do Google.
3. **Cache de Borda**: Arquivos estáticos e fotos são cacheados na CDN mundial do Google, reduzindo drasticamente o consumo de banda na festa.

---

## 3. Autenticação Google OAuth 2.0

### 3.1 Fluxo de Validação
1. **Frontend**: Usuário clica em "Entrar com Google" (Google Identity Services / GSI ou Firebase Auth).
2. **Google**: Retorna o ID Token JWT assinado pelo Google.
3. **Backend (`server/routes/auth.js`)**:
   - Valida o token com a biblioteca `google-auth-library` contra o `GOOGLE_CLIENT_ID`.
   - Verifica se `payload.email` termina rigorosamente com `@colegiocarbonell.com.br`.
   - Gera um token de sessão JWT de 12 horas.
4. **Reserva para Homologação**: O backend mantém a rota `/dev-login` ativa apenas se `NODE_ENV !== 'production'` ou enquanto o Client ID estiver em homologação, garantindo que testes locais não sejam interrompidos.

---

## 4. Conclusão da Pesquisa
A arquitetura atende 100% aos requisitos de agilidade, estabilidade para o evento, conformidade institucional e ausência de atrito técnico.
