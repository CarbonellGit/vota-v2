# Quickstart & Validation Guide: 006 - Blindagem de Produção e Estabilidade para o Dia da Votação

**Feature**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/006-blindagem-producao-dia-d/spec.md)  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Pré-Requisitos

- Node.js instalado (v18+)
- Dependências instaladas (`npm install` no root, `server/` e `client/`)
- Backend executando localmente na porta 3001 ou em nuvem no Cloud Run

---

## 2. Cenários de Validação Automatizada

### Cenário 1: Isenção de Rate Limit por IP no Polling de Status
1. Executar bateria de 250 requisições simultâneas em menos de 10 segundos para `GET /api/vote/status` simulando a mesma origem IP.
2. **Resultado Esperado**: 100% das requisições respondem com status HTTP 200 (sem nenhum erro HTTP 429).

### Cenário 2: Validação da Validade de 24h do Token JWT
1. Gerar token através do fluxo de login e inspecionar a carga decodificada do JWT (`jwt.decode(token)`).
2. **Resultado Esperado**: O campo `exp - iat` deve ser exatamente igual a `86400` segundos (24 horas).

### Cenário 3: Resiliência de Carregamento do SDK Google (GSI)
1. Abrir o modal de login no frontend com atraso artificial de injeção de script Google (simulando rede 3G/4G com 1.5s de atraso).
2. **Resultado Esperado**: Modal exibe spinner "Carregando autenticação Google..." sem falhas e renderiza o botão oficial assim que o objeto `window.google.accounts.id` estiver disponível no DOM.

### Cenário 4: Interceptador de Sessão Expirada (HTTP 401)
1. Forçar chamada com token JWT expirado ou inválido para uma rota autenticada.
2. **Resultado Esperado**: O cliente [api.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/api.js) limpa o `localStorage` e dispara a reabertura do modal de login com orientação clara ao usuário.

---

## 3. Comandos de Execução dos Testes

```powershell
# Executar bateria de testes automatizados do servidor
npm --prefix server test

# Executar verificação de linters do frontend
npm --prefix client run lint

# Executar compilação de produção do cliente
npm --prefix client run build
```
