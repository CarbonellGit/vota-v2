# Quickstart: Validação e Testes da Blindagem de Concorrência e FinOps (Dia D)

**Spec**: [spec.md](./spec.md) | **Date**: 2026-09-29

Este guia apresenta o roteiro prático e reproduzível para validar a blindagem de desempenho, concorrência e FinOps da aplicação sob carga de **160 usuários simultâneos**.

---

## 1. Pré-requisitos de Ambiente

1. Node.js 20+ instalado.
2. Servidor local configurado ou emulador de testes.
3. Variáveis de ambiente padrão carregadas (`.env`).

---

## 2. Cenários de Validação Automatizada

### Cenário 1: Consulta Leve e Pontual de Voto (`GET /api/vote/status`)
**Objetivo**: Garantir que a rota de status não faça varredura da coleção `votes`, mantendo tempo de resposta < 100ms.
- **Passo 1**: Iniciar o servidor de teste.
- **Passo 2**: Disparar requisição anônima para `/api/vote/status` e verificar que `userVote === null` e o tempo de resposta é < 50ms.
- **Passo 3**: Autenticar um colaborador de teste e emitir um voto em um candidato.
- **Passo 4**: Chamar novamente `/api/vote/status` com o token JWT e verificar que `userVote.candidateId` retorna o candidato correto pontualmente.

### Cenário 2: Cache de Configuração e Invalidação Atômica no Painel Admin
**Objetivo**: Comprovar que o documento `config/app_state` é lido do cache em memória e que sua alteração pelo admin é instantânea.
- **Passo 1**: Executar 10 chamadas consecutivas a `/api/vote/status` e verificar que a configuração é retornada a partir do cache com latência estável.
- **Passo 2**: Como administrador, enviar `POST /api/admin/status` com `{ "status": "closed" }`.
- **Passo 3**: Imediatamente disparar uma nova requisição a `/api/vote/status` e confirmar que o novo status `"closed"` é retornado no mesmo instante (invalidação atômica).

### Cenário 3: Isenção de Rate Limiting por IP para Login Coletivo no Wi-Fi
**Objetivo**: Garantir que múltiplos acessos simultâneos sob o mesmo endereço IP de saída (NAT) não recebam erro HTTP 429.
- **Passo 1**: Disparar um lote de 160 requisições simultâneas para o endpoint de autenticação a partir do mesmo IP.
- **Passo 2**: Constatar que nenhuma requisição retorna status HTTP 429.

### Cenário 4: Teste de Carga E2E com 160 Usuários Concorrentes
**Objetivo**: Validar a estabilidade geral da aplicação sob o volume máximo esperado na festa.
- **Comando de Execução**:
  ```bash
  npm run test
  ```
- **Critérios de Aceite**:
  - 160/160 logins bem-sucedidos.
  - 160/160 consultas de candidatos bem-sucedidas.
  - 160/160 votos processados de forma atômica.
  - 50/50 alterações de voto computadas sem duplicidade.
  - 0% de respostas com erro HTTP 429 ou 500.
  - Apuração do ranking com integridade matemática e sigilo nominal preservados.
