# Quickstart & Validation Guide: Correções de Auditoria e FinOps

**Feature**: `004-correcoes-auditoria-finops`  
**Purpose**: Guia prático para validação automatizada e manual dos 6 pilares de correção da Feature 004.

---

## 1. Cenário 1: Validação de Autenticação em Produção vs Desenvolvimento

### 1.1 Bloqueio de Dev-Login em Produção
* **Objetivo:** Garantir que nenhuma credencial arbitrária seja aceita em produção.
* **Comando:**
  ```bash
  curl -X POST http://localhost:8080/api/auth/dev-login \
    -H "Content-Type: application/json" \
    -d '{"email":"teste@colegiocarbonell.com.br"}'
  ```
* **Resultado Esperado:** Código HTTP `403 Forbidden` com mensagem `"Endpoint de desenvolvimento desabilitado em ambiente de produção."` quando `NODE_ENV === 'production'`.

### 1.2 Interface Visual do Google Sign-In no Frontend
* **Objetivo:** Verificar a exibição do botão oficial Google GSI.
* **Passos:**
  1. Abrir a aplicação no navegador em modo de produção (`npm run preview` ou deploy no Firebase Hosting).
  2. Clicar no botão "Entrar".
  3. **Verificação:** O modal deve exibir o botão oficial "Sign in with Google" com domínio institucional restrito, sem formulários manuais de e-mail ou botões de atalho rápido.

---

## 2. Cenário 2: Validação de Rate Limiting e Wi-Fi Compartilhado

* **Objetivo:** Garantir que o polling contínuo de status e múltiplos votos sob o mesmo IP público não causem falso bloqueio coletivo.
* **Passos:**
  1. Disparar 30 requisições simultâneas para `GET /api/vote/status` a partir do mesmo IP:
     ```bash
     for i in {1..30}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/vote/status; done
     ```
  2. **Resultado Esperado:** 100% das requisições respondem `200 OK`, sem nenhum código `429 Too Many Requests`.
  3. Disparar submissões repetitivas em `POST /api/vote` para o mesmo token de usuário até exceder 20 submissões em menos de 1 minuto.
  4. **Resultado Esperado:** O limitador atua exclusivamente na 21ª tentativa daquele usuário específico com código HTTP `429`.

---

## 3. Cenário 3: Validação de FinOps na Entrega de Fotos via CDN

* **Objetivo:** Confirmar que as fotos dos 162 colaboradores são atendidas pela CDN do Firebase Hosting sem acionar o Cloud Run.
* **Passos:**
  1. Acessar uma foto no navegador: `https://vota-509520.web.app/photos/Nome%20Sobrenome.jpg`.
  2. Inspecionar os cabeçalhos de resposta na aba Network do DevTools.
  3. **Resultado Esperado:**
     - Cabeçalho `Cache-Control: public, max-age=...` ou `x-cache: HIT` da infraestrutura Firebase/Google CDN.
     - Nenhum log de requisição é registrado no serviço Cloud Run backend.

---

## 4. Cenário 4: Validação do Cache de Catálogo no Backend (Firestore FinOps)

* **Objetivo:** Comprovar a redução de mais de 98% das leituras no Firestore durante o acompanhamento da apuração.
* **Passos:**
  1. Disparar 10 chamadas sucessivas com token de administrador para `GET /api/admin/metrics`.
  2. **Resultado Esperado:**
     - Apenas a 1ª chamada consulta os documentos de candidatos no Firestore.
     - As 9 chamadas seguintes utilizam o cache em memória no Node.js (`CandidateCache`), gerando apenas leituras dos votos voláteis e respondendo em menos de 100ms.

---

## 5. Cenário 5: Execução da Suíte de Testes Automatizados

* **Comando:**
  ```bash
  cd server && npm test
  ```
* **Critérios de Aceite:**
  - Todas as asserções de teste validam explicitamente status codes HTTP reais (`res.status === 200` e `res.ok`).
  - O endpoint de configuração de status chama a rota oficial `POST /api/admin/status`.
  - Zero erros e encerramento com código de saída 0.
