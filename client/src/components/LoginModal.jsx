import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle, ArrowRight, User, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { devLogin, googleLogin } from '../api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [gsiStatus, setGsiStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [gsiRetryCount, setGsiRetryCount] = useState(0);
  const googleBtnRef = useRef(null);

  const isProd = import.meta.env.PROD;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response || !response.credential) {
      setError('Não foi possível obter a credencial do Google.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await googleLogin(response.credential);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Falha ao autenticar com o Google institucional.');
    } finally {
      setLoading(false);
    }
  }, [onLoginSuccess, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    let attempts = 0;
    const maxAttempts = 40; // 40 * 100ms = 4s

    const checkGsiInterval = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id && googleBtnRef.current) {
        clearInterval(checkGsiInterval);
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            hd: 'colegiocarbonell.com.br',
            auto_select: false,
            cancel_on_tap_outside: true
          });

          googleBtnRef.current.innerHTML = '';
          const btnWidth = Math.min(300, Math.max(220, window.innerWidth - 64));
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: btnWidth,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left'
          });
          setGsiStatus('ready');
        } catch (err) {
          console.warn('[GSI] Erro ao renderizar botão do Google:', err);
          setGsiStatus('error');
        }
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGsiInterval);
        if (!window.google?.accounts?.id) {
          setGsiStatus('error');
        }
      }
    }, 100);

    return () => clearInterval(checkGsiInterval);
  }, [isOpen, googleClientId, handleGoogleResponse, gsiRetryCount]);

  if (!isOpen) return null;

  const handleDevSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let fullEmail = emailInput.trim().toLowerCase();
    if (!fullEmail) {
      setError('Por favor, informe seu e-mail ou usuário.');
      return;
    }

    // Auto-append domain if user only typed username
    if (!fullEmail.includes('@')) {
      fullEmail = `${fullEmail}@colegiocarbonell.com.br`;
    }

    if (!fullEmail.endsWith('@colegiocarbonell.com.br')) {
      setError('Acesso restrito: utilize seu e-mail institucional @colegiocarbonell.com.br');
      return;
    }

    setLoading(true);
    try {
      const data = await devLogin(fullEmail, nameInput.trim());
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPreset = (email, name) => {
    setEmailInput(email);
    setNameInput(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border border-gray-100 flex flex-col items-center text-center relative overflow-y-auto max-h-[90dvh]">
        
        {/* Top Accent Stripe idêntica ao LMS */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1e2a4d] via-[#2b3a6c] to-[#f7b53b]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-[#1e2a4d] rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo / Badge Institucional */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e2a4d] to-[#2b3a6c] text-[#f7b53b] flex items-center justify-center shadow-md mb-4 mt-2">
          <Sparkles className="w-8 h-8" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-[#2b3a6c] mb-1">
          Colégio Carbonell
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#1e2a4d] mb-2 tracking-tight">
          Votação da Festa
        </h1>
        <p className="text-slate-600 text-xs md:text-sm mb-6 leading-relaxed font-normal">
          Acesse com sua conta institucional <br />
          <strong className="text-[#1e2a4d]">@colegiocarbonell.com.br</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 text-left w-full">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Botão Oficial do Google Sign-In (Renderizado nativamente pelo SDK GSI com resiliência) */}
        <div className="w-full flex flex-col items-center justify-center my-2 min-h-[44px]">
          {gsiStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center p-3 gap-2">
              <Loader2 className="w-5 h-5 text-[#2b3a6c] animate-spin" />
              <span className="text-xs text-slate-500 font-medium">Carregando autenticação Google...</span>
            </div>
          )}

          {gsiStatus === 'error' && (
            <div className="flex flex-col items-center justify-center p-3.5 gap-2 text-xs text-red-700 bg-red-50/80 rounded-2xl border border-red-200 w-full animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Serviço do Google indisponível no momento</span>
              </div>
              <p className="text-[11px] text-slate-600 text-center">
                Verifique seu sinal de internet ou tente reconectar.
              </p>
              <button
                type="button"
                onClick={() => {
                  setGsiStatus('loading');
                  setGsiRetryCount(c => c + 1);
                }}
                className="mt-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1e2a4d] border border-gray-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#2b3a6c]" />
                Tentar Novamente
              </button>
            </div>
          )}

          <div
            ref={googleBtnRef}
            className={`min-h-[44px] flex justify-center w-full ${gsiStatus === 'ready' ? 'block' : 'hidden'}`}
          ></div>

          {loading && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#2b3a6c]">
              <span className="inline-block w-4 h-4 border-2 border-[#2b3a6c] border-t-transparent rounded-full animate-spin"></span>
              Autenticando conta institucional...
            </div>
          )}
        </div>

        {/* Formulário de Testes e Atalhos (Apenas em ambiente de desenvolvimento local) */}
        {!isProd && (
          <div className="mt-6 pt-5 border-t border-slate-100 w-full">
            <div className="flex items-center gap-2 mb-4 justify-center">
              <span className="h-px bg-slate-200 flex-1"></span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Ou Teste Local Rápido (DEV)
              </span>
              <span className="h-px bg-slate-200 flex-1"></span>
            </div>

            <form onSubmit={handleDevSubmit} className="space-y-3.5 w-full text-left">
              <div>
                <label className="block text-xs font-semibold text-[#1e2a4d] mb-1">
                  E-mail do Colaborador
                </label>
                <input
                  type="text"
                  placeholder="seu.nome@colegiocarbonell.com.br"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-gray-300 text-[#1e2a4d] placeholder-gray-400 text-base sm:text-xs focus:outline-none focus:border-[#2b3a6c] focus:ring-1 focus:ring-[#2b3a6c] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1e2a4d] mb-1">
                  Nome (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silva"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-gray-300 text-[#1e2a4d] placeholder-gray-400 text-base sm:text-xs focus:outline-none focus:border-[#2b3a6c] focus:ring-1 focus:ring-[#2b3a6c] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b3a6c] hover:bg-[#1e2a4d] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                Entrar com E-mail de Teste
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <button
                type="button"
                onClick={() => handleQuickPreset('thiago.luiz@colegiocarbonell.com.br', 'Thiago Luiz (Admin)')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-[#2b3a6c] flex items-center gap-1 truncate text-xs">
                  <User className="w-3.5 h-3.5 text-[#2b3a6c] shrink-0" /> Thiago Luiz
                </div>
                <div className="text-[10px] text-slate-500">Admin + Participante</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('mariana.santos@colegiocarbonell.com.br', 'Mariana Santos')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-left border border-slate-200 transition-colors"
              >
                <div className="font-bold text-[#1e2a4d] flex items-center gap-1 truncate text-xs">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Mariana Santos
                </div>
                <div className="text-[10px] text-slate-500">Colaborador</div>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
