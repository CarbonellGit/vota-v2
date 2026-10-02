# Plano Técnico de Implementação: Deploy em Produção (Firebase Hosting + Google Cloud Run) e Google OAuth

**Branch**: `antigravity-002/feat-deploy-cloud-run` | **Data**: 2026-09-24 | **Spec**: [spec.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/specs/002-deploy-cloud-run/spec.md)  
**Input**: Opção A: Frontend no Firebase Hosting, Backend Node.js no Google Cloud Run no projeto GCP `vota-509520`, e autenticação oficial Google OAuth via console.

---

## 1. Sumário Executivo

Configurar a infraestrutura e o fluxo de publicação para deploy em ambiente de produção da aplicação no projeto GCP e Firebase `vota-509520`. O frontend React/Vite será servido com alta performance e SSL automático pelo **Firebase Hosting**, enquanto o backend Node.js Express será conteinerizado via Docker e publicado no **Google Cloud Run** na região `southamerica-east1` (São Paulo). A integração de rede será unificada através de regras de *rewrites* no `firebase.json`, garantindo que todas as chamadas `/api/**` e fotos `/photos/**` operem sob o mesmo domínio sem conflitos de CORS. A autenticação Google OAuth 2.0 terá suas credenciais Web vinculadas ao domínio da escola (`@colegiocarbonell.com.br`).

---

## 2. Contexto Técnico

* **Linguagem / Runtime**: Node.js v20 (Alpine Linux para o container Cloud Run).
* **Framework Frontend**: React 19 com Vite 8.
* **Framework Backend**: Express.js (escutando em `process.env.PORT` e host `0.0.0.0`).
* **Hospedagem Frontend**: Firebase Hosting (`vota-509520.web.app` e `vota-509520.firebaseapp.com`).
* **Hospedagem Backend**: Google Cloud Run (`southamerica-east1`, CPU alocada durante processamento, escalabilidade automática 0 a 10 instâncias).
* **Autenticação**: Google OAuth 2.0 (`google-auth-library`), JWT de sessão (12h).
* **Armazenamento**: Persistência de arquivo `db.json` e pasta de fotos incluídas no container de runtime.

---

## 3. Constitution Check (Conformidade com AGENTS.md)

*GATE: Validação obrigatória dos princípios de governança do projeto.*

| Princípio de Governança | Status | Verificação |
| :--- | :---: | :--- |
| **Idioma pt-BR** | ✅ Aprovado | Documentação técnica, especificações e commits em português do Brasil. |
| **Padrões de Branch e Commit** | ✅ Aprovado | Branch `antigravity-002/feat-deploy-cloud-run` criada conforme padrão `<agente>-<numero-da-spec>/<prefixo>-<descricao>`. |
| **Single Source of Truth** | ✅ Aprovado | [PRD_Final.md](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/PRD_Final.md) atualizado com a seção de arquitetura de nuvem antes do plano. |
| **Proibido Fazer Suposições** | ✅ Aprovado | Opção A foi explicitamente escolhida e aprovada pelo usuário. |
| **Workflow Sequencial do Speckit** | ✅ Aprovado | Execução estrita do Passo 1 (`spec.md`), Passo 2 (`plan.md`, `research.md`, `data-model.md`, `quickstart.md`), com parada pré-implementação. |

---

## 4. Estrutura do Projeto e Arquivos Afetados

### Documentação da Spec
```text
specs/002-deploy-cloud-run/
├── spec.md              # Especificação funcional
├── plan.md              # Este plano técnico de implementação
├── research.md          # Pesquisa técnica (Cloud Run, Rewrites e OAuth)
├── data-model.md        # Variáveis de ambiente e modelos de container
└── quickstart.md        # Roteiro de validação de ponta a ponta
```

### Arquivos de Código Fonte Modificados ou Criados
```text
votacao-confra/
├── firebase.json              # Configuração de rewrites para o serviço Cloud Run
├── package.json               # Scripts de deploy: deploy, deploy:server, deploy:client
├── server/
│   ├── Dockerfile             # Container de produção Node.js 20 Alpine
│   ├── .dockerignore          # Exclusão de node_modules e arquivos desnecessários
│   └── index.js               # Ajuste para escutar em process.env.PORT e 0.0.0.0
└── client/
    ├── .env.production        # Configuração de ambiente para build de produção
    └── vite.config.js         # Validação de build
```
