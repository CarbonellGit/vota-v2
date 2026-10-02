# Interface & API Contracts: Empates no Pódio e Navbar Mobile

**Feature**: `010-empates-podio-mobile-navbar`  
**Date**: 2026-10-02  
**Status**: Concluído  

---

## 1. Contrato da API: `GET /api/admin/metrics`

* **Autenticação:** Exige token JWT com `isAdmin: true` no header `Authorization: Bearer <token>`.
* **Descrição:** Retorna a apuração consolidada dos votos com cálculo de *Dense Ranking* e listas de candidatos por degrau do pódio.

### Resposta de Sucesso: `HTTP 200 OK`

```json
{
  "status": "closed",
  "title": "Votação do Melhor Traje",
  "totalVotes": 77,
  "totalCandidates": 45,
  "ranking": [
    {
      "id": "ana-paula",
      "name": "Ana Paula",
      "email": "ana.paula@colegiocarbonell.com.br",
      "department": "Coordenação",
      "photoUrl": "/photos/ana-paula.jpg",
      "costumeName": "Malévola",
      "votes": 30,
      "percentage": 39.0,
      "place": 1
    },
    {
      "id": "bruno-silva",
      "name": "Bruno Silva",
      "email": "bruno.silva@colegiocarbonell.com.br",
      "department": "Tecnologia",
      "photoUrl": "/photos/bruno-silva.jpg",
      "costumeName": "Gandalf",
      "votes": 30,
      "percentage": 39.0,
      "place": 1
    },
    {
      "id": "carlos-eduardo",
      "name": "Carlos Eduardo",
      "email": "carlos.eduardo@colegiocarbonell.com.br",
      "department": "Administrativo",
      "photoUrl": "/photos/carlos-eduardo.jpg",
      "costumeName": "Pirata",
      "votes": 25,
      "percentage": 32.5,
      "place": 2
    },
    {
      "id": "daniela-costa",
      "name": "Daniela Costa",
      "email": "daniela.costa@colegiocarbonell.com.br",
      "department": "Pedagógico",
      "photoUrl": "/photos/daniela-costa.jpg",
      "costumeName": "Mulher Maravilha",
      "votes": 22,
      "percentage": 28.5,
      "place": 3
    }
  ],
  "podium": {
    "first": [
      {
        "id": "ana-paula",
        "name": "Ana Paula",
        "costumeName": "Malévola",
        "photoUrl": "/photos/ana-paula.jpg",
        "votes": 30,
        "percentage": 39.0
      },
      {
        "id": "bruno-silva",
        "name": "Bruno Silva",
        "costumeName": "Gandalf",
        "photoUrl": "/photos/bruno-silva.jpg",
        "votes": 30,
        "percentage": 39.0
      }
    ],
    "second": [
      {
        "id": "carlos-eduardo",
        "name": "Carlos Eduardo",
        "costumeName": "Pirata",
        "photoUrl": "/photos/carlos-eduardo.jpg",
        "votes": 25,
        "percentage": 32.5
      }
    ],
    "third": [
      {
        "id": "daniela-costa",
        "name": "Daniela Costa",
        "costumeName": "Mulher Maravilha",
        "photoUrl": "/photos/daniela-costa.jpg",
        "votes": 22,
        "percentage": 28.5
      }
    ]
  },
  "auditAttendance": [
    {
      "voterName": "Thiago Luiz",
      "voterEmail": "thiago.luiz@colegiocarbonell.com.br",
      "timestamp": "2026-10-02T22:30:00.000Z"
    }
  ]
}
```

---

## 2. Contrato de Componente: `Navbar.jsx`

* **Props:**
  * `user`: Objeto contendo dados do usuário logado (`{ name, email, picture, isAdmin }`) ou `null`.
  * `status`: `'waiting' | 'open' | 'closed'`.
  * `currentTab`: `'voting' | 'admin' | 'reveal'`.
  * `setCurrentTab`: `(tab: string) => void`.
  * `onOpenLogin`: `() => void`.
  * `onLogout`: `() => void`.
* **Garantias de Contrato de Interface:**
  1. A largura do componente nunca deve exceder a largura da tela (`100% / max-w-6xl`).
  2. Em telas `< 640px` (mobile):
     * O botão "Sair" e a foto de perfil DEVEM renderizar estritamente dentro da viewport visível sem depender de scroll horizontal.
     * As abas de navegação do Administrador DEVEM renderizar em contêiner secundário logo abaixo da linha do cabeçalho.

---

## 3. Contrato de Componente: `RevealPage.jsx`

* **Props:**
  * `onBack`: `() => void` (Retorno ao painel administrativo).
* **Consumo de Dados:**
  * Consome `fetchAdminMetrics()`.
  * Suporta `metrics.podium` como objeto `{ first: [], second: [], third: [] }` ou array legado de candidatos (com auto-conversão defensiva).
* **Garantias Visuais de Palco:**
  * Cada degrau acomoda de 1 a N participantes empatados.
  * O badge superior do 1º lugar adapta seu texto para `"GRANDE CAMPEÃO"` (se único) ou `"1º LUGAR • {N} CAMPEÕES EMPATADOS"` (se múltiplo).
  * O disparo de confetes virtuais e efeitos sonoros celebra conjuntamente todos os participantes revelados no passo atual.
