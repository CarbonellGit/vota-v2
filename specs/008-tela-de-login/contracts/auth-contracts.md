# Interface & API Contracts: Tela de Login Antecedente e Bloqueio de Acesso

**Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/008-tela-de-login/spec.md)  
**Date**: 2026-09-29  
**Feature**: `008-tela-de-login`  

---

## 1. Contratos de API Backend (`server/routes/vote.js` e `server/routes/auth.js`)

### 1.1 `GET /api/vote/candidates` (Protegido por Autenticação)

Retorna a lista de candidatos e fotografias para exibição na galeria de votação. **Exige token JWT institucional no header `Authorization`**.

#### Request Headers
```http
GET /api/vote/candidates HTTP/1.1
Host: api.colegiocarbonell.com.br
Authorization: Bearer <jwt_token_institucional>
Accept: application/json
```

#### Response 200 OK (Usuário Autenticado)
```json
[
  {
    "id": "c-001",
    "name": "Mariana Santos",
    "email": "mariana.santos@colegiocarbonell.com.br",
    "photoUrl": "/photos/Mariana Santos - mariana.santos@colegiocarbonell.com.br.jpg",
    "department": "Coordenação Pedagógica",
    "costumeName": "Pirata dos Sete Mares"
  },
  {
    "id": "c-002",
    "name": "Carlos Silva",
    "email": "carlos.silva@colegiocarbonell.com.br",
    "photoUrl": "/photos/Carlos Silva - carlos.silva@colegiocarbonell.com.br.jpg",
    "department": "Tecnologia da Informação",
    "costumeName": "Mago Supremo"
  }
]
```

#### Response 401 Unauthorized (Tentativa Anônima ou Token Inválido)
```json
{
  "error": "Não autorizado: faça login para acessar os participantes"
}
```

---

### 1.2 `POST /api/auth/google` (Autenticação Institucional via GSI)

Submete o token de credencial gerado pelo Google Identity Services para verificação criptográfica e emissão do JWT da sessão.

#### Request Body
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
}
```

#### Response 200 OK (Sucesso)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Thiago Luiz",
    "email": "thiago.luiz@colegiocarbonell.com.br",
    "picture": "https://lh3.googleusercontent.com/a-/...",
    "isAdmin": true
  }
}
```

#### Response 403 Forbidden (E-mail não institucional)
```json
{
  "error": "Acesso restrito: utilize seu e-mail institucional @colegiocarbonell.com.br"
}
```

---

## 2. Contratos de Componentes Frontend React

### 2.1 Componente `LoginPage` (`client/src/pages/LoginPage.jsx`)

Componente de página inteira responsável pela recepção do usuário deslogado, no padrão visual do projeto de chamada institucional `cv-face`.

#### Props Interface
```typescript
interface LoginPageProps {
  onLoginSuccess: (userData: UserSession) => void;
}
```

#### Estrutura de Renderização e Estilos (Tailwind CSS)
```jsx
<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center p-4 sm:p-6 selection:bg-[#f7b53b] selection:text-[#1e2a4d]">
  <div className="w-full max-w-md flex flex-col items-center">
    {/* Logotipo Oficial Carbonell (Max 200px) */}
    <div className="mb-4 sm:mb-6">
      <img
        src="/images/logo-fundo-branco.png"
        alt="Colégio Carbonell"
        className="max-w-[200px] w-full h-auto object-contain"
      />
    </div>

    {/* Título Oficial Sólido */}
    <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1e2a4d] tracking-tight mb-2">
      Votação do Melhor Traje
    </h1>

    {/* Parágrafo Orientativo Institucional */}
    <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8 font-normal max-w-md leading-relaxed">
      Por favor, utilize sua conta do Colégio Carbonell para continuar.
    </p>

    {/* Alerta de Erro (se houver) */}
    {error && (
      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 text-left w-full">
        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    )}

    {/* Container Oficial do Google Sign-In (GSI) */}
    <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
      {/* Botão renderizado pelo SDK Google com estado resiliente */}
    </div>

    {/* Bloco de Testes DEV (Exclusivo para import.meta.env.DEV) */}
    {!isProd && (
      <div className="mt-8 pt-6 border-t border-slate-200 w-full text-left">
        {/* Formulário local e atalhos rápidos de desenvolvedor */}
      </div>
    )}
  </div>
</div>
```

---

### 2.2 Roteamento Raiz Condicional (`client/src/App.jsx`)

Regra de decisão do componente raiz:

```jsx
// Se o usuário não está autenticado, renderiza EXCLUSIVAMENTE a LoginPage
if (!user) {
  return (
    <LoginPage onLoginSuccess={handleLoginSuccess} />
  );
}

// Se o usuário está autenticado, renderiza a Navbar e o conteúdo protegido
return (
  <div className="min-h-screen bg-carbonell-bg text-carbonell-navy flex flex-col">
    <Navbar ... />
    <main className="flex-1">
      {/* Carregando dados, AdminPage ou VotingPage */}
    </main>
    <footer ... />
  </div>
);
```
