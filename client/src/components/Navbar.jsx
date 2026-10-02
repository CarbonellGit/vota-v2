import React from 'react';
import { Shield, Tv, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({
  user,
  status,
  currentTab,
  setCurrentTab,
  onOpenLogin,
  onLogout
}) {
  const getStatusBadge = () => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Votação Aberta
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Votação Encerrada
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#f7b53b]/20 text-[#f7b53b] border border-[#f7b53b]/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#f7b53b]"></span>
            Aguardando Início
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#1e2a4d] text-white shadow-md w-full overflow-x-hidden">
      <div className="h-16 flex items-center justify-between px-3 sm:px-6 max-w-6xl mx-auto w-full">
        
        {/* Logo & Marca Institucional */}
        <div 
          onClick={() => setCurrentTab('voting')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0 min-w-0"
        >
          <img
            src="/images/logo3.png"
            alt="Colégio Carbonell"
            className="h-8 sm:h-10 w-auto rounded-lg object-contain shadow-sm transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-lg font-black leading-none tracking-tight text-white truncate">
              VOTAÇÃO <span className="text-[#f7b53b] font-black tracking-normal">CARBONELL</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold mt-1 hidden sm:inline-block">
              Melhor Traje
            </span>
          </div>
        </div>

        {/* Center: Status pill (Desktop) */}
        <div className="hidden md:block">
          {getStatusBadge()}
        </div>

        {/* Right Section: Desktop Navigation + Profile/Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Desktop Navigation Buttons (hidden on mobile) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('voting')}
              className={`px-3 py-1.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !user?.isAdmin ? 'hidden sm:inline-flex' : ''
              } ${
                currentTab === 'voting'
                  ? 'bg-[#2b3a6c] text-white shadow-sm border border-white/20'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Votação
            </button>

            {user?.isAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    currentTab === 'admin'
                      ? 'bg-[#2b3a6c] text-white shadow-sm border border-white/20'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>

                <button
                  onClick={() => setCurrentTab('reveal')}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-black bg-[#f7b53b] hover:bg-[#e09e25] text-[#1e2a4d] transition-all shadow-md hover:scale-105"
                >
                  <Tv className="w-3.5 h-3.5" />
                  Telão
                </button>
              </>
            )}
          </div>

          {/* User profile / Logout (Always visible and anchored on the right) */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-white/15 shrink-0">
              <div className="relative group shrink-0">
                <img
                  src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2b3a6c&color=fff`}
                  alt={user.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/30 object-cover shadow-sm shrink-0"
                />
              </div>
              <span className="text-xs text-white font-semibold hidden lg:inline max-w-[120px] truncate">
                {user.name.split(' ')[0]}
              </span>
              <button
                onClick={onLogout}
                title="Sair do sistema"
                className="rounded-xl px-2 py-1.5 text-xs font-bold text-[#f7b53b] hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 min-h-[40px] shrink-0"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="text-[11px] sm:text-xs">Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 rounded-xl bg-[#f7b53b] hover:bg-[#e09e25] text-[#1e2a4d] font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 min-h-[40px] shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Sub-barra de navegação para Administradores no Mobile (< 640px) */}
      {user?.isAdmin && (
        <div className="sm:hidden px-2.5 py-1.5 bg-[#141d36] border-t border-white/10 flex items-center justify-between w-full gap-1.5 shadow-inner">
          <button
            onClick={() => setCurrentTab('voting')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center min-h-[38px] flex items-center justify-center ${
              currentTab === 'voting'
                ? 'bg-[#2b3a6c] text-white shadow-xs border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            Votação
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 min-h-[38px] ${
              currentTab === 'admin'
                ? 'bg-[#2b3a6c] text-white shadow-xs border border-white/20'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Admin
          </button>

          <button
            onClick={() => setCurrentTab('reveal')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 min-h-[38px] ${
              currentTab === 'reveal'
                ? 'bg-[#f7b53b] text-[#1e2a4d] shadow-sm'
                : 'bg-[#f7b53b]/90 text-[#1e2a4d]'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Telão
          </button>
        </div>
      )}

      {/* Mobile status banner no fluxo da barra, sem sobrepor o conteúdo */}
      <div className="md:hidden py-1 px-4 bg-[#0f172a] border-t border-white/10 flex justify-center w-full shadow-inner">
        {getStatusBadge()}
      </div>
    </header>
  );
}
