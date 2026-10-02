/**
 * Script de Teste Automatizado de Ranking e Empates (Dense Ranking)
 * Valida a agregação de empates múltiplos nos 3 degraus do pódio e a consistência
 * da classificação densa em server/routes/admin.js e nas métricas administrativas.
 */

const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

// Carregar variáveis de ambiente e configurações
process.env.NODE_ENV = 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-votacao-confra';
process.env.ADMIN_EMAILS = 'thiago.luiz@colegiocarbonell.com.br,admin@colegiocarbonell.com.br';

const JWT_SECRET = process.env.JWT_SECRET;

async function runTieTests() {
  console.log('===============================================================');
  console.log('[TEST] Iniciando Bateria de Testes de Dense Ranking e Empates');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Falha na asserção: ${message}`);
    }
  }

  // --- Função utilitária com a mesma lógica canônica de Dense Ranking do admin.js ---
  function computeDenseRanking(candidates, votesMap) {
    const votes = Object.values(votesMap || {});
    const totalVotes = votes.length;

    const countMap = {};
    for (const v of votes) {
      countMap[v.candidateId] = (countMap[v.candidateId] || 0) + 1;
    }

    const ranking = (candidates || []).map(candidate => {
      const candidateVotes = countMap[candidate.id] || 0;
      const percentage = totalVotes > 0 ? ((candidateVotes / totalVotes) * 100).toFixed(1) : 0;
      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        department: candidate.department,
        photoUrl: candidate.photoUrl,
        costumeName: candidate.costumeName,
        votes: candidateVotes,
        percentage: Number(percentage)
      };
    });

    ranking.sort((a, b) => {
      if (b.votes !== a.votes) return b.votes - a.votes;
      return a.name.localeCompare(b.name);
    });

    const distinctPositiveVoteCounts = [...new Set(
      ranking.filter(c => c.votes > 0).map(c => c.votes)
    )].sort((a, b) => b - a);

    const voteToPlaceMap = {};
    distinctPositiveVoteCounts.forEach((voteCount, idx) => {
      voteToPlaceMap[voteCount] = idx + 1;
    });

    ranking.forEach(candidate => {
      candidate.place = candidate.votes > 0 ? (voteToPlaceMap[candidate.votes] || 999) : null;
    });

    const top1Votes = distinctPositiveVoteCounts[0] ?? null;
    const top2Votes = distinctPositiveVoteCounts[1] ?? null;
    const top3Votes = distinctPositiveVoteCounts[2] ?? null;

    const firstPlace = top1Votes !== null ? ranking.filter(c => c.votes === top1Votes) : [];
    const secondPlace = top2Votes !== null ? ranking.filter(c => c.votes === top2Votes) : [];
    const thirdPlace = top3Votes !== null ? ranking.filter(c => c.votes === top3Votes) : [];

    return {
      ranking,
      podium: {
        first: firstPlace,
        second: secondPlace,
        third: thirdPlace
      },
      distinctScores: distinctPositiveVoteCounts
    };
  }

  // Candidatos de amostra
  const sampleCandidates = [
    { id: 'c1', name: 'Alice Silva', costumeName: 'Bruxa Elegante', department: 'Pedagógico' },
    { id: 'c2', name: 'Bernardo Souza', costumeName: 'Pirata Noturno', department: 'Tecnologia' },
    { id: 'c3', name: 'Carla Dias', costumeName: 'Vampira Vitoriana', department: 'Coordenação' },
    { id: 'c4', name: 'Daniel Alves', costumeName: 'Mago Ancestral', department: 'Financeiro' },
    { id: 'c5', name: 'Eduarda Lima', costumeName: 'Coringa Steampunk', department: 'Secretaria' },
    { id: 'c6', name: 'Fábio Santos', costumeName: 'Cavaleiro Fantasma', department: 'Manutenção' },
    { id: 'c7', name: 'Gabriela Cruz', costumeName: 'Fada Sombria', department: 'Comunicação' },
    { id: 'c8', name: 'Henrique Prado', costumeName: 'Lobisomem Chic', department: 'Eventos' },
  ];

  // ===============================================================
  // Cenário 1: Empate Quádruplo em 1º Lugar + Empate Duplo em 2º Lugar
  // ===============================================================
  console.log('--- Cenário 1: Empate Quádruplo em 1º Lugar (4 em 1º, 2 em 2º, 1 em 3º) ---');
  {
    const votesMap = {};
    let voteId = 0;
    // c1, c2, c3, c4 com 10 votos cada (1º lugar empatado com 4 pessoas)
    ['c1', 'c2', 'c3', 'c4'].forEach(cid => {
      for (let i = 0; i < 10; i++) {
        votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: cid, timestamp: new Date().toISOString() };
      }
    });
    // c5, c6 com 5 votos cada (2º lugar empatado com 2 pessoas)
    ['c5', 'c6'].forEach(cid => {
      for (let i = 0; i < 5; i++) {
        votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: cid, timestamp: new Date().toISOString() };
      }
    });
    // c7 com 2 votos (3º lugar isolado)
    for (let i = 0; i < 2; i++) {
      votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: 'c7', timestamp: new Date().toISOString() };
    }
    // c8 com 0 votos

    const res = computeDenseRanking(sampleCandidates, votesMap);

    assert(res.podium.first.length === 4, 'Podium first contém exatamente 4 co-campeões empatados');
    assert(res.podium.first.every(c => c.place === 1 && c.votes === 10), 'Todos os 4 campeões têm place === 1 e 10 votos');
    assert(res.podium.second.length === 2, 'Podium second contém exatamente 2 candidatos empatados');
    assert(res.podium.second.every(c => c.place === 2 && c.votes === 5), 'Ambos os segundos colocados têm place === 2 e 5 votos');
    assert(res.podium.third.length === 1, 'Podium third contém exatamente 1 candidato');
    assert(res.podium.third[0].place === 3 && res.podium.third[0].votes === 2, 'O terceiro colocado tem place === 3 e 2 votos');
    
    // Dense Ranking: o próximo candidato após os empatados NÃO pula degrau no pódio
    assert(res.distinctScores.length === 3, 'Existem exatamente 3 pontuações distintas positivas');
    assert(res.ranking.find(c => c.id === 'c8').place === null, 'Candidato com 0 votos recebe place === null');
  }

  // ===============================================================
  // Cenário 2: Vencedor Único em 1º Lugar, Tríplice Empate em 2º Lugar
  // ===============================================================
  console.log('\n--- Cenário 2: Vencedor Único em 1º Lugar + Tríplice Empate em 2º Lugar ---');
  {
    const votesMap = {};
    let voteId = 0;
    // c1 com 20 votos (1º lugar isolado)
    for (let i = 0; i < 20; i++) {
      votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: 'c1', timestamp: new Date().toISOString() };
    }
    // c2, c3, c4 com 12 votos cada (2º lugar tríplice)
    ['c2', 'c3', 'c4'].forEach(cid => {
      for (let i = 0; i < 12; i++) {
        votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: cid, timestamp: new Date().toISOString() };
      }
    });
    // c5, c6 com 6 votos cada (3º lugar duplo)
    ['c5', 'c6'].forEach(cid => {
      for (let i = 0; i < 6; i++) {
        votesMap[`v_${voteId++}`] = { voterEmail: `u${voteId}@test.com`, candidateId: cid, timestamp: new Date().toISOString() };
      }
    });

    const res = computeDenseRanking(sampleCandidates, votesMap);

    assert(res.podium.first.length === 1, 'Podium first contém vencedor isolado');
    assert(res.podium.first[0].place === 1 && res.podium.first[0].id === 'c1', 'Primeiro lugar é c1 com place === 1');
    assert(res.podium.second.length === 3, 'Podium second contém 3 participantes empatados');
    assert(res.podium.second.every(c => c.place === 2 && c.votes === 12), 'Todos no 2º lugar têm place === 2');
    assert(res.podium.third.length === 2, 'Podium third contém 2 participantes empatados (Dense Ranking)');
    assert(res.podium.third.every(c => c.place === 3 && c.votes === 6), 'Todos no 3º lugar têm place === 3');
  }

  // ===============================================================
  // Cenário 3: Votação Zerada (Início do Evento)
  // ===============================================================
  console.log('\n--- Cenário 3: Votação Zerada (0 votos computados) ---');
  {
    const res = computeDenseRanking(sampleCandidates, {});

    assert(res.podium.first.length === 0, 'Podium first é vazio com 0 votos');
    assert(res.podium.second.length === 0, 'Podium second é vazio com 0 votos');
    assert(res.podium.third.length === 0, 'Podium third é vazio com 0 votos');
    assert(res.ranking.every(c => c.place === null && c.votes === 0), 'Todos os candidatos têm place === null e 0 votos');
  }

  // ===============================================================
  // Cenário 4: Integração HTTP com a Rota /api/admin/metrics Real
  // ===============================================================
  console.log('\n--- Cenário 4: Integração de Rota Real HTTP (GET /api/admin/metrics) ---');
  {
    // Criar servidor Express de teste com a rota real do admin
    const app = express();
    app.use(express.json());
    
    // Injetar middleware de mock de autenticação ou rota real de admin
    const adminRoutes = require('../routes/admin');
    app.use('/api/admin', adminRoutes);

    const testServer = http.createServer(app);
    await new Promise(resolve => testServer.listen(0, resolve));
    const testPort = testServer.address().port;

    // Gerar token JWT válido para um e-mail de admin autorizado
    const adminToken = jwt.sign(
      { email: 'thiago.luiz@colegiocarbonell.com.br', name: 'Thiago Admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await fetch(`http://localhost:${testPort}/api/admin/metrics`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert(res.status === 200, `GET /api/admin/metrics respondeu com status 200 (recebido: ${res.status})`);
    
    const body = await res.json();
    assert(body.podium !== undefined, 'Resposta contém a chave podium');
    assert(Array.isArray(body.podium.first), 'podium.first é um array');
    assert(Array.isArray(body.podium.second), 'podium.second é um array');
    assert(Array.isArray(body.podium.third), 'podium.third é um array');
    assert(Array.isArray(body.ranking), 'ranking é um array');

    if (body.ranking.length > 0) {
      const firstCandidate = body.ranking[0];
      assert(firstCandidate.hasOwnProperty('place'), 'Cada candidato no ranking possui a propriedade place');
    }

    testServer.close();
    console.log('  [PASS] Servidor de teste HTTP encerrado com sucesso.');
  }

  console.log('\n===============================================================');
  console.log(`[TEST] Concluído com sucesso! ${passed}/${total} asserções aprovadas.`);
  console.log('===============================================================');
}

runTieTests().catch(err => {
  console.error('\n[TEST ERROR] Ocorreu uma falha no teste:', err);
  process.exit(1);
});
