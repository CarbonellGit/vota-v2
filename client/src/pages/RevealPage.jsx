import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Maximize, 
  RotateCcw, 
  Crown, 
  Medal, 
  Award, 
  HelpCircle 
} from 'lucide-react';
import { fetchAdminMetrics } from '../api';

export default function RevealPage({ onBack }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  // revealStep: 0 = hidden, 1 = 3rd place, 2 = 2nd place, 3 = 1st place
  const [revealStep, setRevealStep] = useState(0);

  // Sound effects generator via Web Audio API
  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      if (type === 'drumroll') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 1.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (type === 'fanfare') {
        // Grand fanfare notes (C4, E4, G4, C5)
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + i * 0.15);
          gain.gain.setValueAtTime(0.2, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.8);
        });
      }
    } catch {
      // Audio might be blocked if user hasn't interacted
    }
  };

  const triggerChampionConfetti = () => {
    // Left cannon
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.7 },
      colors: ['#f7b53b', '#2b3a6c', '#ffffff', '#10b981']
    });
    // Right cannon
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.7 },
      colors: ['#f7b53b', '#2b3a6c', '#ffffff', '#10b981']
    });
    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#f7b53b', '#ffd700', '#ffffff', '#2b3a6c']
      });
    }, 400);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchAdminMetrics();
        setMetrics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleNextReveal = () => {
    if (revealStep < 3) {
      const next = revealStep + 1;
      setRevealStep(next);
      if (next === 1 || next === 2) {
        playSound('drumroll');
      }
      if (next === 3) {
        playSound('fanfare');
        triggerChampionConfetti();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (loading || !metrics) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-carbonell-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Preparando telão de revelação...</p>
        </div>
      </div>
    );
  }

  const podiumData = metrics.podium || {};
  const firstCandidates = Array.isArray(podiumData)
    ? (podiumData[0] ? [podiumData[0]] : [])
    : (Array.isArray(podiumData.first) ? podiumData.first : (podiumData.first ? [podiumData.first] : []));
  const secondCandidates = Array.isArray(podiumData)
    ? (podiumData[1] ? [podiumData[1]] : [])
    : (Array.isArray(podiumData.second) ? podiumData.second : (podiumData.second ? [podiumData.second] : []));
  const thirdCandidates = Array.isArray(podiumData)
    ? (podiumData[2] ? [podiumData[2]] : [])
    : (Array.isArray(podiumData.third) ? podiumData.third : (podiumData.third ? [podiumData.third] : []));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1120] via-[#1e2a4d] to-[#0b1120] text-white relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none">
      
      {/* Background festive glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-carbonell-yellow/15 via-carbonell-blue/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar for Presenter */}
      <div className="flex items-center justify-between z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel
        </button>

        {/* Logo Oficial para Fundos Escuros */}
        <div className="text-center flex flex-col items-center">
          <img
            src="/images/logo-fundo-azul.png"
            alt="Colégio Carbonell"
            className="h-11 w-auto object-contain drop-shadow-md mb-1"
          />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pódio do Melhor Traje
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRevealStep(0)}
            title="Reiniciar revelação"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Tela cheia"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Podium Stage Container */}
      <div className="relative z-10 my-auto py-6 sm:py-8 w-full">
        <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2 sm:gap-6 items-end">
          
          {/* 2nd Place (Silver) */}
          <div className="flex flex-col items-center">
            {revealStep >= 2 && secondCandidates.length > 0 ? (
              secondCandidates.length === 1 ? (
                /* Vencedor Único - 2º Lugar */
                <div className="w-full flex flex-col items-center animate-fade-in transition-all">
                  <div className="relative mb-3 group">
                    <img
                      src={secondCandidates[0].photoUrl}
                      alt={secondCandidates[0].name}
                      className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-slate-300 shadow-2xl"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(secondCandidates[0].name)}&size=300&background=475569&color=fff`;
                      }}
                    />
                    <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                      <span className="px-3 py-0.5 rounded-full bg-slate-200 text-slate-900 text-xs font-black shadow-lg inline-flex items-center gap-1">
                        <Medal className="w-3.5 h-3.5 text-slate-700" />
                        2º LUGAR
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-xl text-white text-center mt-2 line-clamp-1">
                    {secondCandidates[0].name}
                  </h3>
                  {secondCandidates[0].costumeName && (
                    <p className="text-[11px] sm:text-xs text-carbonell-yellow text-center font-medium flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-carbonell-yellow" />
                      {secondCandidates[0].costumeName}
                    </p>
                  )}
                  <span className="mt-1 text-xs sm:text-sm font-black text-slate-300">
                    {secondCandidates[0].votes} votos ({secondCandidates[0].percentage}%)
                  </span>
                </div>
              ) : (
                /* Múltiplos Empatados - 2º Lugar */
                <div className="w-full flex flex-col items-center animate-fade-in transition-all">
                  <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2">
                    {secondCandidates.map((cand) => (
                      <div key={cand.id} className="flex flex-col items-center max-w-[85px] sm:max-w-[120px]">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-4 border-slate-300 shadow-xl"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&size=300&background=475569&color=fff`;
                          }}
                        />
                        <h4 className="font-extrabold text-[10px] sm:text-xs text-white text-center mt-1 line-clamp-1 truncate w-full">
                          {cand.name}
                        </h4>
                        {cand.costumeName && (
                          <p className="text-[9px] sm:text-[10px] text-carbonell-yellow text-center font-medium truncate w-full">
                            {cand.costumeName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="my-1">
                    <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-slate-200 text-slate-900 text-[10px] sm:text-xs font-black shadow-lg inline-flex items-center gap-1 text-center">
                      <Medal className="w-3 h-3 text-slate-700 shrink-0" />
                      2º LUGAR • {secondCandidates.length} EMPATADOS
                    </span>
                  </div>
                  <span className="mt-0.5 text-xs sm:text-sm font-black text-slate-300">
                    {secondCandidates[0].votes} votos ({secondCandidates[0].percentage}%)
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-32 flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-white/20 animate-pulse" />
              </div>
            )}

            {/* Podium Block 2 */}
            <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700/80 border-t-4 border-slate-300 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl mt-4">
              <span className="text-3xl sm:text-5xl font-black text-slate-300">2</span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase text-slate-400 font-bold">
                Prata
              </span>
            </div>
          </div>

          {/* 1st Place (Gold - Center) */}
          <div className="flex flex-col items-center -mt-8">
            {revealStep >= 3 && firstCandidates.length > 0 ? (
              firstCandidates.length === 1 ? (
                /* Vencedor Único - 1º Lugar */
                <div className="w-full flex flex-col items-center animate-bounce-short transition-all">
                  <div className="relative mb-4 group">
                    <div className="absolute -top-7 inset-x-0 flex justify-center">
                      <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-carbonell-yellow drop-shadow-[0_0_20px_rgba(247,181,59,0.9)]" />
                    </div>
                    <img
                      src={firstCandidates[0].photoUrl}
                      alt={firstCandidates[0].name}
                      className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-carbonell-yellow shadow-[0_0_45px_rgba(247,181,59,0.6)]"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstCandidates[0].name)}&size=400&background=2b3a6c&color=fff`;
                      }}
                    />
                    <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                      <span className="px-4 py-1 rounded-full bg-carbonell-yellow text-carbonell-navy text-xs sm:text-sm font-black shadow-xl glow-gold inline-flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-carbonell-navy" />
                        GRANDE CAMPEÃO
                      </span>
                    </div>
                  </div>

                  <h3 className="font-black text-base sm:text-2xl text-white text-center mt-3 line-clamp-1">
                    {firstCandidates[0].name}
                  </h3>
                  {firstCandidates[0].costumeName && (
                    <p className="text-xs sm:text-sm text-carbonell-yellow text-center font-bold flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-carbonell-yellow" />
                      {firstCandidates[0].costumeName}
                    </p>
                  )}
                  <span className="mt-1 text-sm sm:text-base font-black text-carbonell-yellow">
                    {firstCandidates[0].votes} votos ({firstCandidates[0].percentage}%)
                  </span>
                </div>
              ) : (
                /* Múltiplos Empatados - 1º Lugar */
                <div className="w-full flex flex-col items-center animate-bounce-short transition-all relative">
                  <div className="flex justify-center mb-1">
                    <Trophy className="w-9 h-9 sm:w-12 sm:h-12 text-carbonell-yellow drop-shadow-[0_0_20px_rgba(247,181,59,0.9)]" />
                  </div>
                  <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-2">
                    {firstCandidates.map((cand) => (
                      <div key={cand.id} className="flex flex-col items-center max-w-[95px] sm:max-w-[130px]">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-16 h-16 sm:w-22 sm:h-22 md:w-26 md:h-26 rounded-full object-cover border-3 sm:border-4 border-carbonell-yellow shadow-[0_0_25px_rgba(247,181,59,0.6)]"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&size=400&background=2b3a6c&color=fff`;
                          }}
                        />
                        <h4 className="font-black text-[11px] sm:text-xs md:text-sm text-white text-center mt-1 line-clamp-1 truncate w-full">
                          {cand.name}
                        </h4>
                        {cand.costumeName && (
                          <p className="text-[9px] sm:text-[10px] text-carbonell-yellow text-center font-bold flex items-center justify-center gap-0.5 truncate w-full">
                            <Sparkles className="w-2.5 h-2.5 text-carbonell-yellow shrink-0" />
                            <span className="truncate">{cand.costumeName}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="my-1.5">
                    <span className="px-3 sm:px-4 py-1 rounded-full bg-carbonell-yellow text-carbonell-navy text-[10px] sm:text-xs md:text-sm font-black shadow-xl glow-gold inline-flex items-center gap-1.5 text-center">
                      <Crown className="w-3.5 h-3.5 text-carbonell-navy shrink-0" />
                      1º LUGAR • {firstCandidates.length} CAMPEÕES EMPATADOS
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm md:text-base font-black text-carbonell-yellow">
                    {firstCandidates[0].votes} votos ({firstCandidates[0].percentage}%)
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-44 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-carbonell-yellow/30 animate-pulse" />
              </div>
            )}

            {/* Podium Block 1 */}
            <div className="w-full h-48 sm:h-64 bg-gradient-to-t from-slate-900 via-[#1e2a4d] to-carbonell-yellow/30 border-t-4 border-carbonell-yellow rounded-t-3xl flex flex-col items-center justify-center shadow-2xl mt-4">
              <span className="text-4xl sm:text-7xl font-black text-carbonell-yellow">1</span>
              <span className="text-[11px] sm:text-sm tracking-wider uppercase text-carbonell-yellow font-extrabold">
                Ouro
              </span>
            </div>
          </div>

          {/* 3rd Place (Bronze) */}
          <div className="flex flex-col items-center">
            {revealStep >= 1 && thirdCandidates.length > 0 ? (
              thirdCandidates.length === 1 ? (
                /* Vencedor Único - 3º Lugar */
                <div className="w-full flex flex-col items-center animate-fade-in transition-all">
                  <div className="relative mb-3 group">
                    <img
                      src={thirdCandidates[0].photoUrl}
                      alt={thirdCandidates[0].name}
                      className="w-24 h-24 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-amber-600 shadow-2xl"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(thirdCandidates[0].name)}&size=300&background=78350f&color=fff`;
                      }}
                    />
                    <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                      <span className="px-3 py-0.5 rounded-full bg-amber-600 text-white text-xs font-black shadow-lg inline-flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-white" />
                        3º LUGAR
                      </span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-xl text-white text-center mt-2 line-clamp-1">
                    {thirdCandidates[0].name}
                  </h3>
                  {thirdCandidates[0].costumeName && (
                    <p className="text-[11px] sm:text-xs text-carbonell-yellow text-center font-medium flex items-center justify-center gap-1">
                      <Sparkles className="w-3 h-3 text-carbonell-yellow" />
                      {thirdCandidates[0].costumeName}
                    </p>
                  )}
                  <span className="mt-1 text-xs sm:text-sm font-black text-amber-500">
                    {thirdCandidates[0].votes} votos ({thirdCandidates[0].percentage}%)
                  </span>
                </div>
              ) : (
                /* Múltiplos Empatados - 3º Lugar */
                <div className="w-full flex flex-col items-center animate-fade-in transition-all">
                  <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-2">
                    {thirdCandidates.map((cand) => (
                      <div key={cand.id} className="flex flex-col items-center max-w-[85px] sm:max-w-[120px]">
                        <img
                          src={cand.photoUrl}
                          alt={cand.name}
                          className="w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover border-2 sm:border-4 border-amber-600 shadow-xl"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&size=300&background=78350f&color=fff`;
                          }}
                        />
                        <h4 className="font-extrabold text-[10px] sm:text-xs text-white text-center mt-1 line-clamp-1 truncate w-full">
                          {cand.name}
                        </h4>
                        {cand.costumeName && (
                          <p className="text-[9px] sm:text-[10px] text-carbonell-yellow text-center font-medium truncate w-full">
                            {cand.costumeName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="my-1">
                    <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-amber-600 text-white text-[10px] sm:text-xs font-black shadow-lg inline-flex items-center gap-1 text-center">
                      <Award className="w-3 h-3 text-white shrink-0" />
                      3º LUGAR • {thirdCandidates.length} EMPATADOS
                    </span>
                  </div>
                  <span className="mt-0.5 text-xs sm:text-sm font-black text-amber-500">
                    {thirdCandidates[0].votes} votos ({thirdCandidates[0].percentage}%)
                  </span>
                </div>
              )
            ) : (
              <div className="w-full h-32 flex items-center justify-center">
                <HelpCircle className="w-10 h-10 text-white/20 animate-pulse" />
              </div>
            )}

            {/* Podium Block 3 */}
            <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-900 via-slate-800 to-amber-900/60 border-t-4 border-amber-600 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl mt-4">
              <span className="text-3xl sm:text-5xl font-black text-amber-500">3</span>
              <span className="text-[10px] sm:text-xs tracking-wider uppercase text-amber-400 font-bold">
                Bronze
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Presenter Controls */}
      <div className="z-20 flex flex-col sm:flex-row items-center justify-center gap-4">
        {revealStep === 0 && (
          <button
            onClick={handleNextReveal}
            className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base shadow-xl hover:scale-105 transition-transform flex items-center gap-2 min-h-[48px]"
          >
            <Award className="w-5 h-5" />
            {thirdCandidates.length > 1 ? `Revelar 3º Lugar (${thirdCandidates.length} Vencedores)` : 'Revelar 3º Lugar'}
          </button>
        )}

        {revealStep === 1 && (
          <button
            onClick={handleNextReveal}
            className="px-8 py-3.5 rounded-2xl bg-slate-200 hover:bg-white text-slate-950 font-bold text-base shadow-xl hover:scale-105 transition-transform flex items-center gap-2 min-h-[48px]"
          >
            <Medal className="w-5 h-5" />
            {secondCandidates.length > 1 ? `Revelar 2º Lugar (${secondCandidates.length} Vencedores)` : 'Revelar 2º Lugar'}
          </button>
        )}

        {revealStep === 2 && (
          <button
            onClick={handleNextReveal}
            className="px-10 py-4 rounded-2xl bg-carbonell-yellow hover:bg-[#eab308] hover:scale-105 text-carbonell-navy font-black text-lg shadow-[0_0_35px_rgba(247,181,59,0.6)] transition-transform flex items-center gap-2.5 animate-pulse min-h-[52px]"
          >
            <Trophy className="w-6 h-6 text-carbonell-navy" />
            {firstCandidates.length > 1 ? 'REVELAR OS GRANDES CAMPEÕES!' : 'REVELAR O GRANDE CAMPEÃO!'}
          </button>
        )}

        {revealStep === 3 && (
          <div className="flex gap-3">
            <button
              onClick={triggerChampionConfetti}
              className="px-6 py-3 rounded-xl bg-carbonell-yellow/20 hover:bg-carbonell-yellow/30 text-carbonell-yellow border border-carbonell-yellow/40 font-bold text-sm transition-colors flex items-center gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-carbonell-yellow" />
              Mais Confetes!
            </button>
            <button
              onClick={() => setRevealStep(0)}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors min-h-[44px]"
            >
              Reiniciar Apresentação
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
