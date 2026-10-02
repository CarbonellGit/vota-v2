const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, getCandidates, getVotes, resetVotes, saveCandidates, invalidateCandidateCache, invalidateConfigCache } = require('../db');
const { adminMiddleware } = require('./auth');
const { syncCandidatesFromPhotosDir } = require('../services/candidateSync');

// All routes here require admin access
router.use(adminMiddleware);

/**
 * GET /api/admin/metrics
 * Comprehensive metrics and ranking for organizers with STRICT VOTE SECRECY
 */
router.get('/metrics', async (req, res) => {
  try {
    const [config, candidates, votesMap] = await Promise.all([
      getConfig(),
      getCandidates(),
      getVotes()
    ]);

    const votes = Object.values(votesMap || {});
    const totalVotes = votes.length;

    // Count votes per candidate (aggregated)
    const countMap = {};
    for (const v of votes) {
      countMap[v.candidateId] = (countMap[v.candidateId] || 0) + 1;
    }

    // Build ranking
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

    // Sort descending by votes, then by name for consistent deterministic order
    ranking.sort((a, b) => {
      if (b.votes !== a.votes) return b.votes - a.votes;
      return a.name.localeCompare(b.name);
    });

    // Compute Dense Ranking (place: 1, 2, 3...)
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

    // Dense Podium Groups (1º, 2º e 3º lugares agrupados)
    const top1Votes = distinctPositiveVoteCounts[0] ?? null;
    const top2Votes = distinctPositiveVoteCounts[1] ?? null;
    const top3Votes = distinctPositiveVoteCounts[2] ?? null;

    const firstPlace = top1Votes !== null ? ranking.filter(c => c.votes === top1Votes) : [];
    const secondPlace = top2Votes !== null ? ranking.filter(c => c.votes === top2Votes) : [];
    const thirdPlace = top3Votes !== null ? ranking.filter(c => c.votes === top3Votes) : [];

    const podium = {
      first: firstPlace,
      second: secondPlace,
      third: thirdPlace
    };

    // Audit Attendance list (STRICTLY ANONYMOUS: voter presence only, NEVER reveals candidate)
    const auditAttendance = [...votes]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50)
      .map(v => ({
        voterName: v.voterName || (v.voterEmail ? v.voterEmail.split('@')[0] : 'Colaborador'),
        voterEmail: v.voterEmail,
        timestamp: v.timestamp
      }));

    res.json({
      status: config.status,
      title: config.title,
      totalVotes,
      totalCandidates: (candidates || []).length,
      ranking,
      podium,
      auditAttendance,
      // Backward-compatibility alias sem vínculo nominal de candidato
      recentVotes: auditAttendance
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao compilar métricas: ' + err.message });
  }
});

/**
 * POST /api/admin/status
 * Changes voting status ('waiting', 'open', 'closed')
 */
router.post('/status', async (req, res) => {
  const { status } = req.body;
  if (!['waiting', 'open', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido. Use waiting, open ou closed.' });
  }

  try {
    const updated = await updateConfig({ status });
    invalidateConfigCache();
    res.json({
      success: true,
      status: updated.status,
      message: `Status da votação alterado para: ${status.toUpperCase()}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar status: ' + err.message });
  }
});

/**
 * POST /api/admin/sync
 * Scans server/photos folder and syncs candidates
 */
router.post('/sync', async (req, res) => {
  try {
    const result = await syncCandidatesFromPhotosDir();
    res.json({
      success: true,
      message: `Sincronização concluída. ${result.added} fotos processadas. Total: ${result.total} participantes.`,
      result
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao sincronizar fotos: ' + err.message });
  }
});

/**
 * POST /api/admin/reset-votes
 * Resets all votes (clears votes collection / map)
 */
router.post('/reset-votes', async (req, res) => {
  const { confirmation } = req.body || {};
  if (confirmation !== 'ZERAR_VOTOS_CONFIRMAR') {
    return res.status(400).json({
      error: 'Confirmação inválida. Digite exatamente ZERAR_VOTOS_CONFIRMAR para resetar.'
    });
  }

  try {
    await resetVotes();
    res.json({
      success: true,
      message: 'Todos os votos foram zerados com sucesso.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao zerar votos: ' + err.message });
  }
});

/**
 * POST /api/admin/add-candidate
 * Allows manually adding a candidate from the Admin panel
 */
router.post('/add-candidate', async (req, res) => {
  const { name, email, department, photoUrl, costumeName } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e E-mail são obrigatórios' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.endsWith('@colegiocarbonell.com.br')) {
    return res.status(400).json({ error: 'O e-mail deve pertencer a @colegiocarbonell.com.br' });
  }

  try {
    const candidates = await getCandidates();
    const existing = (candidates || []).find(c => c.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'Já existe um participante cadastrado com este e-mail' });
    }

    const crypto = require('crypto');
    const newCandidate = {
      id: `c_${crypto.createHash('md5').update(normalizedEmail).digest('hex').slice(0, 12)}`,
      name: name.trim(),
      email: normalizedEmail,
      department: department ? department.trim() : 'Colégio Carbonell',
      photoUrl: photoUrl && photoUrl.trim() ? photoUrl.trim() : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random`,
      costumeName: costumeName ? costumeName.trim() : ''
    };

    const updatedList = [...candidates, newCandidate];
    await saveCandidates(updatedList);

    res.json({
      success: true,
      message: 'Participante adicionado com sucesso',
      candidate: newCandidate
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao adicionar participante: ' + err.message });
  }
});

module.exports = router;
