# API Contracts: 006 - Blindagem de Produção e Estabilidade para o Dia da Votação

**Feature**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/006-blindagem-producao-dia-d/spec.md)  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Contrato: Consulta Leve de Status (Isenta de Rate Limit de IP)

- **Rota**: `GET /api/vote/status`
- **Cabeçalho**: `Authorization: Bearer <token>` (opcional)
- **Rate Limit**: **Isento** de limitador por IP (suporta polling contínuo concorrente sob o mesmo NAT/Wi-Fi).
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "status": "waiting",
    "title": "Festa de Confraternização - Melhor Fantasia",
    "allowVoteChange": true,
    "totalCandidates": 161,
    "userVote": {
      "candidateId": "c_59ed27e26b12",
      "timestamp": "2026-09-28T23:30:00.000Z"
    }
  }
  ```

---

## 2. Contrato: Emissão de Token de Sessão (Validade de 24h)

- **Rota**: `POST /api/auth/google`
- **Corpo**:
  ```json
  {
    "credential": "<Google_ID_Token_JWT>"
  }
  ```
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "token": "<JWT_Token_24h_Expiry>",
    "user": {
      "email": "colaborador@colegiocarbonell.com.br",
      "name": "Nome do Colaborador",
      "picture": "https://lh3.googleusercontent.com/...",
      "isAdmin": false
    }
  }
  ```

---

## 3. Contrato: Submissão de Voto (Rate Limit por E-mail do Usuário)

- **Rota**: `POST /api/vote`
- **Cabeçalho**: `Authorization: Bearer <token>` (obrigatório)
- **Rate Limit**: Máximo 20 tentativas por minuto por **e-mail autenticado** (`keyGenerator: req.user.email`).
- **Corpo**:
  ```json
  {
    "candidateId": "c_59ed27e26b12"
  }
  ```
- **Resposta Sucesso (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Voto registrado com sucesso!",
    "candidate": {
      "id": "c_59ed27e26b12",
      "name": "Nome do Colega"
    }
  }
  ```
- **Resposta Erro Limite Excedido (429 Too Many Requests)**:
  ```json
  {
    "error": "Você atingiu o limite de tentativas de voto por minuto. Aguarde alguns instantes."
  }
  ```
- **Resposta Erro Sessão Expirada (401 Unauthorized)**:
  ```json
  {
    "error": "Sessão expirada ou inválida"
  }
  ```
