import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import VotingPage from './pages/VotingPage';
import AdminPage from './pages/AdminPage';
import RevealPage from './pages/RevealPage';
import LoginPage from './pages/LoginPage';
import { 
  getStoredUser, 
  setStoredUser, 
  setStoredToken, 
  fetchStatus, 
  fetchCandidates, 
  castVote 
} from './api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentTab, setCurrentTab] = useState('voting'); // 'voting' | 'admin' | 'reveal'
  const [votingStatus, setVotingStatus] = useState('open');
  const [currentVote, setCurrentVote] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregamento de candidatos sob demanda estritamente condicionado à presença de usuário autenticado
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadCandidates() {
      setLoading(true);
      try {
        const candidatesRes = await fetchCandidates();
        if (isMounted) {
          setCandidates(candidatesRes || []);
        }
      } catch (err) {
        console.error('Erro ao carregar participantes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCandidates();
    return () => { isMounted = false; };
  }, [user]);

  // Polling leve e periódico exclusivo para o status da votação (a cada 12 segundos)
  const syncStatus = useCallback(async () => {
    try {
      const statusRes = await fetchStatus();
      setVotingStatus(statusRes.status);
      setCurrentVote(statusRes.userVote);
    } catch (err) {
      console.error('Erro ao consultar status:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const poll = async () => {
      try {
        const statusRes = await fetchStatus();
        if (isMounted) {
          setVotingStatus(statusRes.status);
          setCurrentVote(statusRes.userVote);
        }
      } catch (err) {
        console.error('Erro ao consultar status:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 12000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleCastVote = async (candidateId) => {
    const res = await castVote(candidateId);
    await syncStatus();
    return res;
  };

  const handleLogout = () => {
    setStoredUser(null);
    setStoredToken(null);
    setUser(null);
    setCandidates([]);
    setCurrentVote(null);
    if (currentTab === 'admin' || currentTab === 'reveal') {
      setCurrentTab('voting');
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    syncStatus();
  };

  // Listener de auto-recovery para sessão expirada (disparado pelo interceptor 401 de api.js)
  useEffect(() => {
    const handleSessionExpired = () => {
      setStoredUser(null);
      setStoredToken(null);
      setUser(null);
      setCandidates([]);
      setCurrentVote(null);
    };

    window.addEventListener('carbonell:session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('carbonell:session-expired', handleSessionExpired);
    };
  }, []);

  // Barreira de entrada estrita: se não há usuário autenticado, renderiza exclusivamente a LoginPage no padrão cv-face
  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Proteção declarativa: abas admin e reveal restritas exclusivamente a administradores
  const activeTab = (!user?.isAdmin && (currentTab === 'admin' || currentTab === 'reveal'))
    ? 'voting'
    : currentTab;

  // Se em Modo Telão, renderiza visão imersiva de apresentador exclusivamente para administradores autorizados
  if (activeTab === 'reveal' && user?.isAdmin) {
    return <RevealPage onBack={() => setCurrentTab('admin')} />;
  }

  return (
    <div className="min-h-screen bg-carbonell-bg text-carbonell-navy flex flex-col selection:bg-carbonell-yellow selection:text-carbonell-navy overflow-x-hidden w-full max-w-full">
      <Navbar
        user={user}
        status={votingStatus}
        currentTab={activeTab}
        setCurrentTab={setCurrentTab}
        onOpenLogin={() => {}}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {loading && candidates.length === 0 ? (
          <div className="py-24 text-center">
            <div className="inline-block w-8 h-8 border-4 border-carbonell-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-carbonell-secondary text-sm mt-3 font-medium">Carregando participantes da festa...</p>
          </div>
        ) : activeTab === 'admin' && user?.isAdmin ? (
          <AdminPage onOpenReveal={() => setCurrentTab('reveal')} />
        ) : (
          <VotingPage
            candidates={candidates}
            user={user}
            votingStatus={votingStatus}
            currentVote={currentVote}
            onCastVote={handleCastVote}
            onOpenLogin={() => {}}
          />
        )}
      </main>

      <footer className="py-6 border-t border-carbonell-border text-center text-xs text-carbonell-secondary bg-white">
        <p className="font-semibold text-carbonell-navy">Colégio Carbonell • Festa de Confraternização</p>
        <p className="mt-1 text-[11px] text-carbonell-secondary">
          Votação individual e auditável com conta Google institucional
        </p>
      </footer>
    </div>
  );
}
