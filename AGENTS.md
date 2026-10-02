# Regras de Agentes do Projeto 

## Idioma
1. Todas as interações com o usuário DEVEM ser em **Português Brasileiro (pt-BR)**.
2. Toda a documentação gerada, nomes de variáveis de negócio e comentários explicativos devem estar em Português Brasileiro (pt-BR), exceto quando convenções de tecnologia exigirem o inglês.

## Padrões de Versionamento (Git)
Quando você realizar operações de Git (commits, criação de branches):
1. **Responsável pela alteração**: Toda branch deve identificar qual agente realizou a alteração: `codex` ou `antigravity`.
2. **Alterações vinculadas a uma spec**: Quando o trabalho for definido por uma spec, o número da spec, com três dígitos, deve anteceder o prefixo da alteração e o agente responsável. O formato obrigatório é `<agente>-<numero-da-spec>/<prefixo>-<descricao>`. Exemplos:
   - `codex-001/feat-tela-login`
   - `antigravity-001/feat-tela-login`
3. **Alterações sem spec**: Para pequenas alterações que não exigem uma spec, o número não deve ser incluído. O formato obrigatório é `<agente>/<prefixo>-<descricao>`. Exemplos:
   - `codex/feat-troca-de-nome`
   - `antigravity/feat-troca-de-nome`
4. **Prefixos permitidos**: Devem utilizar prefixos em inglês, como `feat`, `fix`, `chore`, `docs` e `refactor`.
5. **Descrição da branch**: Deve estar em Português Brasileiro, em letras minúsculas e no formato `kebab-case`, sem espaços, acentos ou caracteres especiais. Exemplo: `codex-001/feat-tela-de-login`.
6. **Relação com a spec**: O número usado na branch deve corresponder à spec que originou o trabalho. Uma branch vinculada a uma spec não deve misturar alterações sem relação com ela.
7. **Commits**:
   - O título (primeira linha) do commit DEVE seguir o formato `<prefixo_em_ingles>: <descrição em pt-BR>`. Exemplo: `feat: adicionar painel do gestor`.
   - **MUITO IMPORTANTE:** TODOS os commits devem conter uma descrição detalhada em seu corpo (body).
   - O corpo do commit DEVE ser obrigatoriamente formatado em Markdown (`.md`), em PT-BR e explicando claramente:
     - O contexto da mudança.
     - O que foi feito.
     - O porquê foi feito.
   - Quando uma branch contiver mais de uma tarefa, ajuste ou etapa de implementação, cada etapa/fase deve ser registrada em um commit separado, com escopo claro e descrição objetiva.
   - Não deve ser criado um único commit com uma descrição extensa reunindo todas as alterações realizadas na branch.

## Padrões de Spec-Driven Development (SDD)
Para garantirmos o sucesso do método Spec-Driven Development, todo agente que atuar neste projeto DEVE seguir rigorosamente as seguintes regras:
1. **A Especificação é a Única Fonte da Verdade (Single Source of Truth):** Os arquivos `PRD_Final.md` e `DESIGN_SYSTEM_PRD.md` ditam as regras. Nenhum código deve ser escrito se contrariar o que está nos PRDs.
2. **Primeiro o Spec, Depois o Código:** Se o usuário solicitar uma mudança de regra de negócio, uma nova feature ou uma alteração visual, o agente DEVE PRIMEIRO atualizar o PRD correspondente e obter aprovação ANTES de escrever/alterar qualquer linha de código.
3. **Proibido Fazer Suposições:** Se o agente se deparar com um cenário não coberto pelos PRDs (uma regra de negócio omissa), ele NÃO DEVE adivinhar ou assumir o comportamento. Ele deve perguntar ao usuário, registrar no PRD e só então codificar.
4. **Verificação Contínua:** Após implementar uma tarefa, o agente deve cruzar o que foi codificado com o PRD para garantir que 100% dos critérios foram atendidos.

## Fluxo Obrigatório de Etapas do Speckit (Workflow Sequencial)
Para evitar execuções precipitadas ou pular etapas do ciclo de engenharia, todo agente DEVE seguir obrigatoriamente esta ordem de comandos e pontos de parada:

1. **Passo 1: `/speckit-specify`**
   - Criação da especificação funcional (`spec.md`) e atualização prévia do `PRD_Final.md`.
2. **Passo 2: `/speckit-plan`**
   - Criação do plano técnico, arquitetura, modelo de dados e contratos (`plan.md`, `research.md`, `data-model.md`).
   - Ao concluir o plano, o agente DEVE parar e sugerir a execução do `/speckit-tasks`.
3. **Passo 3: `/speckit-tasks`**
   - Geração detalhada do arquivo `tasks.md` contendo as tarefas atomizadas, ordenadas e com critérios de aceite.
   - **É EXPRESSAMENTE PROIBIDO PULAR A GERAÇÃO DE `tasks.md`.**
4. **Passo 4: PONTO DE PARADA OBRIGATÓRIO (NÃO CODIFICAR AINDA)**
   - O agente **NUNCA DEVE INICIAR A IMPLEMENTAÇÃO DE FORMA AUTÔNOMA** após gerar o plano ou as tasks.
   - O agente DEVE obrigatoriamente parar, apresentar o resumo do plano/tasks ao usuário e **AGUARDAR AUTORIZAÇÃO EXPRESSA** (como o comando `/speckit-implement` ou mensagem explícita do usuário autorizando a implementação).
5. **Passo 5: `/speckit-implement`**
   - Somente após o usuário autorizar expressamente, o agente inicia a codificação, executando fase a fase as tarefas definidas em `tasks.md`, realizando testes contínuos e commits atômicos conforme as regras de Git deste documento.

