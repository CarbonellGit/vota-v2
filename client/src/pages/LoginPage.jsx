import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, ArrowRight, User, RefreshCw, Loader2 } from 'lucide-react';
import { devLogin, googleLogin } from '../api';

export default function LoginPage({ onLoginSuccess }) {
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
    } catch (err) {
      setError(err.message || 'Falha ao autenticar com o Google institucional.');
    } finally {
      setLoading(false);
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 150; // 150 * 100ms = 15s (tolerância estendida para redes coletivas/Wi-Fi do evento)

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
          const btnWidth = Math.min(300, Math.max(240, window.innerWidth - 64));
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
  }, [googleClientId, handleGoogleResponse, gsiRetryCount]);

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
    <div className="login-container min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4 sm:p-6 selection:bg-[#f7b53b] selection:text-[#1e2a4d]">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Logotipo Oficial Colégio Carbonell (Max 200px - Padrão cv-face) */}
        <div className="login-logo-container mb-4 sm:mb-6">
          <img
            src="/images/logo-fundo-branco.png"
            alt="Logo Colégio Carbonell"
            className="max-w-[200px] w-full h-auto object-contain"
          />
        </div>

        {/* Título Principal Sólido Carbonell */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e2a4d] tracking-tight mb-2">
          Votação do Melhor Traje
        </h1>

        {/* Mensagem Orientativa Institucional */}
        <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 font-normal max-w-md leading-relaxed">
          Por favor, utilize sua conta do Colégio Carbonell para continuar.
        </p>

        {/* Mensagem de Erro / Alerta */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 text-left w-full">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Botão Oficial do Google Sign-In (Renderizado nativamente pelo SDK GSI) */}
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
                className="mt-1 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#1e2a4d] border border-gray-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
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
          <div className="mt-8 pt-6 border-t border-slate-200 w-full">
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-[#1e2a4d] placeholder-gray-400 text-base sm:text-xs focus:outline-none focus:border-[#2b3a6c] focus:ring-1 focus:ring-[#2b3a6c] transition-all"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 text-[#1e2a4d] placeholder-gray-400 text-base sm:text-xs focus:outline-none focus:border-[#2b3a6c] focus:ring-1 focus:ring-[#2b3a6c] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#2b3a6c] hover:bg-[#1e2a4d] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
              >
                Entrar com E-mail de Teste
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-xs mt-3">
              <button
                type="button"
                onClick={() => handleQuickPreset('thiago.luiz@colegiocarbonell.com.br', 'Thiago Luiz (Admin)')}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-left border border-slate-200 transition-colors cursor-pointer"
              >
                <div className="font-bold text-[#2b3a6c] flex items-center gap-1 truncate text-xs">
                  <User className="w-3.5 h-3.5 text-[#2b3a6c] shrink-0" /> Thiago Luiz
                </div>
                <div className="text-[10px] text-slate-500">Admin + Participante</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('mariana.santos@colegiocarbonell.com.br', 'Mariana Santos')}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-left border border-slate-200 transition-colors cursor-pointer"
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
