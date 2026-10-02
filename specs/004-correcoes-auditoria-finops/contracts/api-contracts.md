# API Contracts: Correções de Auditoria e FinOps

**Feature**: `004-correcoes-auditoria-finops`  
**Base URL**: `/api`  
**Authentication**: Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Endpoints de Autenticação

### 1.1 Validar Login Google Workspace
* **Método / Rota:** `POST /api/auth/google`
* **Descrição:** Valida o ID Token emitido pelo Google Identity Services (GSI), verifica o domínio `@colegiocarbonell.com.br` e emite o token JWT de sessão.
* **Corpo da Requisição (JSON):**
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
  ```
* **Respostas:**
  - `200 OK`:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "email": "mariana.santos@colegiocarbonell.com.br",
        "name": "Mariana Santos",
        "picture": "https://lh3.googleusercontent.com/a/...",
        "isAdmin": false
      }
    }
    ```
  - `403 Forbidden`: Domínio não autorizado (ex: e-mail externo `@gmail.com`).
  - `401 Unauthorized`: Assinatura do token Google inválida ou expirada.

---

### 1.2 Login de Teste (Exclusivo para Ambiente Local)
* **Método / Rota:** `POST /api/auth/dev-login`
* **Descrição:** Atalho para agilizar testes no ambiente local.
* **Proteção:** Bloqueado com `HTTP 403` se `NODE_ENV === 'production'`.
* **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "thiago.luiz@colegiocarbonell.com.br",
    "name": "Thiago Luiz"
  }
  ```

---

## 2. Endpoints de Votação e Catálogo

### 2.1 Consultar Status da Eleição e Voto do Usuário
* **Método / Rota:** `GET /api/vote/status`
* **Descrição:** Rota leve consultada periodicamente pelo frontend (polling a cada 12 segundos).
* **Autenticação:** Opcional (se o cabeçalho Bearer estiver presente, retorna o voto atual do colaborador).
* **Proteção:** `globalApiLimiter` (180 req/min). **Livre do limitador restrito de votos**.
* **Resposta (`200 OK`):**
  ```json
  {
    "status": "open",
    "title": "Festa de Confraternização - Melhor Fantasia",
    "allowVoteChange": true,
    "totalCandidates": 162,
    "userVote": {
      "candidateId": "c_a1b2c3d4e5f6",
      "timestamp": "2026-09-25T14:30:00.000Z"
    }
  }
  ```

---

### 2.2 Listar Candidatos (Catálogo Sanitizado)
* **Método / Rota:** `GET /api/vote/candidates`
* **Descrição:** Retorna a lista completa dos participantes e URLs de fotos públicas. Atendida com suporte a cache em memória no backend.
* **Resposta (`200 OK`):**
  ```json
  [
    {
      "id": "c_a1b2c3d4e5f6",
      "name": "Adrielly Paula Benevides da Silva",
      "email": "adrielly.silva@colegiocarbonell.com.br",
      "photoUrl": "/photos/Adrielly%20Paula%20Benevides%20da%20Silva.jpg",
      "department": "Colégio Carbonell",
      "costumeName": ""
    }
  ]
  ```

---

### 2.3 Submeter ou Alterar Voto
* **Método / Rota:** `POST /api/vote`
* **Descrição:** Registra ou atualiza atomicamente a escolha do colaborador autenticado.
* **Autenticação:** Obrigatória (`Bearer <token>`).
* **Proteção por Taxa:** `voteLimiter` (máximo de 20 submissões/minuto por `req.user.email`).
* **Corpo da Requisição (JSON):**
  ```json
  {
    "candidateId": "c_a1b2c3d4e5f6"
  }
  ```
* **Respostas:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Voto registrado com sucesso!",
      "candidate": {
        "id": "c_a1b2c3d4e5f6",
        "name": "Adrielly Paula Benevides da Silva"
      }
    }
    ```
  - `400 Bad Request`: Votação não está aberta (`waiting` ou `closed`) ou candidato inválido.
  - `429 Too Many Requests`: Mais de 20 tentativas de submissão no mesmo minuto pelo mesmo usuário.

---

## 3. Endpoints Administrativos

### 3.1 Métricas de Apuração com Sigilo Estrito
* **Método / Rota:** `GET /api/admin/metrics`
* **Descrição:** Retorna ranking consolidado e auditoria anônima de presença.
* **Autenticação:** Obrigatória (`adminMiddleware`).
* **Otimização FinOps:** Lista de candidatos recuperada do cache em memória (`CandidateCache`), evitando 162 leituras no Firestore a cada consulta.
* **Resposta (`200 OK`):**
  ```json
  {
    "status": "open",
    "title": "Festa de Confraternização - Melhor Fantasia",
    "totalVotes": 85,
    "totalCandidates": 162,
    "ranking": [
      {
        "id": "c_123",
        "name": "Nome do Colega",
        "votes": 25,
        "percentage": 29.4
      }
    ],
    "podium": [ /* Top 3 */ ],
    "auditAttendance": [
      {
        "voterName": "Mariana Santos",
        "voterEmail": "mariana.santos@colegiocarbonell.com.br",
        "timestamp": "2026-09-25T14:32:10.000Z"
      }
    ]
  }
  ```

---

### 3.2 Alterar Status da Urna
* **Método / Rota:** `POST /api/admin/status`
* **Autenticação:** Obrigatória (`adminMiddleware`).
* **Corpo da Requisição (JSON):**
  ```json
  {
    "status": "open"
  }
  ```
* **Resposta (`200 OK`):**
  ```json
  {
    "success": true,
    "status": "open",
    "message": "Status da votação alterado para: OPEN"
  }
  ```
