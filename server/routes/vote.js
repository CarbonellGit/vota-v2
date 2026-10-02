const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getConfig, getCandidates, getVoteByEmail, castVoteAtomic } = require('../db');
const { authMiddleware } = require('./auth');
const rateLimit = require('express-rate-limit');

const JWT_SECRET = process.env.JWT_SECRET || 'carbonell-super-secret-festa-2026';

// Limitador de submissão de voto indexado pelo e-mail do colaborador autenticado (protegendo redes Wi-Fi coletivas)
const submitVoteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => (req.user?.email ? req.user.email.toLowerCase().trim() : req.ip),
  validate: { keyGeneratorIpFallback: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Você atingiu o limite de tentativas de voto por minuto. Aguarde alguns instantes.' }
});

/**
 * GET /api/vote/candidates
 * Lists all registered candidates (sanitized, without showing vote counts)
 */
router.get('/candidates', authMiddleware, async (req, res) => {
  try {
    const candidates = await getCandidates();
    const safeCandidates = (candidates || []).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      photoUrl: c.photoUrl,
      department: c.department || '',
      costumeName: c.costumeName || ''
    }));
    res.json(safeCandidates);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar candidatos: ' + err.message });
  }
});

/**
 * GET /api/vote/status
 * Returns current voting lifecycle state and authenticated user's current vote
 * FinOps: Usa getVoteByEmail para leitura pontual de 1 doc (ou 0 se anônimo), eliminando varreduras completas.
 */
router.get('/status', async (req, res) => {
  try {
    let voterEmail = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.email) {
          voterEmail = decoded.email.toLowerCase().trim();
        }
      } catch (e) {
        // Ignora erro de token para rota pública de status
      }
    }

    const [config, candidates, userVoteRecord] = await Promise.all([
      getConfig(),
      getCandidates(),
      voterEmail ? getVoteByEmail(voterEmail) : Promise.resolve(null)
    ]);

    res.json({
      status: config.status, // 'waiting' | 'open' | 'closed'
      title: config.title,
      allowVoteChange: config.allowVoteChange,
      totalCandidates: (candidates || []).length,
      userVote: userVoteRecord ? {
        candidateId: userVoteRecord.candidateId,
        timestamp: userVoteRecord.timestamp
      } : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar status: ' + err.message });
  }
});

/**
 * POST /api/vote
 * Cast or update a vote with atomic resilience
 */
router.post('/', authMiddleware, submitVoteLimiter, async (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) {
    return res.status(400).json({ error: 'Candidato não informado' });
  }

  try {
    const candidates = await getCandidates();
    const candidate = (candidates || []).find(c => c.id === candidateId);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidato não encontrado' });
    }

    const voterEmail = req.user.email.toLowerCase().trim();
    const result = await castVoteAtomic({
      voterEmail,
      candidateId,
      voterName: req.user.name
    });

    return res.json({
      success: true,
      message: result.isUpdate ? 'Seu voto foi atualizado com sucesso!' : 'Voto registrado com sucesso!',
      candidate: {
        id: candidate.id,
        name: candidate.name
      }
    });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ error: err.message });
  }
});

module.exports = router;
