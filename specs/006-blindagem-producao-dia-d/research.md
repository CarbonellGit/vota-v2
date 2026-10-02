# Technical Research: 006 - Blindagem de Produção e Estabilidade para o Dia da Votação

**Feature**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/006-blindagem-producao-dia-d/spec.md)  
**Date**: 2026-09-28  
**Status**: Concluído  

---

## 1. Pesquisa 1: Arquitetura de Rate Limiting para Redes Coletivas (Wi-Fi NAT Único)

### Contexto e Problema
O limitador global atual no Express (`server/index.js`) aplica `max: 180` requisições por minuto por endereço IP (`req.ip`). Em uma rede Wi-Fi corporativa ou de salão de festas, todos os 160 convidados saem para a internet através do mesmo roteador/gateway NAT, compartilhando o **mesmo endereço IP público**. Como o frontend realiza polling de status a cada 12 segundos (~5 req/min por aparelho), 36 aparelhos ativos atingem 180 req/min e ativam o erro `HTTP 429 - Too Many Requests` para toda a festa.

### Decisão Técnica
1. **Isenção de Rotas de Leitura Pública / Polling**:
   - As rotas `GET /api/vote/status`, `GET /api/health` e `GET /api/status` serão isentas do limitador de taxa por IP.
   - O endpoint `/api/vote/status` é uma leitura leve, projetada exatamente para polling assíncrono.
2. **Manutenção do Limite Estrito por Usuário no Envio de Votos**:
   - A rota de mutação crítica `POST /api/vote` já possui o limitador `submitVoteLimiter` indexado pelo e-mail do colaborador autenticado (`req.user.email`), permitindo no máximo 20 tentativas por minuto por usuário.
   - Isso garante que a rede Wi-Fi coletiva não seja prejudicada caso um único usuário tente votar repetidamente.

### Alternativas Avaliadas
- **Aumentar o limite global para 2000 req/min**: Rejeitado como solução primária isolada, pois ainda vincularia leitura de status a um teto fixo de IP. Isolar a rota de status é a melhor prática recomendada para SPAs com polling.
- **WebSocket / Server-Sent Events (SSE)**: Rejeitado porque introduziria conexões persistentes no Cloud Run, aumentando complexidade de timeouts e custos, quando o polling HTTP leve a cada 12s já atende com folga as diretrizes de FinOps do [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md).

---

## 2. Pesquisa 2: Resiliência no Carregamento do SDK Google Identity Services (GSI)

### Contexto e Problema
No [LoginModal.jsx](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/components/LoginModal.jsx), a inicialização do botão do Google dependia de um `setTimeout(initGsi, 150)`. O script `https://accounts.google.com/gsi/client` é carregado de forma assíncrona (`async defer`). Em redes móveis com latência ou sinal oscilante (4G/3G no salão da festa), o download do script pode demorar entre 300ms e 2 segundos. Se `window.google?.accounts?.id` for indefinido aos 150ms, a função encerrava silenciosamente e o botão nunca era renderizado, deixando o modal em branco.

### Decisão Técnica
1. **Mecanismo de Polling Resiliente com Timeout Seguro**:
   - Criar uma função de verificação intervalada (`setInterval` a cada 100ms) que aguarda a existência de `window.google?.accounts?.id` e da referência ao container do botão no DOM.
   - Definir teto de tentativas de 40 ciclos (4 segundos).
2. **Estado Visual de Carregamento**:
   - Exibir feedback visual com spinner vetorial e texto institucional ("Carregando autenticação Google...") enquanto o SDK estiver baixando.
   - Se o script falhar em carregar após 4 segundos (ex.: bloqueio severo de rede), exibir botão de recarga/tentativa manual amigável.

### Alternativas Avaliadas
- **Carregamento Síncrono Bloqueante**: Rejeitado porque atrasaria a renderização inicial da página e do carômetro para todos os usuários.
- **Evento `onload` na tag `<script>`**: Avaliado, mas como a tag já está no `index.html` estático, o modal pode ser aberto quando o script já carregou ou ainda está baixando. A checagem ativa com polling cobre ambos os cenários de forma determinística.

---

## 3. Pesquisa 3: Ciclo de Vida da Sessão JWT e Tratamento de 401 (Auto-Recovery)

### Contexto e Problema
O backend emitia tokens JWT com `expiresIn: '4h'` ([server/routes/auth.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/server/routes/auth.js#L128)). Eventos de confraternização estendem-se rotineiramente por 5 a 8 horas (ex.: recepção às 19h, votação às 23h30 e festa até 02h). Colaboradores que entrassem na recepção enfrentariam falha de votação por token expirado. Além disso, o cliente [client/src/api.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/api.js) não possuía interceptor para expirar a sessão local automaticamente em caso de código 401.

### Decisão Técnica
1. **Validade de Sessão de 24 Horas**:
   - Alterar `expiresIn: '24h'` em todas as rotas de emissão de token (`/api/auth/google` e `/api/auth/dev-login`).
   - 24 horas garante cobertura de todo o ciclo do evento, do pré-evento à apuração e madrugada, sem risco de expiração.
2. **Auto-Recovery no Cliente (HTTP 401)**:
   - No cliente [api.js](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/api.js), interceptar respostas com status 401 (exceto na rota de login).
   - Ao receber 401, acionar callback de limpeza de `localStorage` (`carbonell_token`, `carbonell_user`) e disparar evento customizado de logout para abrir o modal de login para o usuário com aviso explicativo.

---

## 4. Pesquisa 4: Eliminação de Cold Start no Cloud Run (Alta Disponibilidade no Evento)

### Contexto e Problema
O comando de deploy no `package.json` define `--min-instances 0`. Isso permite que o container do Cloud Run seja desalocado após alguns minutos de ociosidade para economizar recursos. No instante em que o cerimonial anuncia no palco a abertura da votação, ocorre um pico simultâneo de requisições que sofreriam atraso de 2 a 4 segundos de inicialização a frio.

### Decisão Técnica
- Alterar o comando `deploy:server` para utilizar `--min-instances 1` como padrão para a implantação de produção da festa.
- O custo de manter 1 instância ativa de 512MB em São Paulo por um período de 24 horas é insignificante (< R$ 2,00), eliminando totalmente qualquer atraso no momento da revelação e do anúncio da urna.
