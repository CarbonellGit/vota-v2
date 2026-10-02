# API Contracts: Autenticação RBAC e Controle Administrativo

**Feature**: `005-controle-admin-feedback-visual`  
**Data**: 2026-09-25  
**Status**: Concluído / Aprovado  

---

## 1. Endpoints de Autenticação e Perfil

### 1.1 `POST /api/auth/google`

Valida o Google ID Token (GSI) e retorna a sessão do colaborador com a flag `isAdmin` rigorosamente avaliada contra os 4 administradores autorizados.

* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
  }
  ```
* **Response 200 OK (Administrador Autorizado)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "thiago.luiz@colegiocarbonell.com.br",
      "name": "Thiago Luiz",
      "picture": "https://lh3.googleusercontent.com/a/...",
      "isAdmin": true
    }
  }
  ```
* **Response 200 OK (Colaborador Regular)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "carlos.souza@colegiocarbonell.com.br",
      "name": "Carlos Souza",
      "picture": "https://lh3.googleusercontent.com/a/...",
      "isAdmin": false
    }
  }
  ```
* **Response 403 Forbidden (Conta Externa)**:
  ```json
  {
    "error": "Acesso permitido apenas para contas @colegiocarbonell.com.br. Você tentou entrar com: usuario@gmail.com"
  }
  ```

---

### 1.2 `GET /api/auth/me`

Recupera os dados da sessão autenticada atual e revalida a flag de administração em tempo real.

* **Headers**: `Authorization: Bearer <jwt_token>`
* **Response 200 OK**:
  ```json
  {
    "email": "patricia.santos@colegiocarbonell.com.br",
    "name": "Patricia Santos",
    "picture": "https://lh3.googleusercontent.com/a/...",
    "isAdmin": true
  }
  ```
* **Response 401 Unauthorized**:
  ```json
  {
    "error": "Sessão expirada ou inválida"
  }
  ```

---

## 2. Endpoints Administrativos Protegidos (`/api/admin/*`)

Todos os endpoints abaixo exigem o middleware `adminMiddleware`.

* Se o token não for fornecido ou inválido: **HTTP 401 Unauthorized**.
* Se o usuário autenticado não for um dos 4 administradores: **HTTP 403 Forbidden**:
  ```json
  {
    "error": "Acesso restrito à administração"
  }
  ```

### 2.1 `POST /api/admin/status`

Altera o status da votação entre `waiting`, `open` e `closed`.

* **Headers**: 
  * `Authorization: Bearer <jwt_admin_token>`
  * `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "status": "open"
  }
  ```
* **Validação**: `status` deve ser um entre `'waiting'`, `'open'`, `'closed'`.
* **Response 200 OK**:
  ```json
  {
    "message": "Status atualizado para: open",
    "status": "open"
  }
  ```
* **Response 400 Bad Request**:
  ```json
  {
    "error": "Status inválido. Use: waiting, open ou closed"
  }
  ```

---

### 2.2 `GET /api/admin/metrics`

Retorna as métricas de apuração dos votos, ranking e lista de auditoria.

* **Headers**: `Authorization: Bearer <jwt_admin_token>`
* **Response 200 OK**:
  ```json
  {
    "status": "open",
    "totalVotes": 142,
    "totalParticipants": 162,
    "participationRate": 87.6,
    "ranking": [
      {
        "id": "cand-01",
        "name": "Nome do Colega",
        "department": "Tecnologia",
        "costumeName": "Personagem",
        "photoUrl": "/photos/cand-01.jpg",
        "votes": 35,
        "percentage": 24.6
      }
    ],
    "podium": [],
    "auditList": [
      {
        "email": "eleitor@colegiocarbonell.com.br",
        "votedAt": "2026-09-25T19:45:00.000Z"
      }
    ]
  }
  ```
