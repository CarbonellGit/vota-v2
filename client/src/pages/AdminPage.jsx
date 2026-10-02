import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Clock, 
  RefreshCw, 
  Tv, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FolderSync, 
  Award,
  Trophy,
  Medal,
  Users,
  BarChart3,
  ShieldCheck,
  Loader2,
  X
} from 'lucide-react';
import { fetchAdminMetrics, updateAdminStatus, syncPhotos, resetVotes } from '../api';

export default function AdminPage({ onOpenReveal }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null); // 'status-waiting' | 'status-open' | 'status-closed' | 'sync-photos' | 'reset-votes' | null
  const [message, setMessage] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  const loadMetrics = async () => {
    try {
      const data = await fetchAdminMetrics();
      setMetrics(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;

    const pollMetrics = async () => {
      try {
        const data = await fetchAdminMetrics();
        if (isMounted) {
          setMetrics(data);
        }
      } catch (err) {
        if (isMounted) {
          setMessage({ type: 'error', text: err.message });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          timeoutId = setTimeout(pollMetrics, 8000); // Polling sequencial defensivo a cada 8 segundos
        }
      }
    };

    pollMetrics();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleStatusChange = async (newStatus) => {
    setPendingAction(`status-${newStatus}`);
    try {
      const res = await updateAdminStatus(newStatus);
      setMessage({ type: 'success', text: res.message });
      await loadMetrics();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleSyncPhotos = async () => {
    setPendingAction('sync-photos');
    try {
      const res = await syncPhotos();
      setMessage({ type: 'success', text: res.message });
      await loadMetrics();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPendingAction(null);
    }
  };

  const handleResetVotes = async () => {
    if (resetConfirmText !== 'ZERAR_VOTOS_CONFIRMAR') {
      alert('Digite exatamente ZERAR_VOTOS_CONFIRMAR para confirmar.');
      return;
    }
    setPendingAction('reset-votes');
    try {
      const res = await resetVotes(resetConfirmText);
      setMessage({ type: 'success', text: res.message });
      setResetModalOpen(false);
      setResetConfirmText('');
      await loadMetrics();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setPendingAction(null);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#2b3a6c] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm mt-3 font-medium">Carregando painel de administração...</p>
      </div>
    );
  }

  const leader = metrics?.ranking?.[0];
  const leaders = metrics?.podium?.first || (leader ? [leader] : []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Toast Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-semibold animate-fade-in shadow-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 p-1" title="Fechar">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Banner com Stripe institucional */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e2a4d] via-[#2b3a6c] to-[#f7b53b]" />
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest text-[#2b3a6c]">
              Painel da Comissão
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Controle da Votação</span>
          </div>
          <h2 className="text-2xl font-black text-[#1e2a4d] flex items-center gap-2">
            Status Atual:
            {metrics.status === 'open' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full text-sm font-bold">
                <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                Votação Aberta
              </span>
            ) : metrics.status === 'closed' ? (
              <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-0.5 rounded-full text-sm font-bold">
                <Square className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                Votação Encerrada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full text-sm font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Aguardando Início
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Alterne o status da votação durante os momentos da confraternização.
          </p>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 w-full md:w-auto">
          <button
            disabled={!!pendingAction || metrics.status === 'waiting'}
            onClick={() => handleStatusChange('waiting')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[44px] ${
              metrics.status === 'waiting'
                ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-default'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-60'
            }`}
          >
            {pendingAction === 'status-waiting' ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-800" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Aguardando
          </button>

          <button
            disabled={!!pendingAction || metrics.status === 'open'}
            onClick={() => handleStatusChange('open')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[44px] ${
              metrics.status === 'open'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-60'
            }`}
          >
            {pendingAction === 'status-open' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            Abrir Votação
          </button>

          <button
            disabled={!!pendingAction || metrics.status === 'closed'}
            onClick={() => handleStatusChange('closed')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm min-h-[44px] ${
              metrics.status === 'closed'
                ? 'bg-red-100 text-red-900 border border-red-300 cursor-default'
                : 'bg-[#d82a2b] hover:bg-[#b52021] text-white shadow-xs disabled:opacity-60'
            }`}
          >
            {pendingAction === 'status-closed' ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Encerrar
          </button>

          <button
            onClick={onOpenReveal}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#f7b53b] hover:bg-[#e09e25] text-[#1e2a4d] font-black text-xs flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition-transform min-h-[44px]"
          >
            <Tv className="w-4 h-4" />
            Modo Telão
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Total de Votos</span>
            <BarChart3 className="w-4 h-4 text-[#2b3a6c]" />
          </div>
          <div className="text-3xl font-black text-[#1e2a4d] mt-1">
            {metrics.totalVotes}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Atualizado em tempo real
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Participantes</span>
            <Users className="w-4 h-4 text-[#2b3a6c]" />
          </div>
          <div className="text-3xl font-black text-[#1e2a4d] mt-1">
            {metrics.totalCandidates}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Colaboradores cadastrados
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Líder Parcial</span>
            <Trophy className="w-4 h-4 text-[#f7b53b]" />
          </div>
          <div className="text-xl font-bold text-[#2b3a6c] mt-1 truncate">
            {leaders.length > 1
              ? `Empate: ${leaders.map(l => l.name.split(' ')[0]).join(', ')}`
              : leader && leader.votes > 0 ? leader.name : 'Aguardando votos...'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {leader && leader.votes > 0 ? `${leader.votes} votos (${leader.percentage}%)` : 'Nenhum voto'}
          </div>
        </div>
      </div>

      {/* Main Ranking Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-[#1e2a4d] flex items-center gap-2">
              <Award className="w-5 h-5 text-[#2b3a6c]" />
              Apuração Geral dos Votos
            </h3>
            <p className="text-xs text-slate-500">
              Classificação em ordem decrescente de votos recebidos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncPhotos}
              disabled={!!pendingAction}
              title="Ler pasta server/photos"
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#1e2a4d] text-xs font-semibold flex items-center gap-1.5 border border-gray-200 transition-colors min-h-[36px] disabled:opacity-60"
            >
              {pendingAction === 'sync-photos' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2b3a6c]" />
              ) : (
                <FolderSync className="w-3.5 h-3.5 text-[#2b3a6c]" />
              )}
              Sincronizar Fotos
            </button>
            <button
              onClick={loadMetrics}
              disabled={!!pendingAction}
              title="Atualizar"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200 transition-colors min-h-[36px] disabled:opacity-60"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Ranking Cards (sem rolagem horizontal) */}
        <div className="md:hidden space-y-3">
          {metrics.ranking.map((candidate, index) => {
            const place = candidate.place ?? (index + 1);
            return (
              <div 
                key={candidate.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  place === 1 && candidate.votes > 0
                    ? 'bg-amber-50/50 border-[#f7b53b]/40 shadow-xs'
                    : 'bg-slate-50/50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0">
                      {place === 1 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f7b53b] text-[#1e2a4d] text-xs font-black shadow-xs">
                          <Trophy className="w-3.5 h-3.5 text-[#1e2a4d]" />
                        </span>
                      ) : place === 2 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                          <Medal className="w-3.5 h-3.5 text-slate-600" />
                        </span>
                      ) : place === 3 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-200 text-amber-900 text-xs font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-800" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 text-slate-600 text-xs font-bold">
                          {place}º
                        </span>
                      )}
                    </div>

                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=100&background=2b3a6c&color=ffffff`;
                      }}
                    />

                    <div className="min-w-0">
                      <div className="font-bold text-[#1e2a4d] text-xs sm:text-sm flex items-center gap-1.5 flex-wrap truncate">
                        <span className="truncate">{candidate.name}</span>
                        {candidate.costumeName && (
                          <span className="text-[10px] font-semibold text-[#2b3a6c] bg-[#2b3a6c]/10 px-1.5 py-0.5 rounded border border-[#2b3a6c]/20 shrink-0">
                            {candidate.costumeName}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{candidate.department || 'Colégio Carbonell'}</div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-[#1e2a4d]">
                      {candidate.votes} <span className="text-[10px] font-normal text-slate-500">votos</span>
                    </div>
                    <div className="text-xs font-bold text-[#2b3a6c]">
                      {candidate.percentage}%
                    </div>
                  </div>
                </div>

                {/* Mini progress bar */}
                <div className="mt-2.5 w-full bg-white rounded-full h-1.5 overflow-hidden border border-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      place === 1
                        ? 'bg-[#f7b53b]'
                        : place === 2
                        ? 'bg-slate-400'
                        : place === 3
                        ? 'bg-amber-600'
                        : 'bg-[#2b3a6c]'
                    }`}
                    style={{ width: `${candidate.percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="pb-3 px-3 w-20">Pos.</th>
                <th className="pb-3 px-3">Colaborador</th>
                <th className="pb-3 px-3">Setor</th>
                <th className="pb-3 px-3 w-48">Distribuição</th>
                <th className="pb-3 px-3 text-right">Votos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics.ranking.map((candidate, index) => {
                const place = candidate.place ?? (index + 1);
                return (
                  <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-500">
                      {place === 1 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f7b53b]/20 text-[#1e2a4d] border border-[#f7b53b]/40 text-xs font-black">
                          <Trophy className="w-3 h-3 text-[#f7b53b]" /> 1º
                        </span>
                      ) : place === 2 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
                          <Medal className="w-3 h-3 text-slate-500" /> 2º
                        </span>
                      ) : place === 3 && candidate.votes > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                          <Award className="w-3 h-3 text-amber-700" /> 3º
                        </span>
                      ) : (
                        <span className="pl-2 text-slate-500">{place}º</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&size=100&background=2b3a6c&color=ffffff`;
                          }}
                        />
                        <div>
                          <div className="font-bold text-[#1e2a4d] flex items-center gap-2">
                            {candidate.name}
                            {candidate.costumeName && (
                              <span className="text-[10px] font-medium text-[#2b3a6c] bg-[#2b3a6c]/10 px-2 py-0.5 rounded border border-[#2b3a6c]/20">
                                {candidate.costumeName}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{candidate.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-xs">
                      {candidate.department || 'Colégio Carbonell'}
                    </td>

                    <td className="py-3 px-3">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            place === 1
                              ? 'bg-[#f7b53b]'
                              : place === 2
                              ? 'bg-slate-400'
                              : place === 3
                              ? 'bg-amber-600'
                              : 'bg-[#2b3a6c]'
                          }`}
                          style={{ width: `${candidate.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 inline-block font-medium">
                        {candidate.percentage}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-black text-base text-[#1e2a4d]">
                      {candidate.votes}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lista de Presença da Votação (Auditoria com Sigilo de Voto) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#1e2a4d] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Auditoria de Participação (Lista de Presença)
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                Voto 100% Secreto
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registro dos colaboradores que já emitiram seu voto. A identidade do eleitor é estritamente dissociada do candidato escolhido.
            </p>
          </div>
          <div className="text-xs font-bold text-[#2b3a6c] bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-200">
            {metrics.auditAttendance ? metrics.auditAttendance.length : (metrics.recentVotes || []).length} participações registradas
          </div>
        </div>

        {((metrics.auditAttendance || metrics.recentVotes || []).length === 0) ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Nenhum voto emitido até o momento.
          </div>
        ) : (
          <>
            {/* Mobile Attendance List */}
            <div className="md:hidden divide-y divide-gray-100">
              {(metrics.auditAttendance || metrics.recentVotes || []).map((voter, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-[#1e2a4d] truncate">{voter.voterName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{voter.voterEmail}</div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono shrink-0">
                    {voter.timestamp ? new Date(voter.timestamp).toLocaleTimeString('pt-BR') : '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Attendance Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3 px-3">Colaborador</th>
                    <th className="pb-3 px-3">E-mail Institucional</th>
                    <th className="pb-3 px-3 text-right">Horário da Participação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(metrics.auditAttendance || metrics.recentVotes || []).map((voter, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#1e2a4d]">
                        {voter.voterName}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-slate-500">
                        {voter.voterEmail}
                      </td>
                      <td className="py-2.5 px-3 text-right text-xs text-slate-500 font-mono">
                        {voter.timestamp ? new Date(voter.timestamp).toLocaleTimeString('pt-BR') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Danger Zone: Reset Votes */}
      <div className="p-5 rounded-2xl bg-white border border-red-200 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-red-700">Zerar Todos os Votos</h4>
          <p className="text-xs text-slate-500">
            Apenas para fins de teste ou reinício oficial antes da festa começar.
          </p>
        </div>
        <button
          onClick={() => setResetModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 text-xs font-bold transition-colors flex items-center gap-1.5 min-h-[44px]"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Zerar Votação
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-black text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão de Todos os Votos
            </h3>
            <p className="text-xs text-[#1e2a4d] mt-2">
              Esta ação é <strong>irreversível</strong>. Todos os votos computados até agora serão apagados.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              Para prosseguir, digite exatamente: <strong className="text-[#1e2a4d] font-bold">ZERAR_VOTOS_CONFIRMAR</strong>
            </p>

            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="ZERAR_VOTOS_CONFIRMAR"
              className="w-full mt-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-gray-300 text-[#1e2a4d] text-sm focus:outline-none focus:border-red-500"
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setResetModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold min-h-[44px]"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetVotes}
                disabled={resetConfirmText !== 'ZERAR_VOTOS_CONFIRMAR' || !!pendingAction}
                className="flex-1 py-2.5 rounded-xl bg-[#d82a2b] hover:bg-[#b52021] disabled:opacity-50 text-white text-xs font-bold transition-colors min-h-[44px] flex items-center justify-center gap-1.5"
              >
                {pendingAction === 'reset-votes' && (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                )}
                Zerar Agora
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
