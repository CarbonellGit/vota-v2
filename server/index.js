const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { router: authRouter } = require('./routes/auth');
const voteRouter = require('./routes/vote');
const adminRouter = require('./routes/admin');
const { PHOTOS_DIR } = require('./db');
const { syncCandidatesFromPhotosDir } = require('./services/candidateSync');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração obrigatória de Proxy para Cloud Run e Firebase Hosting CDN
app.set('trust proxy', 1);

// Middleware CORS com restrição de origens institucionais autorizadas
const allowedOrigins = [
  'https://vota-v2.web.app',
  'https://vota-v2.firebaseapp.com',
  'http://localhost:5174',
  'http://localhost:5173',
  'http://localhost:3002',
  'http://localhost:3000',
  'http://localhost:8080'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem header origin (como chamadas internas do Firebase Hosting, curl, testes)
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida pelo CORS institucional Carbonell'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Rate Limiting Defensivo com consciência de redes locais compartilhadas (Wi-Fi Institucional)
const globalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 300, // Limite confortável para rotas gerais
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const url = req.originalUrl || req.path || '';
    // Isenta polling contínuo de status, catálogo inicial, health checks, autenticação institucional e submissão de voto
    // (a submissão possui o submitVoteLimiter indexado por req.user.email em routes/vote.js)
    if (
      url.includes('/vote/status') ||
      url.includes('/vote/candidates') ||
      url.includes('/health') ||
      url.includes('/status') ||
      url.includes('/auth/google') ||
      url.includes('/auth/dev-login') ||
      (req.method === 'POST' && (url.endsWith('/vote') || url.endsWith('/vote/')))
    ) {
      return true;
    }
    return false;
  },
  message: { error: 'Muitas requisições no momento. Por favor, aguarde alguns segundos.' }
});

app.use('/api', globalApiLimiter);

// Serve static candidate photos locally as fallback (em produção o Firebase Hosting CDN atende diretamente)
app.use('/photos', express.static(PHOTOS_DIR, {
  maxAge: '7d',
  immutable: true,
  etag: true
}));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/vote', voteRouter);
app.use('/api/admin', adminRouter);

// Health check limpo para monitoramento de infraestrutura sem vazamento de estado
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', healthHandler);
app.get('/api/status', healthHandler);

// Inicializa a sincronização inicial de forma assíncrona
syncCandidatesFromPhotosDir().catch(err => {
  console.warn('[Sync] Aviso ao sincronizar fotos na inicialização:', err.message);
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`[Servidor] Votação Colégio Carbonell iniciada com sucesso!`);
    console.log(`[API] URL: http://0.0.0.0:${PORT}`);
    console.log(`[Fotos] Diretório: ${PHOTOS_DIR}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
