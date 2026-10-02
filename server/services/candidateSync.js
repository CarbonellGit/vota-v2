const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getCandidates, saveCandidates, PHOTOS_DIR } = require('../db');

function normalizeStr(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function formatDisplayName(rawName) {
  return rawName
    .replace(/_/g, "'")
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase();
      if (['de', 'da', 'do', 'dos', 'das', 'e'].includes(lower)) return lower;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalizes text to extract name and institutional email from photo filename.
 * Rule: primeiro.ultimo@colegiocarbonell.com.br
 */
function parseCandidateFilename(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return null;
  }

  const rawExt = path.extname(filename);
  const nameWithoutExt = path.basename(filename, rawExt).trim();

  // Pattern 1: "Nome Completo - email@colegiocarbonell.com.br"
  if (nameWithoutExt.includes('-')) {
    const parts = nameWithoutExt.split('-');
    const name = formatDisplayName(parts[0].trim());
    const potentialEmail = parts[1].trim().toLowerCase();
    if (potentialEmail.includes('@colegiocarbonell.com.br')) {
      return {
        name,
        email: potentialEmail,
        filename
      };
    }
  }

  // Pattern 2: "email@colegiocarbonell.com.br"
  if (nameWithoutExt.toLowerCase().includes('@colegiocarbonell.com.br')) {
    const email = nameWithoutExt.toLowerCase().trim();
    const prefix = email.split('@')[0];
    const name = prefix
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    return {
      name,
      email,
      filename
    };
  }

  // Pattern 3: "Nome Sobrenome" -> generates primeiro.ultimo@colegiocarbonell.com.br
  const name = formatDisplayName(nameWithoutExt);

  // Specific institutional email disambiguations
  const overrides = {
    'raphael rufatto dos santos': 'raphael.rufatto@colegiocarbonell.com.br',
    'raphael de souza santos': 'raphael.santos@colegiocarbonell.com.br',
    'antonio jose dos santos junior': 'antonio.santos@colegiocarbonell.com.br',
    'wilson jose lourenco junior': 'wilson.lourenco@colegiocarbonell.com.br'
  };

  const normalizedKey = normalizeStr(nameWithoutExt.replace(/_/g, ' '));
  for (const [k, v] of Object.entries(overrides)) {
    if (normalizedKey === normalizeStr(k)) {
      return {
        name,
        email: v,
        filename
      };
    }
  }

  const parts = nameWithoutExt.trim().split(/\s+/);
  const first = parts[0];
  let last = parts[parts.length - 1];

  // If last part is a family suffix (Junior, Filho, etc.), pick previous surname if available
  if (['junior', 'júnior', 'filho', 'neto', 'sobrinho'].includes(last.toLowerCase()) && parts.length > 2) {
    last = parts[parts.length - 2];
  }

  const email = `${normalizeStr(first)}.${normalizeStr(last)}@colegiocarbonell.com.br`;

  return {
    name,
    email,
    filename
  };
}

async function syncCandidatesFromPhotosDir() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    return { added: 0, total: 0 };
  }

  const files = fs.readdirSync(PHOTOS_DIR);
  const foundCandidates = [];

  for (const file of files) {
    const parsed = parseCandidateFilename(file);
    if (parsed) {
      foundCandidates.push({
        id: `c_${crypto.createHash('md5').update(parsed.email.toLowerCase()).digest('hex').slice(0, 12)}`,
        name: parsed.name,
        email: parsed.email,
        photoUrl: `/photos/${encodeURIComponent(parsed.filename)}`,
        department: 'Colégio Carbonell',
        costumeName: ''
      });
    }
  }

  if (foundCandidates.length > 0) {
    const currentCandidates = await getCandidates({ forceRefresh: true });

    // Preserva nomes de traje customizados já cadastrados
    const existingCostumes = new Map();
    for (const c of (currentCandidates || [])) {
      if (c.costumeName) {
        existingCostumes.set(c.email.toLowerCase(), c.costumeName);
      }
    }

    for (const c of foundCandidates) {
      if (existingCostumes.has(c.email.toLowerCase())) {
        c.costumeName = existingCostumes.get(c.email.toLowerCase());
      }
    }

    // Preserva participantes cadastrados manualmente via admin que não possuam arquivo de foto
    const foundEmails = new Set(foundCandidates.map(c => c.email.toLowerCase()));
    for (const c of (currentCandidates || [])) {
      const isManual = c.photoUrl && !c.photoUrl.startsWith('/photos/');
      if (!foundEmails.has(c.email.toLowerCase()) && isManual) {
        foundCandidates.push(c);
      }
    }

    // Ordena alfabeticamente por nome em pt-BR
    foundCandidates.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    await saveCandidates(foundCandidates);
    return { added: foundCandidates.length, total: foundCandidates.length };
  }

  const current = await getCandidates();
  return { added: 0, total: (current || []).length };
}

module.exports = {
  syncCandidatesFromPhotosDir,
  parseCandidateFilename,
  formatDisplayName
};
