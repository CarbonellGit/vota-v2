# Pesquisa Técnica: Estabilização de Nuvem, FinOps e Segurança

**Feature**: `003-estabilizacao-nuvem-seguranca`  
**Branch**: `antigravity-003/feat-estabilizacao-nuvem-seguranca`  
**Data**: 2026-09-24  

---

## 1. Persistência Resiliente em Nuvem (Google Cloud Firestore)

### Decisão
Utilizar o SDK oficial `@google-cloud/firestore` configurado com Application Default Credentials (ADC) no projeto `vota-509520`, conectando-se ao Firestore em modo Nativo na região `southamerica-east1` (São Paulo).

### Rationale
- **Eliminação de Efemeridade**: O Cloud Run não retém alterações de arquivos no disco do container após desligamento de instâncias (scale-to-zero) ou escalonamento horizontal. O Firestore armazena dados em nuvem com alta disponibilidade (99.999% SLA) e replicação geográfica.
- **Transações Atômicas**: Votos simultâneos de 50+ pessoas concorrendo na mesma fração de segundo são serializados e validados com `firestore.runTransaction()`, garantindo que ninguém vote duas vezes e que votos simultâneos nunca se sobrescrevam.
- **Isenção de Custos (FinOps)**: O Free Tier do Firestore cobre 50.000 leituras e 20.000 gravações por dia, o que é mais do que suficiente para a eleição com ~160 colaboradores e poucas centenas de votos durante a noite da confraternização.
- **Zero Configuração de Credenciais em Produção**: No Cloud Run, a conta de serviço padrão do Compute Engine/Cloud Run já se autentica transparentemente sem necessidade de chaves JSON no repositório.

### Alternativas Consideradas
- *Cloud Storage FUSE*: Adicionar volume persistente montado no Cloud Run. Rejeitado por complexidade operacional de montagem, lentidão em gravações concorrentes de arquivo único JSON e risco de corrupção.
- *Cloud SQL (PostgreSQL/MySQL)*: Rejeitado por custo fixo mensal mínimo desnecessário para uma aplicação leve de evento.
- *SQLite Local*: Rejeitado pelo mesmo motivo do `db.json` (o container Cloud Run descarta o disco ao reiniciar ou escalar).

---

## 2. Sigilo Estrito do Voto na Auditoria Administrativa

### Decisão
Segregar o modelo de dados de votação em duas entidades sem acoplamento direto exposto à API:
1. Coleção `votes`: Chave do documento é o hash anônimo ou e-mail do eleitor (para assegurar a regra de 1 voto por pessoa e permitir alteração de voto enquanto a urna estiver aberta).
2. Coleção ou projeção de `attendance` (Presença): Registra que o colaborador `{ name, email, timestamp }` participou da votação.
3. No endpoint `/api/admin/metrics`, remover a lista nominal `recentVotes` que exibia `{ voterName -> candidateName }` e substituí-la por:
   - `ranking`: Contagem agregada e percentual por candidato.
   - `auditLog`: Lista anônima de participação exibindo apenas `{ voterName, voterEmail, timestamp }` confirmando que o colaborador exerceu seu direito de voto, sem qualquer vínculo com a fantasia escolhida.

### Rationale
- Garante conformidade com o princípio de voto secreto em eventos institucionais.
- A organização mantém a capacidade de verificar a taxa de participação e saber quem já votou (para incentivar os ausentes no microfone do evento).

### Alternativas Consideradas
- *Criptografia de chave pública por voto*: Rejeitada por overengineering desnecessário para uma confraternização interna.

---

## 3. FinOps: Otimização de Imagens em Lote e Redução de Egress

### Decisão
1. Implementar script de processamento em lote utilizando a biblioteca `sharp` (ou utilitário Node.js nativo de reamostragem) para converter todas as 161 fotos da pasta `server/photos` para:
   - Largura máxima de 500px (mantendo proporção).
   - Formato WebP otimizado (com fallback JPEG de qualidade 80%).
   - Compressão de metadados EXIF pesados.
2. Adicionar headers de cache estático com CDN no `server/index.js`:
   `Cache-Control: public, max-age=604800, immutable` (cache de 7 dias com validação ETag).

### Rationale
- As fotos originais somavam 187,4 MB, com imagens individuais de quase 10 MB.
- Após o redimensionamento e compressão, o tamanho médio de cada imagem cai para ~35-50 KB. O volume total de 161 fotos cai de **187 MB para menos de 6 MB** (redução de 96,8%).
- Em smartphones conectados ao 4G ou Wi-Fi do salão de festas, a galeria carrega instantaneamente, evitando travamentos de GPU/memória no navegador e economizando dezenas de gigabytes de egress no Cloud Run.

### Alternativas Consideradas
- *Serviço de redimensionamento on-the-fly (Cloudinary/Imgix)*: Rejeitado para evitar dependência de serviços externos de terceiros e custos extras. O lote pré-processado estático é ideal para fotos já cadastradas.

---

## 4. FinOps: Polling Inteligente e Desacoplado no Cliente

### Decisão
No cliente React ([`client/src/App.jsx`](file:///c:/Users/thiago.luiz/Desktop/Desenvolvimento/votacao-confra/client/src/App.jsx)):
1. Carregar a lista de candidatos (`fetchCandidates()`) **uma única vez** quando o componente for montado (`useEffect` sem dependência contínua).
2. O polling periódico executará exclusivamente `fetchStatus()` com intervalo estendido para **12 segundos** (ao invés de 5 segundos).
3. Se um voto for computado ou alterado pelo usuário logado, uma chamada pontual atualiza seu voto localmente sem forçar requisições repetidas de candidatos para todos os outros usuários.

### Rationale
- Elimina 1.800 requisições/minuto do payload pesado de 25 KB de candidatos.
- Reduz em mais de 75% o consumo de requisições e CPU ativa no Cloud Run.

---

## 5. Hardening de Autenticação e Segurança da API

### Decisão
1. **Bloqueio de `/api/auth/dev-login` em Produção**:
   ```javascript
   if (process.env.NODE_ENV === 'production') {
     return res.status(403).json({ error: 'Endpoint de desenvolvimento desativado em produção.' });
   }
   ```
2. **Validação Estrita de Google OAuth**:
   - Exigir `GOOGLE_CLIENT_ID` válido no ambiente.
   - Rejeitar qualquer token cuja assinatura não seja verificada por `googleClient.verifyIdToken`.
   - Se `GOOGLE_CLIENT_ID` não estiver definido em produção, lançar erro no startup do servidor.
3. **Rate Limiting Defensivo**:
   - Adicionar `express-rate-limit` com limite de 60 requisições por minuto por IP para endpoints públicos e 15 votos por minuto por IP/usuário autenticado.
