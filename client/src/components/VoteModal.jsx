import React from 'react';
import { AlertCircle, Check, X, RefreshCw, Sparkles } from 'lucide-react';

export default function VoteModal({
  candidate,
  isChangingVote,
  onConfirm,
  onClose,
  isSubmitting
}) {
  if (!candidate) return null;
  const isDev = import.meta.env.DEV;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto max-h-[90dvh]">
        
        {/* Top Accent Stripe idêntica ao LMS */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e2a4d] via-[#2b3a6c] to-[#f7b53b]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#1e2a4d] rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-5 mt-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#2b3a6c]/10 text-[#2b3a6c] mb-3 border border-[#2b3a6c]/20">
            {isDev ? <Sparkles className="w-6 h-6 text-[#f7b53b]" /> : isChangingVote ? <RefreshCw className="w-6 h-6" /> : <Check className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-extrabold text-[#1e2a4d]">
            {isDev ? 'Voto de Teste (Simulação)' : isChangingVote ? 'Alterar seu Voto' : 'Confirmar Voto'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {isDev
              ? 'Modo Dev: Este voto será somado aos votos do participante para simular empates.'
              : isChangingVote
              ? 'Você já havia votado antes. Deseja transferir seu voto?'
              : 'Você tem direito a 1 voto para o Melhor Traje da festa.'}
          </p>
        </div>

        {/* Candidate preview */}
        <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-gray-200 mb-5">
          <img
            src={candidate.photoUrl}
            alt={candidate.name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-sm"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=200&background=2b3a6c&color=ffffff`;
            }}
          />
          <div>
            <h4 className="font-bold text-[#1e2a4d] text-base leading-snug">
              {candidate.name}
            </h4>
            <p className="text-xs text-slate-500">{candidate.department || 'Colégio Carbonell'}</p>
            {candidate.costumeName && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-[#2b3a6c] bg-[#2b3a6c]/10 px-2 py-0.5 rounded border border-[#2b3a6c]/20">
                <Sparkles className="w-3 h-3 text-[#f7b53b]" />
                {candidate.costumeName}
              </span>
            )}
          </div>
        </div>

        {/* Rule Reminder */}
        <div className="flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-xl mb-6">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {isDev
              ? 'Você pode votar em quantos candidatos quiser para testar empates no pódio (1º, 2º e 3º lugares).'
              : isChangingVote 
              ? 'Ao confirmar, seu voto anterior será substituído e passará a valer para este colega.'
              : 'Se mudar de ideia mais tarde, você poderá alterar seu voto enquanto a votação estiver aberta.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl text-slate-700 bg-white hover:bg-slate-50 border border-gray-300 font-semibold text-sm transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(candidate.id)}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-[#2b3a6c] hover:bg-[#1e2a4d] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 hover:scale-102 min-h-[44px]"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              isDev ? 'Confirmar Voto (+1 Dev)' : isChangingVote ? 'Transferir Voto' : 'Confirmar Voto'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
