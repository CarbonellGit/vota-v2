const API_BASE = '/api';

export function getStoredToken() {
  return localStorage.getItem('carbonell_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('carbonell_token', token);
  } else {
    localStorage.removeItem('carbonell_token');
  }
}

export function getStoredUser() {
  const user = localStorage.getItem('carbonell_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('carbonell_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('carbonell_user');
  }
}

export function authHeader() {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function handleUnauthorized() {
  setStoredToken(null);
  setStoredUser(null);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('carbonell:session-expired', {
      detail: { message: 'Sua sessão expirou. Conecte-se novamente com sua conta institucional.' }
    }));
  }
}

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/vote/status`, {
    headers: { ...authHeader() }
  });
  if (res.status === 401) {
    handleUnauthorized();
  }
  if (!res.ok) throw new Error('Falha ao obter status');
  return res.json();
}

export async function fetchCandidates() {
  const res = await fetch(`${API_BASE}/vote/candidates`, {
    headers: { ...authHeader() }
  });
  if (!res.ok) throw new Error('Falha ao carregar participantes');
  return res.json();
}

export async function castVote(candidateId) {
  const isDev = import.meta.env.DEV;
  const res = await fetch(`${API_BASE}/vote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isDev ? { 'X-Dev-Multi-Vote': 'true' } : {}),
      ...authHeader()
    },
    body: JSON.stringify({
      candidateId,
      ...(isDev ? { isDevMultiVote: true } : {})
    })
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sua sessão expirou. Conecte-se novamente com sua conta institucional.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao registrar voto');
  }
  return data;
}

export async function googleLogin(credential) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha no login com Google');
  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function devLogin(email, name) {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Falha no login de teste');
  setStoredToken(data.token);
  setStoredUser(data.user);
  return data;
}

export async function fetchAdminMetrics() {
  const res = await fetch(`${API_BASE}/admin/metrics`, {
    headers: { ...authHeader() }
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sua sessão expirou. Conecte-se novamente com sua conta institucional.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao carregar métricas');
  return data;
}

export async function updateAdminStatus(status) {
  const res = await fetch(`${API_BASE}/admin/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify({ status })
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sua sessão expirou. Conecte-se novamente com sua conta institucional.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao atualizar status');
  return data;
}

export async function syncPhotos() {
  const res = await fetch(`${API_BASE}/admin/sync`, {
    method: 'POST',
    headers: { ...authHeader() }
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sua sessão expirou. Conecte-se novamente com sua conta institucional.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar');
  return data;
}

export async function resetVotes(confirmation) {
  const res = await fetch(`${API_BASE}/admin/reset-votes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify({ confirmation })
  });
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Sua sessão expirou. Conecte-se novamente com sua conta institucional.');
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao resetar votos');
  return data;
}
