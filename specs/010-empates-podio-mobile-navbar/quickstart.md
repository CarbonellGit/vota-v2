# Quickstart & Validation Guide: Empates no Pódio e Navbar Mobile

**Feature**: `010-empates-podio-mobile-navbar`  
**Date**: 2026-10-02  
**Status**: Concluído  

---

## 1. Pré-Requisitos e Ambiente

* Node.js v20+ instalado.
* Dependências do servidor e cliente instaladas (`npm install`).
* Branch ativa: `antigravity-010/feat-empates-podio-mobile-navbar`.

---

## 2. Cenários de Validação Ponta a Ponta

### Cenário 1: Validação do Dense Ranking no Backend
1. **Objetivo:** Garantir que o endpoint `GET /api/admin/metrics` agrupa adequadamente múltiplos empatados nos 3 degraus do pódio.
2. **Procedimento:**
   * Iniciar o servidor de desenvolvimento:
     ```bash
     npm run dev
     ```
   * Executar teste automatizado de ranking com dados simulados:
     * 4 candidatos com 30 votos;
     * 2 candidatos com 25 votos;
     * 1 candidato com 22 votos.
   * Verificar resposta JSON:
     * `podium.first.length === 4` e todos com 30 votos;
     * `podium.second.length === 2` e todos com 25 votos;
     * `podium.third.length === 1` e com 22 votos;
     * Todos os 4 primeiros no array `ranking` possuem `place === 1`.

### Cenário 2: Validação Visual no Telão (`/revelacao`)
1. **Objetivo:** Verificar a disposição dividida dos candidatos no pódio e os efeitos de celebração.
2. **Procedimento:**
   * Acessar `/revelacao` logado como administrador.
   * Acionar o botão "Revelar 3º Lugar" -> O participante individual de 22 votos é revelado com som de suspense.
   * Acionar o botão "Revelar 2º Lugar" -> Ambos os 2 vice-campeões aparecem lado a lado no bloco de Prata.
   * Acionar o botão "Revelar Grande Campeão" -> Os 4 campeões aparecem simultaneamente dividindo o topo dourado, com badge `"1º LUGAR • 4 CAMPEÕES EMPATADOS"`, fanfarra triunfal e chuva de confetes virtuais em tela cheia.

### Cenário 3: Validação da Navbar Mobile (Zero Scroll Horizontal)
1. **Objetivo:** Garantir que o botão "Sair" e o Avatar estão 100% visíveis em smartphones para administradores e colaboradores sem scroll horizontal.
2. **Procedimento:**
   * Abrir as Ferramentas de Desenvolvedor (F12) e ativar a visualização de dispositivos móveis.
   * Definir a largura da viewport para 360px (Samsung Galaxy S8 / Android compacto) e 375px (iPhone SE).
   * Logar com conta de administrador (`thiago.luiz@colegiocarbonell.com.br`).
   * **Verificações:**
     1. O botão "Sair" e o Avatar estão perfeitamente visíveis no canto superior direito.
     2. Não há qualquer rolagem horizontal ao arrastar a tela para a direita ou esquerda (largura contida em 100vw).
     3. As opções de navegação ("Votação", "Admin", "Telão") são exibidas em sub-barra limpa logo abaixo do cabeçalho.
     4. A alternância entre abas funciona instantaneamente e preserva o layout responsivo.
