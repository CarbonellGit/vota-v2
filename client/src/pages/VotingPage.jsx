import React, { useState, useMemo } from 'react';
import { Search, Sparkles, AlertCircle, CheckCircle2, Clock, Users, X } from 'lucide-react';
import CandidateCard from '../components/CandidateCard';
import VoteModal from '../components/VoteModal';

export default function VotingPage({
  candidates,
  user,
  votingStatus,
  currentVote,
  onCastVote,
  onOpenLogin
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Filter candidates by name or costume
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return candidates;
    const term = searchTerm.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.costumeName && c.costumeName.toLowerCase().includes(term)) ||
        (c.department && c.department.toLowerCase().includes(term))
    );
  }, [candidates, searchTerm]);

  const handleSelectCandidate = (candidate) => {
    if (!user) {
      onOpenLogin();
      return;
    }
    setSelectedCandidate(candidate);
  };

  const handleConfirmVote = async (candidateId) => {
    setIsSubmitting(true);
    try {
      const res = await onCastVote(candidateId);
      setSelectedCandidate(null);
      setToastMessage({ type: 'success', text: res.message || 'Voto registrado com sucesso!' });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Erro ao registrar voto' });
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find candidate voted by the user to display banner
  const votedCandidate = candidates.find((c) => c.id === currentVote?.candidateId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      
      {/* Toast Notification centralizado no mobile */}
      {toastMessage && (
        <div
          className={`fixed top-20 inset-x-4 max-w-sm mx-auto sm:right-4 sm:left-auto sm:max-w-md z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-white text-emerald-800 border-emerald-300'
              : 'bg-white text-red-700 border-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Header compacto no mobile */}
      <div className="text-center mb-6 sm:mb-8 relative pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#2b3a6c]/10 border border-[#2b3a6c]/20 text-[#2b3a6c] text-xs font-bold mb-2.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#f7b53b]" />
          Festa de Confraternização Colégio Carbonell
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#1e2a4d] tracking-tight">
          Votação do Melhor Traje
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto mt-1.5">
          Veja a foto de cada colega, reconheça quem está por trás de cada personagem e vote no seu traje favorito!
        </p>

        {/* Voting Status Alert Banner */}
        {votingStatus === 'waiting' && (
          <div className="mt-4 sm:mt-5 max-w-lg mx-auto p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center gap-2.5 text-amber-900 text-xs sm:text-sm font-medium shadow-xs">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>A votação ainda não começou! Aguarde o anúncio no palco da festa.</span>
          </div>
        )}

        {votingStatus === 'closed' && (
          <div className="mt-4 sm:mt-5 max-w-lg mx-auto p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center gap-2.5 text-red-800 text-xs sm:text-sm font-medium shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>A votação foi encerrada! Acompanhe a revelação no telão.</span>
          </div>
        )}

        {/* Banner de Simulação de Dev para Teste de Empates */}
        {import.meta.env.DEV && (
          <div className="mt-4 sm:mt-5 max-w-lg mx-auto p-3 sm:p-3.5 rounded-2xl bg-[#f7b53b]/15 border border-[#f7b53b]/40 flex items-center justify-center gap-2 text-[#1e2a4d] text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-[#f7b53b] shrink-0" />
            <span>Modo Teste Dev Ativo: você pode votar em múltiplos colegas para simular empates!</span>
          </div>
        )}

        {/* User's current vote indicator banner */}
        {user && votedCandidate && (
          <div className="mt-4 sm:mt-5 max-w-lg mx-auto p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-[#f7b53b] flex items-center justify-between gap-3 text-[#1e2a4d] text-xs sm:text-sm shadow-sm">
            <div className="flex items-center gap-2.5 text-left">
              <CheckCircle2 className="w-5 h-5 text-[#f7b53b] shrink-0" />
              <div>
                <span>Seu voto atual: <strong className="font-extrabold text-[#1e2a4d]">{votedCandidate.name}</strong></span>
                {votingStatus === 'open' && (
                  <span className="block text-[11px] text-slate-500">
                    Você pode alterar seu voto enquanto a votação estiver aberta.
                  </span>
                )}
              </div>
            </div>
            <img
              src={votedCandidate.photoUrl}
              alt={votedCandidate.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#f7b53b] shrink-0 shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Search and Filters Bar com 16px no mobile (sem auto-zoom iOS) e botão X */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar colega pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-gray-300 text-[#1e2a4d] placeholder-gray-400 text-base sm:text-sm focus:outline-none focus:border-[#2b3a6c] focus:ring-1 focus:ring-[#2b3a6c] shadow-xs transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Limpar pesquisa"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 self-end sm:self-center">
          <Users className="w-4 h-4 text-slate-400" />
          <span>
            Exibindo <strong className="text-[#1e2a4d]">{filteredCandidates.length}</strong> de {candidates.length} colaboradores
          </span>
        </div>
      </div>

      {/* Candidates Grid */}
      {filteredCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <p className="text-slate-500 text-sm">
            Nenhum colaborador encontrado com o termo "<span className="text-[#1e2a4d] font-bold">{searchTerm}</span>".
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-3 text-xs text-[#2b3a6c] underline font-bold hover:text-[#1e2a4d]"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              currentUser={user}
              currentVoteId={currentVote?.candidateId}
              votingStatus={votingStatus}
              onSelectVote={handleSelectCandidate}
            />
          ))}
        </div>
      )}

      {/* Vote Confirmation Modal */}
      {selectedCandidate && (
        <VoteModal
          candidate={selectedCandidate}
          isChangingVote={Boolean(currentVote && currentVote.candidateId !== selectedCandidate.id)}
          onConfirm={handleConfirmVote}
          onClose={() => setSelectedCandidate(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
