# Feature Specification: 006 - Blindagem de Produção e Estabilidade para o Dia da Votação

**Feature Branch**: `antigravity-006/fix-blindagem-producao-dia-d`  
**Created**: 2026-09-28  
**Status**: Draft  
**Input**: Usuário solicitou criação de spec para tratar os problemas encontrados na auditoria pré-evento (gargalo de Wi-Fi coletivo, renderização resiliente do botão Google em conexões móveis, extensão da sessão JWT para 24h e eliminação de cold-start no Cloud Run).

---

## 1. Visão Geral e Objetivo de Negócio

Durante a festa de confraternização do Colégio Carbonell, mais de 160 colaboradores estarão presentes simultaneamente no mesmo espaço físico. Para evitar qualquer frustração ou interrupção na experiência dos participantes e da comissão organizadora, o sistema deve ser blindado contra os três principais fatores de risco de eventos com votação ao vivo:
1. **Rede Wi-Fi Compartilhada:** Múltiplos dispositivos conectados ao mesmo ponto de acesso compartilhando o mesmo endereço IP público.
2. **Conexões Móveis Oscilantes:** Celulares em 4G/3G ou Wi-Fi congestionado que demandam resiliência no carregamento da tela de login do Google.
3. **Longa Duração da Festa:** Intervalo de várias horas entre a chegada dos convidados e a abertura oficial da urna, exigindo sessões duradouras que não expirem no meio da comemoração.
4. **Instantaneidade no Palco:** Ausência de atrasos de carregamento inicial (cold start) quando a votação for aberta pelo mestre de cerimônias.

---

## 2. Histórias de Usuário & Cenários de Teste *(User Scenarios & Testing)*

### User Story 1 - Acesso Concorrente Massivo no Wi-Fi da Festa (Prioridade: P1)

Como colaborador conectado à rede Wi-Fi da festa com meu smartphone, quero que a página de votação acompanhe o status da urna em tempo real sem apresentar erros de bloqueio por excesso de requisições, para que eu possa votar com tranquilidade no momento anunciado.

**Por que esta prioridade**: Em festas de confraternização, dezenas de colaboradores utilizam o mesmo Wi-Fi. Se o sistema limitar requisições de consulta por endereço IP, dezenas de pessoas serão bloqueadas coletivamente com erro técnico HTTP 429 ("Muitas requisições"), arruinando a dinâmica do evento.

**Teste Independente**: Simular múltiplos clientes (>40) consultando o status da votação em alta frequência a partir do mesmo endereço IP de rede e verificar que 100% das consultas têm resposta imediata sem bloqueio.

**Cenários de Aceite**:
1. **Dado** que mais de 50 colaboradores estão com o aplicativo aberto na mesma rede Wi-Fi,  
   **Quando** os dispositivos consultam o status da votação automaticamente e continuamente,  
   **Então** nenhum colaborador deve receber mensagem de bloqueio por limite de requisições.
2. **Dado** que um colaborador autenticado tenta submeter seu voto,  
   **Quando** ele confirma sua escolha na tela,  
   **Então** a submissão do voto é avaliada individualmente pela conta do colaborador, garantindo equidade sem penalizar os outros aparelhos conectados à mesma rede.

---

### User Story 2 - Login Resiliente do Google em Conexões Móveis (Prioridade: P1)

Como colaborador tentando acessar o sistema pelo celular em uma conexão com sinal oscilante, quero que o botão de entrada com o Google institucional seja exibido de forma confiável e com indicação visual de carregamento, para que a tela de login nunca fique em branco ou inacessível.

**Por que esta prioridade**: Em ambientes de evento, o sinal de dados móveis ou Wi-Fi pode sofrer latência momentânea. Se o componente de login do Google falhar em inicializar no primeiro instante, o colaborador não conseguirá entrar no sistema para registrar seu voto.

**Teste Independente**: Simular lentidão de rede móvel (script de autenticação demorando até 3 segundos para responder) e verificar que o modal exibe indicador de carregamento e renderiza o botão oficial do Google assim que os serviços estiverem prontos, sem deixar a tela vazia.

**Cenários de Aceite**:
1. **Dado** que o colaborador abre o modal de login em uma rede móvel com latência,  
   **Quando** o script de autenticação externa do Google ainda estiver em processo de carregamento,  
   **Então** a interface exibe um indicador claro de "Carregando autenticação Google..." em vez de uma caixa em branco.
2. **Dado** que o script externo do Google conclui o download no navegador,  
   **Quando** o componente detecta a disponibilidade do serviço,  
   **Então** o botão oficial institucional do Google é renderizado automaticamente e o indicador de espera é concluído.

---

### User Story 3 - Sessão Duradoura e Recuperação Transparente (Prioridade: P1)

Como colaborador que chegou cedo à confraternização e já efetuou login no sistema, quero que minha sessão permaneça ativa durante toda a festa, e que caso ocorra qualquer interrupção, eu seja orientado a reentrar amigavelmente sem mensagens de erro travadas.

**Por que esta prioridade**: Se o token de sessão expirar após 4 horas e a votação for aberta no final da festa, colaboradores que acessaram o sistema na recepção receberão erro técnico ao tentar votar, causando confusão e sensação de sistema quebrado.

**Teste Independente**: Verificar que a credencial de sessão emitida possui validade mínima de 24 horas e que, caso ocorra resposta de sessão expirada (HTTP 401), a aplicação limpa o estado antigo e abre automaticamente a janela de login.

**Cenários de Aceite**:
1. **Dado** que um colaborador realizou login às 19:00 na abertura da festa,  
   **Quando** a votação for oficialmente aberta após as 23:00 e ele confirmar seu voto,  
   **Então** o voto deve ser processado e computado com sucesso sem exigir novo login.
2. **Dado** que por qualquer motivo a sessão de um colaborador fique inválida ou revogada,  
   **Quando** ele tentar realizar uma ação no sistema,  
   **Então** a aplicação deve exibir mensagem amigável e abrir a opção de entrada com a conta Google institucional, em vez de exibir um erro técnico genérico.

---

### User Story 4 - Prontidão Instantânea e Alta Disponibilidade no Palco (Prioridade: P2)

Como administrador e apresentador do evento, quero que a aplicação responda instantaneamente quando eu liberar a votação e quando abrir o telão de revelação no projetor, sem pausas de aquecimento do servidor (cold start).

**Por que esta prioridade**: No momento em que o apresentador anuncia no microfone que a urna está aberta, todos pegam o celular ao mesmo tempo. Se o servidor em nuvem estiver desligado, a primeira onda de acessos sofrerá atraso perceptível de segundos.

**Teste Independente**: Verificar que a configuração de deploy em nuvem mantém pelo menos uma instância sempre aquecida e pronta para atender requisições instantaneamente durante o evento.

**Cenários de Aceite**:
1. **Dado** que a aplicação está hospedada em ambiente de produção no Google Cloud,  
   **Quando** os colaboradores acessam a plataforma em massa no momento do anúncio,  
   **Então** as respostas devem ocorrer em menos de 1 segundo, sem atrasos decorrentes de inicialização de instâncias a frio.

---

## 3. Casos de Borda (Edge Cases)

- **O que acontece se um colaborador tentar submeter votos repetidos e em sequência no mesmo segundo?**  
  O limitador de submissão por usuário autenticado bloqueia apenas aquele usuário temporariamente (máximo de tentativas/minuto), exibindo um aviso educativo de espera, sem afetar nenhum outro colega da festa.
- **O que acontece se a internet do colaborador cair no exato momento da confirmação do voto?**  
  A interface exibe aviso de falha de conexão e mantém o botão de votar disponível para nova tentativa assim que o sinal for restabelecido.
- **O que acontece se o script do Google não puder ser baixado de jeito nenhum (ex.: firewall local bloqueando o domínio do Google)?**  
  O modal de login exibe aviso amigável informando a dificuldade de comunicação com o serviço do Google e oferecendo botão para tentar novamente.

---

## 4. Requisitos Funcionais (Functional Requirements)

- **FR-001**: O sistema DEVE isentar a rota de consulta contínua de status (`GET /api/vote/status`) e as rotas de verificação de integridade operacional de qualquer limitador de requisições baseado em endereço IP compartilhado.
- **FR-002**: O sistema DEVE manter o limite de submissão de votos (`POST /api/vote`) estritamente indexado pelo e-mail do colaborador autenticado (`req.user.email`), garantindo equidade sem restringir redes locais coletivas.
- **FR-003**: O modal de login DEVE implementar espera ativa e resiliente pelo carregamento do SDK do Google Identity Services, com checagem a cada 100ms (com limite de segurança de até 4 segundos) e exibição de feedback visual de carregamento.
- **FR-004**: O sistema DEVE emitir credenciais de sessão (JWT) com validade de 24 horas para todos os colaboradores e administradores autenticados com o domínio `@colegiocarbonell.com.br`.
- **FR-005**: O cliente frontend DEVE interceptar respostas de sessão expirada ou inválida (HTTP 401), efetuando limpeza automática do estado local e acionando o modal de login para reautenticação com 1 toque.
- **FR-006**: A configuração de deploy em nuvem DEVE prever provisionamento com instância mínima ativa (`--min-instances 1`) para assegurar disponibilidade imediata sem cold-start durante o evento.
- **FR-007**: A base de dados do evento DEVE iniciar o evento com status "Aguardando Início" e exatamente zero votos registrados, disponibilizando procedimento auditável e seguro para zerar dados prévios de testes.

---

## 5. Critérios de Sucesso Mensuráveis (Success Criteria)

- **SC-001 (Concorrência Coletiva)**: Suporte a 160 colaboradores navegando e consultando o status da votação sob o mesmo ponto de acesso Wi-Fi com 0% de bloqueios indevidos por limite de requisições (zero erros HTTP 429).
- **SC-002 (Resiliência do Login)**: 100% dos colaboradores conseguem visualizar o botão oficial do Google no modal de login, mesmo em conexões de dados móveis com latência de carregamento de até 3 segundos.
- **SC-003 (Duração da Sessão)**: 0% de ocorrência de erros de sessão expirada para colaboradores que efetuarem login desde o início do evento até a apuração final (cobertura garantida de 24 horas).
- **SC-004 (Tempo de Resposta no Pico)**: Tempo de resposta para consulta de status e abertura da página inferior a 1 segundo para 95% das requisições na abertura da urna.

---

## 6. Premissas e Dependências

- **Domínio Institucional**: Todos os eleitores e administradores utilizam contas ativas do Google Workspace no domínio `@colegiocarbonell.com.br`.
- **Origens Autorizadas no Google Cloud**: As URLs de produção (`https://vota-509520.web.app` e `https://vota-509520.firebaseapp.com`) estão devidamente cadastradas nas Origens JavaScript Autorizadas do Client ID no Google Cloud Console.
- **Compatibilidade de Navegadores**: Acesso padrão via navegadores modernos de smartphones iOS (Safari/Chrome) e Android (Chrome).
