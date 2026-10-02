# Roteiro de Validação Rápida (Quickstart)

**Feature**: `003-estabilizacao-nuvem-seguranca`  
**Branch**: `antigravity-003/feat-estabilizacao-nuvem-seguranca`  
**Data**: 2026-09-24  

---

## 1. Pré-Requisitos
- Node.js v20+ instalado.
- Projeto GCP `vota-509520` com Firestore em modo Nativo habilitado.
- Dependências instaladas (`npm install` na raiz, `server/` e `client/`).

---

## 2. Cenários de Teste e Validação de Ponta a Ponta

### Cenário 1: Compressão e Otimização de Fotos (FinOps)
1. Executar o script de otimização de fotos:
   ```bash
   node server/scripts/optimizePhotos.js
   ```
2. Verificar no terminal:
   - Tamanho total anterior: ~187 MB.
   - Tamanho total pós-otimização: < 7 MB (redução > 95%).
   - Nenhuma foto quebrada ou distorcida visualmente na galeria.

---

### Cenário 2: Persistência Atômica no Firestore
1. Iniciar o servidor local apontando para o Firestore do projeto `vota-509520`:
   ```bash
   cd server && npm start
   ```
2. Realizar votação autenticada com conta de teste.
3. Reiniciar o processo do servidor (simulando reciclagem de instância do Cloud Run).
4. Consultar o endpoint de status ou abrir a página:
   - O voto do colaborador deve permanecer ativo e computado com 100% de integridade.

---

### Cenário 3: Validação do Sigilo Estrito de Voto
1. Acessar o painel administrativo (`/admin`).
2. Abrir a seção de auditoria de presença.
3. Confirmar que a lista exibe apenas o nome e horário da participação do eleitor, sem conter o nome da fantasia ou o candidato votado.

---

### Cenário 4: Bloqueio do Login de Teste em Produção
1. Executar o servidor com `NODE_ENV=production`:
   ```bash
   NODE_ENV=production node server/index.js
   ```
2. Submeter requisição POST para `/api/auth/dev-login`.
3. Confirmar que a API responde com código HTTP `403 Forbidden` e rejeita a criação do token.

---

### Cenário 5: Polling Eficiente no Frontend
1. Abrir a aplicação no navegador com a aba "Network" (Rede) das DevTools aberta.
2. Observar as requisições por 30 segundos.
3. Confirmar que:
   - `/api/vote/candidates` é chamada apenas uma vez.
   - O polling chama apenas `/api/vote/status` com intervalo de 10 a 15 segundos.
