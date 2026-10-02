const path = require('path');
const { getFirestore, checkFirestoreAvailable, FieldValue } = require('./firestore');

const PHOTOS_DIR = path.join(__dirname, 'photos');

// Lista oficial de administradores da comissão organizadora
const OFFICIAL_ADMIN_EMAILS = [
  'thiago.luiz@colegiocarbonell.com.br',
  'patricia.santos@colegiocarbonell.com.br',
  'marina.ribeiro@colegiocarbonell.com.br',
  'raquel.favatto@colegiocarbonell.com.br',
  'caroline.costa@colegiocarbonell.com.br'
];

// Configuração padrão da aplicação
const defaultDb = {
  config: {
    status: 'open', // 'waiting' | 'open' | 'closed'
    title: 'Festa de Confraternização - Melhor Traje',
    allowVoteChange: true,
    adminEmails: OFFICIAL_ADMIN_EMAILS
  },
  candidates: [],
  votes: {}
};

// Armazenamento transitório em memória (usado exclusivamente em testes locais quando Firestore/Emulador não estiver ativo)
const memoryStore = {
  config: { ...defaultDb.config },
  candidates: [],
  votes: {}
};

// Cache em memória para candidatos (TTL: 10 minutos) para FinOps e conservação de quotas
let candidateCache = {
  data: null,
  expiresAt: 0
};

function invalidateCandidateCache() {
  candidateCache = { data: null, expiresAt: 0 };
}

// Cache em memória para configuração da aplicação (TTL: 10 segundos)
let configCache = {
  data: null,
  expiresAt: 0
};

function invalidateConfigCache() {
  configCache = { data: null, expiresAt: 0 };
}

// ==========================================
// Funções Unificadas de Acesso a Dados
// ==========================================

async function getConfig(options = {}) {
  const now = Date.now();
  if (!options.forceRefresh && configCache.data && configCache.expiresAt > now) {
    return configCache.data;
  }

  const firestoreReady = await checkFirestoreAvailable();
  let configData = null;

  if (firestoreReady) {
    const db = getFirestore();
    const doc = await db.collection('config').doc('app_state').get();
    if (doc.exists) {
      configData = doc.data();
      // Sincronização defensiva: se a lista de administradores no Firestore estiver desatualizada, atualiza com a oficial
      const currentAdmins = (configData.adminEmails || []).map(e => e.toLowerCase().trim());
      const hasAllAdmins = OFFICIAL_ADMIN_EMAILS.every(e => currentAdmins.includes(e)) && currentAdmins.length === OFFICIAL_ADMIN_EMAILS.length;
      if (!hasAllAdmins) {
        configData.adminEmails = OFFICIAL_ADMIN_EMAILS;
        await db.collection('config').doc('app_state').update({ adminEmails: OFFICIAL_ADMIN_EMAILS });
      }
    } else {
      await db.collection('config').doc('app_state').set(defaultDb.config);
      configData = { ...defaultDb.config };
    }
  } else {
    configData = memoryStore.config || defaultDb.config;
  }

  configCache = {
    data: configData,
    expiresAt: now + 10 * 1000 // 10 segundos
  };

  return configData;
}

async function updateConfig(newConfig) {
  const firestoreReady = await checkFirestoreAvailable();
  let updatedData;
  if (firestoreReady) {
    const db = getFirestore();
    await db.collection('config').doc('app_state').set(newConfig, { merge: true });
    const updatedDoc = await db.collection('config').doc('app_state').get();
    updatedData = updatedDoc.data();
  } else {
    memoryStore.config = { ...memoryStore.config, ...newConfig };
    updatedData = memoryStore.config;
  }

  // Invalida atomicamente o cache de configuração
  invalidateConfigCache();
  return updatedData;
}

async function getCandidates(options = {}) {
  const now = Date.now();
  // Retorna do cache em memória se ainda for válido e não for forçada a atualização
  if (!options.forceRefresh && candidateCache.data && candidateCache.expiresAt > now) {
    return candidateCache.data;
  }

  const firestoreReady = await checkFirestoreAvailable();
  let candidatesList = [];

  if (firestoreReady) {
    const db = getFirestore();
    const snapshot = await db.collection('candidates').orderBy('name').get();
    if (!snapshot.empty) {
      candidatesList = snapshot.docs.map(doc => doc.data());
    }
  } else {
    candidatesList = memoryStore.candidates || [];
  }

  // Atualiza cache em memória com TTL de 10 minutos (600.000 ms)
  candidateCache = {
    data: candidatesList,
    expiresAt: now + 10 * 60 * 1000
  };

  return candidatesList;
}

async function saveCandidates(candidatesList) {
  const firestoreReady = await checkFirestoreAvailable();
  if (firestoreReady) {
    const db = getFirestore();
    const existingSnapshot = await db.collection('candidates').get();
    const newIds = new Set(candidatesList.map(c => c.id));
    const batch = db.batch();

    // Remove do Firestore candidatos que foram excluídos da lista
    existingSnapshot.forEach(doc => {
      if (!newIds.has(doc.id)) {
        batch.delete(doc.ref);
      }
    });

    for (const c of candidatesList) {
      const ref = db.collection('candidates').doc(c.id);
      batch.set(ref, c, { merge: true });
    }
    await batch.commit();
  } else {
    memoryStore.candidates = candidatesList;
  }

  // Invalida e renova cache em memória
  candidateCache = {
    data: candidatesList,
    expiresAt: Date.now() + 10 * 60 * 1000
  };
}

async function getVotes() {
  const firestoreReady = await checkFirestoreAvailable();
  if (firestoreReady) {
    const db = getFirestore();
    const snapshot = await db.collection('votes').get();
    const votesMap = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      votesMap[doc.id] = {
        ...data,
        timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
      };
    });
    return votesMap;
  }

  return memoryStore.votes || {};
}

async function getVoteByEmail(email) {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();
  const firestoreReady = await checkFirestoreAvailable();

  if (firestoreReady) {
    const db = getFirestore();
    const doc = await db.collection('votes').doc(normalizedEmail).get();
    if (doc.exists) {
      const data = doc.data();
      return {
        candidateId: data.candidateId,
        voterEmail: normalizedEmail,
        voterName: data.voterName,
        timestamp: data.timestamp && data.timestamp.toDate ? data.timestamp.toDate().toISOString() : data.timestamp
      };
    }
    return null;
  }

  const vote = memoryStore.votes ? memoryStore.votes[normalizedEmail] : null;
  if (vote) {
    return {
      candidateId: vote.candidateId,
      voterEmail: normalizedEmail,
      voterName: vote.voterName,
      timestamp: vote.timestamp
    };
  }
  return null;
}

async function castVoteAtomic({ voterEmail, candidateId, voterName }) {
  const normalizedEmail = voterEmail.toLowerCase().trim();
  const firestoreReady = await checkFirestoreAvailable();

  if (firestoreReady) {
    const db = getFirestore();
    return await db.runTransaction(async (transaction) => {
      const configDoc = await transaction.get(db.collection('config').doc('app_state'));
      const config = configDoc.exists ? configDoc.data() : defaultDb.config;

      if (config.status !== 'open') {
        const msg = config.status === 'waiting'
          ? 'A votação ainda não foi aberta pela comissão da festa.'
          : 'A votação foi encerrada! Obrigado pela participação.';
        const err = new Error(msg);
        err.statusCode = 400;
        throw err;
      }

      const voteRef = db.collection('votes').doc(normalizedEmail);
      const existingVoteDoc = await transaction.get(voteRef);

      if (existingVoteDoc.exists && !config.allowVoteChange) {
        const err = new Error('Você já votou e a alteração de voto não está habilitada.');
        err.statusCode = 400;
        throw err;
      }

      const voteRecord = {
        candidateId,
        voterEmail: normalizedEmail,
        voterName: voterName || normalizedEmail.split('@')[0],
        timestamp: FieldValue.serverTimestamp()
      };

      transaction.set(voteRef, voteRecord);

      return {
        isUpdate: existingVoteDoc.exists
      };
    });
  }

  // Operação em memória atômica para fallback local
  const config = memoryStore.config || defaultDb.config;
  if (config.status !== 'open') {
    const msg = config.status === 'waiting'
      ? 'A votação ainda não foi aberta pela comissão da festa.'
      : 'A votação foi encerrada! Obrigado pela participação.';
    const err = new Error(msg);
    err.statusCode = 400;
    throw err;
  }

  memoryStore.votes = memoryStore.votes || {};
  const existingVote = memoryStore.votes[normalizedEmail];
  if (existingVote && !config.allowVoteChange) {
    const err = new Error('Você já votou e a alteração de voto não está habilitada.');
    err.statusCode = 400;
    throw err;
  }

  memoryStore.votes[normalizedEmail] = {
    candidateId,
    voterEmail: normalizedEmail,
    voterName: voterName || normalizedEmail.split('@')[0],
    timestamp: new Date().toISOString()
  };

  return { isUpdate: Boolean(existingVote) };
}

async function resetVotes() {
  const firestoreReady = await checkFirestoreAvailable();
  if (firestoreReady) {
    const db = getFirestore();
    const snapshot = await db.collection('votes').get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  memoryStore.votes = {};
}

async function deleteCandidate(candidateId) {
  const firestoreReady = await checkFirestoreAvailable();
  if (firestoreReady) {
    const db = getFirestore();
    await db.collection('candidates').doc(candidateId).delete();
  }

  if (memoryStore.candidates) {
    memoryStore.candidates = memoryStore.candidates.filter(c => c.id !== candidateId);
  }

  invalidateCandidateCache();
}

module.exports = {
  getConfig,
  updateConfig,
  getCandidates,
  saveCandidates,
  deleteCandidate,
  getVotes,
  getVoteByEmail,
  castVoteAtomic,
  resetVotes,
  invalidateCandidateCache,
  invalidateConfigCache,
  PHOTOS_DIR
};
