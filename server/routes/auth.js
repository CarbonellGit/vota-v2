const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getConfig } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'carbonell-super-secret-festa-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const REQUIRED_DOMAIN = 'colegiocarbonell.com.br';

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const OFFICIAL_ADMIN_EMAILS = [
  'thiago.luiz@colegiocarbonell.com.br',
  'patricia.santos@colegiocarbonell.com.br',
  'marina.ribeiro@colegiocarbonell.com.br',
  'raquel.favatto@colegiocarbonell.com.br',
  'caroline.costa@colegiocarbonell.com.br'
];

async function isUserAdmin(email, configParam) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (!normalizedEmail) return false;

  const config = configParam || await getConfig();
  const configAdmins = (config.adminEmails || []).map(e => e.toLowerCase().trim()).filter(Boolean);
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map(e => e.toLowerCase().trim()).filter(Boolean)
    : [];

  // Considera apenas a lista oficial dos 4 colaboradores autorizados
  const allAdmins = [...new Set([...OFFICIAL_ADMIN_EMAILS, ...configAdmins, ...envAdmins])];
  return allAdmins.includes(normalizedEmail);
}

// Authentication middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida' });
  }
}

// Admin middleware
function adminMiddleware(req, res, next) {
  authMiddleware(req, res, async () => {
    try {
      const config = await getConfig();
      if (await isUserAdmin(req.user.email, config)) {
        req.user.isAdmin = true;
        return next();
      }
      return res.status(403).json({ error: 'Acesso restrito à administração' });
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao validar autorização: ' + err.message });
    }
  });
}

/**
 * POST /api/auth/google
 * Validates Google OAuth ID Token with strict signature verification
 */
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ error: 'Credencial do Google não fornecida' });
  }

  try {
    let email = '';
    let name = '';
    let picture = '';

    if (googleClient && GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      const payload = ticket.getPayload();
      email = (payload.email || '').toLowerCase().trim();
      name = payload.name;
      picture = payload.picture;
    } else {
      // Bloqueio rigoroso de decodificação insegura em produção
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          error: 'GOOGLE_CLIENT_ID não configurado no servidor de produção. Contate a administração.'
        });
      }

      // Apenas permitido em ambiente de desenvolvimento local
      const decoded = jwt.decode(credential);
      if (decoded && decoded.email) {
        email = decoded.email.toLowerCase().trim();
        name = decoded.name || email.split('@')[0];
        picture = decoded.picture || '';
      } else {
        return res.status(400).json({ error: 'Token do Google inválido' });
      }
    }

    // Strictly validate domain
    if (!email.endsWith(`@${REQUIRED_DOMAIN}`)) {
      return res.status(403).json({
        error: `Acesso permitido apenas para contas @${REQUIRED_DOMAIN}. Você tentou entrar com: ${email}`
      });
    }

    const config = await getConfig();
    const isAdmin = await isUserAdmin(email, config);

    const sessionPayload = {
      email,
      name,
      picture,
      isAdmin
    };

    const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      user: sessionPayload
    });
  } catch (err) {
    console.error('Erro na autenticação do Google:', err);
    return res.status(401).json({ error: 'Falha na validação do token Google: ' + err.message });
  }
});

/**
 * POST /api/auth/dev-login
 * Quick login EXCLUSIVELY for local development / testing
 */
router.post('/dev-login', async (req, res) => {
  // BLOQUEIO TOTAL EM PRODUÇÃO
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'Endpoint de desenvolvimento desabilitado em ambiente de produção.'
    });
  }

  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'E-mail obrigatório' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (!normalizedEmail.endsWith(`@${REQUIRED_DOMAIN}`)) {
    return res.status(403).json({
      error: `Apenas e-mails terminados em @${REQUIRED_DOMAIN} são permitidos!`
    });
  }

  const config = await getConfig();
  const isAdmin = await isUserAdmin(normalizedEmail, config);

  const sessionPayload = {
    email: normalizedEmail,
    name: name || normalizedEmail.split('@')[0].replace('.', ' '),
    picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedEmail)}&background=f59e0b&color=fff`,
    isAdmin
  };

  const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '24h' });

  return res.json({
    token,
    user: sessionPayload
  });
});

/**
 * GET /api/auth/me
 * Retrieves current session profile
 */
router.get('/me', authMiddleware, async (req, res) => {
  const config = await getConfig();
  const isAdmin = await isUserAdmin(req.user.email, config);
  return res.json({
    ...req.user,
    isAdmin
  });
});

module.exports = {
  router,
  authMiddleware,
  adminMiddleware,
  isUserAdmin
};
