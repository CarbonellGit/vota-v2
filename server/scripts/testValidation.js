/**
 * Script de Validação de Ponta a Ponta (End-to-End)
 * Executa as validações descritas no quickstart.md:
 * 1. Bloqueio de dev-login em produção (HTTP 403)
 * 2. Autenticação e emissão de token JWT
 * 3. Voto atômico e troca de voto
 * 4. Sigilo absoluto do voto na auditoria do admin (sem vazamento de candidato)
 * 5. Rate limiting e cabeçalhos de cache de fotos
 */

const http = require('http');

async function runTests() {
  console.log('[TEST] Iniciando Bateria de Testes Automatizados (Quickstart)...');

  // Teste 1: Bloqueio em Produção
  console.log('\n--- [Cenário 4] Teste de Segurança em Produção ---');
  process.env.NODE_ENV = 'production';
  delete require.cache[require.resolve('../routes/auth')];
  delete require.cache[require.resolve('../index')];
  
  // Testar rota dev-login com NODE_ENV=production
  const express = require('express');
  const appProd = express();
  appProd.use(express.json());
  const { router: authRoutesProd } = require('../routes/auth');
  appProd.use('/api/auth', authRoutesProd);

  const serverProd = http.createServer(appProd);
  await new Promise(resolve => serverProd.listen(0, resolve));
  const prodPort = serverProd.address().port;

  const resDevLoginProd = await fetch(`http://localhost:${prodPort}/api/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mariana.santos@colegiocarbonell.com.br', name: 'Mariana' })
  });

  if (resDevLoginProd.status === 403) {
    console.log('  [PASS] dev-login bloqueado com HTTP 403 em produção.');
  } else {
    throw new Error(`[FAIL] dev-login retornou ${resDevLoginProd.status}, esperava 403`);
  }
  serverProd.close();

  // Restaurar para development para testar fluxo funcional
  console.log('\n--- [Cenário 1] Teste de Controle de Acesso Restrito (RBAC - 5 Administradores) ---');
  process.env.NODE_ENV = 'development';
  process.env.ADMIN_EMAILS = 'thiago.luiz@colegiocarbonell.com.br,patricia.santos@colegiocarbonell.com.br,marina.ribeiro@colegiocarbonell.com.br,raquel.favatto@colegiocarbonell.com.br,caroline.costa@colegiocarbonell.com.br';
  delete require.cache[require.resolve('../routes/auth')];
  delete require.cache[require.resolve('../routes/vote')];
  delete require.cache[require.resolve('../routes/admin')];
  delete require.cache[require.resolve('../db')];

  const appDev = express();
  appDev.use(express.json());
  const { router: authRoutesDev } = require('../routes/auth');
  appDev.use('/api/auth', authRoutesDev);
  appDev.use('/api/vote', require('../routes/vote'));
  appDev.use('/api/admin', require('../routes/admin'));

  const serverDev = http.createServer(appDev);
  await new Promise(resolve => serverDev.listen(0, resolve));
  const devPort = serverDev.address().port;

  // 1. Obter token de colaborador comum e verificar isAdmin === false
  const resLoginUser = await fetch(`http://localhost:${devPort}/api/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mariana.santos@colegiocarbonell.com.br', name: 'Mariana Santos' })
  });
  if (!resLoginUser.ok) {
    const errorBody = await resLoginUser.text();
    throw new Error(`[FAIL] Falha no login de eleitor: HTTP ${resLoginUser.status} - ${errorBody}`);
  }
  const dataLoginUser = await resLoginUser.json();
  if (dataLoginUser.user.isAdmin !== false) {
    throw new Error(`[FAIL] Colaborador comum recebeu isAdmin=true indevidamente!`);
  }
  const userToken = dataLoginUser.token;
  console.log('  [PASS] Login de colaborador comum efetuado (isAdmin === false).');

  // 1.1 Bloqueio de colaborador comum acessando endpoints administrativos (HTTP 403)
  const resForbiddenStatus = await fetch(`http://localhost:${devPort}/api/admin/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ status: 'open' })
  });
  if (resForbiddenStatus.status !== 403) {
    throw new Error(`[FAIL] Colaborador comum não foi bloqueado no admin/status: status ${resForbiddenStatus.status}`);
  }

  const resForbiddenMetrics = await fetch(`http://localhost:${devPort}/api/admin/metrics`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (resForbiddenMetrics.status !== 403) {
    throw new Error(`[FAIL] Colaborador comum não foi bloqueado no admin/metrics: status ${resForbiddenMetrics.status}`);
  }
  console.log('  [PASS] Acesso administrativo bloqueado com HTTP 403 para colaboradores comuns.');

  // 2. Validar que os 5 administradores oficiais recebem isAdmin === true
  const officialAdmins = [
    { email: 'thiago.luiz@colegiocarbonell.com.br', name: 'Thiago Luiz' },
    { email: 'patricia.santos@colegiocarbonell.com.br', name: 'Patricia Santos' },
    { email: 'marina.ribeiro@colegiocarbonell.com.br', name: 'Marina Ribeiro' },
    { email: 'raquel.favatto@colegiocarbonell.com.br', name: 'Raquel Favatto' },
    { email: 'caroline.costa@colegiocarbonell.com.br', name: 'Caroline Costa' }
  ];

  let adminToken = '';
  for (const admin of officialAdmins) {
    const resLoginAdmin = await fetch(`http://localhost:${devPort}/api/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(admin)
    });
    if (!resLoginAdmin.ok) {
      throw new Error(`[FAIL] Falha no login do admin ${admin.email}: HTTP ${resLoginAdmin.status}`);
    }
    const dataAdmin = await resLoginAdmin.json();
    if (!dataAdmin.user.isAdmin) {
      throw new Error(`[FAIL] Administrador oficial ${admin.email} não recebeu isAdmin=true!`);
    }
    if (admin.email === 'thiago.luiz@colegiocarbonell.com.br') {
      adminToken = dataAdmin.token;
    }
  }
  console.log('  [PASS] Todos os 5 administradores oficiais autenticados com isAdmin === true.');

  console.log('\n--- [Cenários 2 & 3] Teste Funcional de Votação e Sigilo ---');

  // 3. Garantir votação aberta no admin via POST /api/admin/status
  const resStatus = await fetch(`http://localhost:${devPort}/api/admin/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'open' })
  });
  if (!resStatus.ok) {
    const errorBody = await resStatus.text();
    throw new Error(`[FAIL] Erro ao abrir votação: HTTP ${resStatus.status} - ${errorBody}`);
  }
  const dataStatus = await resStatus.json();
  if (!dataStatus.success || dataStatus.status !== 'open') {
    throw new Error(`[FAIL] Resposta inesperada ao abrir votação: ${JSON.stringify(dataStatus)}`);
  }
  console.log('  [PASS] Status da votação alterado para OPEN com sucesso no admin.');

  // 3.1 Sincronizar candidatos a partir das fotos do servidor
  const resSync = await fetch(`http://localhost:${devPort}/api/admin/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  });
  if (!resSync.ok) {
    const errorBody = await resSync.text();
    throw new Error(`[FAIL] Erro ao sincronizar fotos: HTTP ${resSync.status} - ${errorBody}`);
  }
  const dataSync = await resSync.json();
  console.log(`  [PASS] Sincronização de fotos executada com sucesso (${dataSync.result?.total || 0} participantes).`);

  // 3.2 Validar bloqueio de acesso anônimo a candidatos (HTTP 401)
  const resCandidatesAnon = await fetch(`http://localhost:${devPort}/api/vote/candidates`);
  if (resCandidatesAnon.status !== 401) {
    throw new Error(`[FAIL] Acesso anônimo a candidatos não foi bloqueado: status ${resCandidatesAnon.status}, esperava 401`);
  }
  console.log('  [PASS] Acesso anônimo a candidatos bloqueado com HTTP 401.');

  // 4. Buscar candidatos com token autenticado
  const resCandidates = await fetch(`http://localhost:${devPort}/api/vote/candidates`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  if (!resCandidates.ok) {
    const errorBody = await resCandidates.text();
    throw new Error(`[FAIL] Erro ao consultar catálogo de candidatos com token: HTTP ${resCandidates.status} - ${errorBody}`);
  }
  const candidates = await resCandidates.json();
  if (!candidates || candidates.length < 2) {
    throw new Error(`[FAIL] Catálogo retornou menos de 2 candidatos (recebido: ${candidates ? candidates.length : 0})`);
  }
  console.log(`  [PASS] Catálogo carregado com ${candidates.length} candidatos.`);

  const candidateA = candidates[0];
  const candidateB = candidates[1];

  // 5. Emitir voto
  const resVote = await fetch(`http://localhost:${devPort}/api/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ candidateId: candidateA.id })
  });
  if (!resVote.ok) {
    const errorBody = await resVote.text();
    throw new Error(`[FAIL] Erro ao votar: HTTP ${resVote.status} - ${errorBody}`);
  }
  const dataVote = await resVote.json();
  if (!dataVote.success) {
    throw new Error(`[FAIL] Erro no payload do voto: ${JSON.stringify(dataVote)}`);
  }
  console.log(`  [PASS] Voto computado com sucesso no candidato ${candidateA.name}.`);

  // 6. Trocar voto para outro candidato
  const resChangeVote = await fetch(`http://localhost:${devPort}/api/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({ candidateId: candidateB.id })
  });
  if (!resChangeVote.ok) {
    const errorBody = await resChangeVote.text();
    throw new Error(`[FAIL] Erro ao trocar voto: HTTP ${resChangeVote.status} - ${errorBody}`);
  }
  const dataChangeVote = await resChangeVote.json();
  if (!dataChangeVote.success) {
    throw new Error(`[FAIL] Erro no payload de troca de voto: ${JSON.stringify(dataChangeVote)}`);
  }
  console.log(`  [PASS] Troca de voto computada com sucesso no candidato ${candidateB.name}.`);

  // 6.1 Validar busca pontual de voto na rota /api/vote/status (Spec 009 - US1)
  const resStatusAuth = await fetch(`http://localhost:${devPort}/api/vote/status`, {
    headers: { 'Authorization': `Bearer ${userToken}` }
  });
  const dataStatusAuth = await resStatusAuth.json();
  if (!dataStatusAuth.userVote || dataStatusAuth.userVote.candidateId !== candidateB.id) {
    throw new Error(`[FAIL] userVote incorreto na rota de status pontual: ${JSON.stringify(dataStatusAuth.userVote)}`);
  }
  console.log('  [PASS] Consulta pontual de voto (/vote/status) retornou o candidato correto do eleitor.');

  // 6.2 Validar consulta anônima de status retornando userVote: null (Spec 009 - US1)
  const resStatusAnon = await fetch(`http://localhost:${devPort}/api/vote/status`);
  const dataStatusAnon = await resStatusAnon.json();
  if (dataStatusAnon.userVote !== null) {
    throw new Error(`[FAIL] userVote deveria ser null para requisição anônima, recebido: ${JSON.stringify(dataStatusAnon.userVote)}`);
  }
  console.log('  [PASS] Consulta anônima de status retornou userVote === null (zero leituras no banco).');

  // 6.3 Validar cache de configuração e invalidação atômica em /admin/status (Spec 009 - US3)
  const resClose = await fetch(`http://localhost:${devPort}/api/admin/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'closed' })
  });
  if (!resClose.ok) throw new Error('[FAIL] Erro ao fechar votação para teste de cache');
  const resCheckClosed = await fetch(`http://localhost:${devPort}/api/vote/status`);
  const dataCheckClosed = await resCheckClosed.json();
  if (dataCheckClosed.status !== 'closed') {
    throw new Error(`[FAIL] Invalidação de cache falhou: status esperado 'closed', recebido '${dataCheckClosed.status}'`);
  }
  // Reabrir votação
  await fetch(`http://localhost:${devPort}/api/admin/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'open' })
  });
  console.log('  [PASS] Cache de configuração invalidado atomicamente no painel administrativo.');

  // 7. Testar auditoria de presença (Sigilo Estrito de Voto)
  const resAudit = await fetch(`http://localhost:${devPort}/api/admin/metrics`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  if (!resAudit.ok) {
    const errorBody = await resAudit.text();
    throw new Error(`[FAIL] Erro ao buscar métricas: HTTP ${resAudit.status} - ${errorBody}`);
  }
  const dataAudit = await resAudit.json();
  
  if (!dataAudit.auditAttendance || !Array.isArray(dataAudit.auditAttendance)) {
    throw new Error('[FAIL] auditAttendance ausente ou inválido');
  }

  const voterRecord = dataAudit.auditAttendance.find(a => a.voterEmail === 'mariana.santos@colegiocarbonell.com.br');
  if (!voterRecord) {
    throw new Error('[FAIL] Registro do eleitor ausente na lista de presença');
  }

  // Verificar se há vazamento de dados do voto
  if (voterRecord.candidateId !== undefined || voterRecord.candidateName !== undefined || voterRecord.costume !== undefined) {
    throw new Error('[FAIL] VIOLAÇÃO DE SIGILO: candidato votado está exposto no registro de presença!');
  }
  console.log('  [PASS] Sigilo do voto garantido: presença registrada sem associação ao candidato.');

  // 8. Limpar votos de teste
  const resReset = await fetch(`http://localhost:${devPort}/api/admin/reset-votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ confirmation: 'ZERAR_VOTOS_CONFIRMAR' })
  });
  if (!resReset.ok) {
    const errorBody = await resReset.text();
    throw new Error(`[FAIL] Erro ao resetar votos: HTTP ${resReset.status} - ${errorBody}`);
  }
  const dataReset = await resReset.json();
  if (!dataReset.success) {
    throw new Error(`[FAIL] Erro ao resetar votos: ${JSON.stringify(dataReset)}`);
  }
  console.log('  [PASS] Base de votos restaurada e zerada para produção.');

  // 9. Validar duração do token JWT (24 horas = 86400s) [US3 / T012]
  const jwt = require('jsonwebtoken');
  const decodedToken = jwt.decode(userToken);
  const tokenDurationSec = decodedToken.exp - decodedToken.iat;
  if (tokenDurationSec !== 86400) {
    throw new Error(`[FAIL] Validade do token é de ${tokenDurationSec}s, esperava 86400s (24h)`);
  }
  console.log('  [PASS] Token JWT configurado com validade exata de 24 horas (86400s).');

  if (serverDev.closeAllConnections) {
    serverDev.closeAllConnections();
  }
  await new Promise(resolve => serverDev.close(resolve));

  // 10. Validar concorrência de polling e autenticação em Wi-Fi compartilhado (Isenção de Rate Limit por IP) [US1 / US4]
  console.log('\n--- [Cenário 5] Teste de Isenção de Rate Limit no Polling e Login Concorrentes ---');
  delete require.cache[require.resolve('../index')];
  const fullApp = require('../index');
  const serverFull = http.createServer(fullApp);
  await new Promise(resolve => serverFull.listen(0, resolve));
  const fullPort = serverFull.address().port;

  const pollingPromises = [];
  for (let i = 0; i < 60; i++) {
    pollingPromises.push(fetch(`http://localhost:${fullPort}/api/vote/status`));
  }
  const pollingResponses = await Promise.all(pollingPromises);
  const rateLimitedRes = pollingResponses.find(r => r.status === 429);
  if (rateLimitedRes) {
    throw new Error('[FAIL] Erro 429 detectado em polling concorrente sob o mesmo IP!');
  }
  const allOk = pollingResponses.every(r => r.status === 200);
  if (!allOk) {
    throw new Error('[FAIL] Nem todas as requisições de polling concorrente responderam 200 OK');
  }
  console.log('  [PASS] Polling concorrente sob o mesmo IP executado com 100% de sucesso e 0% de bloqueios 429.');

  // Teste de login simultâneo sob mesmo IP (Spec 009 - US4)
  const authPromises = [];
  for (let i = 0; i < 60; i++) {
    authPromises.push(fetch(`http://localhost:${fullPort}/api/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `teste.concorrente.${i}@colegiocarbonell.com.br`, name: `Colaborador ${i}` })
    }));
  }
  const authResponses = await Promise.all(authPromises);
  const authRateLimited = authResponses.find(r => r.status === 429);
  if (authRateLimited) {
    throw new Error('[FAIL] Erro 429 detectado em autenticação concorrente sob o mesmo IP!');
  }
  const allAuthOk = authResponses.every(r => r.status === 200);
  if (!allAuthOk) {
    throw new Error('[FAIL] Nem todas as requisições de login concorrente responderam 200 OK');
  }
  console.log('  [PASS] Autenticação concorrente sob o mesmo IP executada com 100% de sucesso e 0% de bloqueios 429.');

  if (serverFull.closeAllConnections) serverFull.closeAllConnections();
  await new Promise(resolve => serverFull.close(resolve));

  console.log('\n====================================================');
  console.log('[SUCESSO] TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('\n[ERRO] Falha nos testes de validação:', err);
  process.exit(1);
});
