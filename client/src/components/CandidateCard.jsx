import React from 'react';
import { CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function CandidateCard({
  candidate,
  currentUser,
  currentVoteId,
  votingStatus,
  onSelectVote
}) {
  const isSelf = currentUser && candidate.email && 
    currentUser.email.toLowerCase().trim() === candidate.email.toLowerCase().trim();
  
  const isDev = import.meta.env.DEV;
  const isVotedForThis = currentVoteId === candidate.id;
  const hasVotedElsewhere = currentVoteId && !isVotedForThis;
  const isOpen = votingStatus === 'open';

  return (
    <div
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white transition-all duration-300 ${
        isVotedForThis
          ? 'border-2 border-[#f7b53b] ring-2 ring-[#f7b53b]/50 shadow-lg scale-[1.01]'
          : 'border border-gray-200 hover:border-gray-300 hover:shadow-md'
      }`}
    >
      {/* Top badges */}
      <div className="absolute top-2.5 inset-x-2.5 z-10 flex items-center justify-between gap-1.5 pointer-events-none">
        {isVotedForThis && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f7b53b] text-[#1e2a4d] font-black text-[11px] sm:text-xs uppercase tracking-wide shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1e2a4d]" />
            {isDev ? 'Votado (Dev)' : 'Seu Voto Atual'}
          </span>
        )}

        {isSelf && (
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-[#1e2a4d] border border-gray-200 text-[11px] font-bold backdrop-blur-md shadow-xs">
            <AlertCircle className="w-3 h-3 text-[#f7b53b]" />
            Você
          </span>
        )}
      </div>

      {/* Photo Container com enquadramento facial nítido (object-cover) */}
      <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-gradient-to-b from-[#141d36] to-[#1e2a4d] flex items-center justify-center">
        <img
          src={candidate.photoUrl}
          alt={candidate.name}
          loading="lazy"
          className="relative z-1 w-full h-full object-cover object-top sm:object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            // Fallback avatar com cores institucionais
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=500&background=2b3a6c&color=ffffff`;
          }}
        />
      </div>

      {/* Card Info & Action */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-[#1e2a4d] group-hover:text-[#2b3a6c] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
            {candidate.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {candidate.department || 'Colégio Carbonell'}
          </p>

          {/* Etiqueta do traje posicionada abaixo do nome (desobstruindo a foto) */}
          {candidate.costumeName && (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2b3a6c]/10 text-[#2b3a6c] border border-[#2b3a6c]/20 text-[11px] font-bold max-w-full">
                <Sparkles className="w-3 h-3 text-[#f7b53b] shrink-0" />
                <span className="truncate">{candidate.costumeName}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <div className="mt-3.5">
          {!isOpen ? (
            <button
              disabled
              className="w-full py-2.5 px-3 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed border border-gray-200 min-h-[44px]"
            >
              {votingStatus === 'closed' ? 'Votação Encerrada' : 'Aguardando Abertura'}
            </button>
          ) : isVotedForThis && !isDev ? (
            <div className="w-full py-2.5 px-3 rounded-xl bg-amber-50 border border-[#f7b53b] text-[#1e2a4d] text-xs sm:text-sm font-bold text-center flex items-center justify-center gap-1.5 shadow-xs min-h-[44px]">
              <CheckCircle2 className="w-4 h-4 text-[#f7b53b]" />
              Traje Votado
            </div>
          ) : (
            <button
              onClick={() => onSelectVote(candidate)}
              className={`w-full py-2.5 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] ${
                isDev && isVotedForThis
                  ? 'bg-[#f7b53b] hover:bg-[#e6a52a] text-[#1e2a4d]'
                  : hasVotedElsewhere && !isDev
                  ? 'bg-white hover:bg-slate-50 text-[#2b3a6c] border-2 border-[#2b3a6c] hover:border-[#1e2a4d]'
                  : 'bg-[#2b3a6c] hover:bg-[#1e2a4d] text-white hover:scale-102'
              }`}
            >
              {isDev ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#1e2a4d] shrink-0" />
                  <span>Votar {isVotedForThis ? 'Novamente (+1)' : '(+1 Dev)'}</span>
                </>
              ) : hasVotedElsewhere ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Trocar Voto</span>
                  <span className="hidden sm:inline">Mudar voto para cá</span>
                </>
              ) : (
                'Votar'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
