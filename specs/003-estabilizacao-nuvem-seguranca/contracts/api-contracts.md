# Contratos de API: Estabilização de Nuvem, FinOps e Segurança

**Feature**: `003-estabilizacao-nuvem-seguranca`  
**Branch**: `antigravity-003/feat-estabilizacao-nuvem-seguranca`  
**Data**: 2026-09-24  

---

## 1. Rotas de Votação e Status

### 1.1 `GET /api/vote/status`
Retorna o estado operacional da votação e, caso o cabeçalho `Authorization: Bearer <token>` esteja presente, o voto do colaborador logado.

**Headers:**
- `Authorization`: `Bearer <token>` *(opcional)*

**Response (200 OK):**
```json
{
  "status": "open",
  "title": "Festa de Confraternização - Melhor Fantasia",
  "allowVoteChange": true,
  "totalCandidates": 161,
  "userVote": {
    "candidateId": "c_6164726965",
    "timestamp": "2026-09-24T20:00:00.000Z"
  }
}
```

---

### 1.2 `GET /api/vote/candidates`
Retorna a listagem completa dos colaboradores elegíveis. Deve ser consumido apenas uma vez na montagem da tela pelo frontend.

**Response (200 OK):**
```json
[
  {
    "id": "c_6164726965",
    "name": "Adrielly Paula Benevides da Silva",
    "email": "adrielly.silva@colegiocarbonell.com.br",
    "photoUrl": "/photos/Adrielly%20Paula%20Benevides%20da%20Silva.jpg",
    "department": "Colégio Carbonell",
    "costumeName": ""
  }
]
```

---

### 1.3 `POST /api/vote`
Registra ou atualiza atomicamente o voto do colaborador autenticado.

**Headers:**
- `Authorization`: `Bearer <token>` *(obrigatório)*
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "candidateId": "c_6164726965"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Voto registrado com sucesso!",
  "candidate": {
    "id": "c_6164726965",
    "name": "Adrielly Paula Benevides da Silva"
  }
}
```

**Erros Comuns:**
- `400 Bad Request`: Urna fechada ou aguardando abertura.
- `401 Unauthorized`: Sessão expirada ou ausente.
- `404 Not Found`: Candidato não cadastrado.
- `429 Too Many Requests`: Limite de tentativas excedido (rate limit).

---

## 2. Rotas de Administração e Auditoria com Sigilo de Voto

### 2.1 `GET /api/admin/metrics`
Disponibiliza métricas consolidadas, pódio e registro anônimo de presença (sem vincular eleitor ao candidato votado).

**Headers:**
- `Authorization`: `Bearer <token_admin>` *(obrigatório)*

**Response (200 OK):**
```json
{
  "status": "open",
  "title": "Festa de Confraternização - Melhor Fantasia",
  "totalVotes": 142,
  "totalCandidates": 161,
  "ranking": [
    {
      "id": "c_6164726965",
      "name": "Adrielly Paula Benevides da Silva",
      "photoUrl": "/photos/Adrielly.jpg",
      "costumeName": "Pirata",
      "votes": 34,
      "percentage": 23.9
    }
  ],
  "podium": [
    { "id": "c_6164726965", "name": "Adrielly", "votes": 34, "percentage": 23.9 }
  ],
  "auditAttendance": [
    {
      "voterName": "Thiago Marques Luiz",
      "voterEmail": "thiago.luiz@colegiocarbonell.com.br",
      "timestamp": "2026-09-24T20:15:30.000Z"
    }
  ]
}
```

> **Contrato de Privacidade**: O campo `auditAttendance` expressa apenas a lista de presença (quem participou), sem expor qual foi o `candidateId` votado pelo colaborador.

---

## 3. Rotas de Autenticação e Hardening

### 3.1 `POST /api/auth/google`
Valida o token JWT emitido pelo Google Identity Services contra o `GOOGLE_CLIENT_ID` oficial.

**Request Body:**
```json
{
  "credential": "<google_jwt_id_token>"
}
```

**Response (200 OK):**
```json
{
  "token": "<app_jwt_session_token>",
  "user": {
    "email": "colaborador@colegiocarbonell.com.br",
    "name": "Colaborador Carbonell",
    "picture": "https://lh3.googleusercontent.com/...",
    "isAdmin": false
  }
}
```

---

### 3.2 `POST /api/auth/dev-login`
Endpoint restrito a ambiente de desenvolvimento local.

**Response em Produção (`NODE_ENV === 'production'`) (403 Forbidden):**
```json
{
  "error": "Acesso não permitido em ambiente de produção."
}
```
