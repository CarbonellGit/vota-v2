# API & Interface Contracts: Blindagem de Concorrência, FinOps e Tolerância a Falhas no Dia D

**Spec**: [spec.md](../spec.md) | **Date**: 2026-09-29

---

## 1. Contrato da Rota: `GET /api/vote/status`

### Descrição
Consulta periódica leve e assíncrona consumida pelo frontend a cada 12 segundos para sincronização do ciclo de vida da votação e do voto do colaborador autenticado.

### Requisição
- **Método:** `GET`
- **Caminho:** `/api/vote/status`
- **Headers:**
  - `Authorization: Bearer <jwt_token>` *(Opcional)*

### Resposta de Sucesso: `HTTP 200 OK`
```json
{
  "status": "open",
  "title": "Festa de Confraternização - Melhor Traje",
  "allowVoteChange": true,
  "totalCandidates": 161,
  "userVote": {
    "candidateId": "c_4d7732a9e102",
    "timestamp": "2026-09-29T19:30:00.000Z"
  }
}
```
*Se a requisição for anônima ou o colaborador ainda não tiver votado, `"userVote"` será retornado como `null`.*

### Comportamento Interno de FinOps & Performance
1. Executa `getConfig()`: Retorna do `configCache` em memória se o TTL de 10 segundos estiver válido.
2. Executa `getCandidates()`: Retorna do `candidateCache` em memória com TTL de 10 minutos.
3. Se houver token JWT com e-mail decodificado: invoca `getVoteByEmail(voterEmail)`, executando no máximo 1 leitura pontual de documento no Firestore (`votes/{voterEmail}`).
4. Se não houver token ou se o token for inválido: **0 leituras de voto são executadas no Firestore**.

---

## 2. Contrato da Rota: `POST /api/auth/google`

### Descrição
Autenticação oficial com Google Identity Services. Esta rota passa a ser explicitamente isenta do rate limiting geral por IP.

### Requisição
- **Método:** `POST`
- **Caminho:** `/api/auth/google`
- **Headers:**
  - `Content-Type: application/json`
- **Body:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

### Resposta de Sucesso: `HTTP 200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "colaborador@colegiocarbonell.com.br",
    "name": "Nome do Colaborador",
    "picture": "https://lh3.googleusercontent.com/...",
    "isAdmin": false
  }
}
```

### Regras de Rate Limiting
- Isenta da regra de 300 requisições por IP por minuto em `server/index.js`, garantindo que conexões coletivas sob NAT em redes Wi-Fi não recebam erro `HTTP 429`.

---

## 3. Contrato da Rota: `POST /api/admin/status`

### Descrição
Alteração do status da votação acionada exclusivamente pelos administradores da comissão.

### Requisição
- **Método:** `POST`
- **Caminho:** `/api/admin/status`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <admin_token>`
- **Body:**
```json
{
  "status": "open" // "waiting" | "open" | "closed"
}
```

### Efeito Colateral Obrigatório
Ao atualizar com sucesso o documento `config/app_state` no Firestore, a função `invalidateConfigCache()` é acionada imediatamente, garantindo que o novo status passe a ser retornado para todos os clientes no mesmo milissegundo.
