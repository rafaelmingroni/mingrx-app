# Responsividade, acessibilidade e preservação — itens 9 a 13

## Resultado e escopo

A direção Orbit aprovada foi preservada: personagem sentado, lua com M, navy e violeta. O site permanece estático, sem migração ou dependência nova de runtime. O trabalho está em `redesign/premium-institutional`, PR45 em rascunho, antes da publicação. A comparação com main confirma alterações somente no site, documentação, contexto visual e validação do site; nada em desktop, Firebase, autenticação, backend, dados, atualizador, instaladores ou releases. O workflow de deploy não foi alterado.

## Achados priorizados e correções

| Prioridade | Evidência | Correção |
| --- | --- | --- |
| P1 — fallback de navegação | Sem scripts, a navegação mobile ficava escondida atrás de um botão sem comportamento. Abas e botões de cópia também continuavam visíveis. | `no-script.css`, carregado pelo parser apenas em noscript, apresenta navegação no fluxo e remove controles dependentes de script; links nativos dão acesso às capturas e ao endereço selecionável. FAQ e download continuam nativos. |
| P1 — contraste em hover | O stop mais claro do gradiente de hover, #9e4cff, tinha contraste4,26:1 com branco. | Stop alterado para #9242ef, cerca de4,94:1. O teste avalia os stops reais dos gradientes normal/hover, além dos pares principais de texto. Não certifica todo pixel sobre a arte. |
| P2 — foco recortado | O contorno externo dos links de captura podia ser cortado pela moldura com overflow. | Contorno de3px mantido, com offset interno de4px nos links e painéis de captura. Captura de validação mostra o estado real de foco. |
| P2 — alvo da marca | Link de marca com aproximadamente37–38px de altura. | Altura mínima44px, sem alterar a altura do header. Links em texto corrido usam a exceção de alvo inline; não foram transformados em botões artificiais. |
| P2 — convite sem scripts | Link inicial Abrir Mingrx apontava para #; status ficava em preparação. | A ação inicia oculta e só aparece com protocolo derivado de código válido. O estado inicial explica a necessidade de JavaScript; o download oficial continua disponível. Formatos legado e atual foram preservados. |

Uma primeira solução de fallback alternava o header no runtime; o laboratório revelou layout shift mobile0,1163. Essa solução foi substituída pelo stylesheet exclusivo de noscript, que não entra no caminho de renderização com scripts ativos. A medição com regressão é registrada separadamente, sem ser apresentada como resultado final.

## Verificações executadas

- Matriz Chromium em2560×1440,1920×1080,1440×900,1366×768,1024×768,851×700,850×700,768×1024,540×720,390×844,360×640 e320×568: nenhuma rolagem horizontal.
- Confirmação dos controles, imagens, menu, galeria, FAQ e scroll nativo em oito larguras320–1440px, além das rotas preservadas em390px.
- Espaçamento de texto aumentado em390px: entrelinha1,5, letras0,12em, palavras0,16em e separação de parágrafos2em, sem overflow. Não é um teste de leitor de tela.
- Percurso completo de Tab com48/49 elementos no desktop/mobile, respectivamente: foco visível e acesso ao conteúdo sem bloqueio nos percursos testados. Imagens maiores que a viewport mantêm scroll nativo.
- Electron: skip link, teclado em menu/tabs/FAQ, Home/End, diálogo/Escape/restauração de foco, tooltip, zoom200% e400% (320px CSS), reduced motion inicial e alterado durante transições, estabilidade das capturas, download/convites e ausência de erros de página nos cenários cobertos.
- Sem scripts: verificado que MingrxUI não executou; navegação e FAQ funcionam por teclado; links nativos de imagem/endereço/download continuam disponíveis. A avaliação via CDP é instrumentação de teste, sem habilitar os scripts da aplicação.
- Axe WCAG A/AA em1440 e390px: início, diálogo aberto, suporte, privacidade, termos, responsável/créditos, acessibilidade,404 e convite inválido; sem violações automatizadas. Contraste em início/404 ficou parcialmente incompleto por imagem/gradiente, sem alegar certificação.
- ESLint10.14.0, build, validação de arquivos/links/CSP/fontes/proveniência e testes de convites executados.

## Impeccable e etapas A–H

O contexto PRODUCT.md, DESIGN.md e briefing da superfície foi lido; a direção aprovada guiou os ajustes. O skill Impeccable e seus roteiros de qualidade foram aplicados com revisão independente. O launcher/context/detector havia sido realmente tentado neste ambiente e estava ausente, conforme o registro anterior; não se declara execução bem-sucedida do CLI.

A sequência original está rastreada na [matriz das quinze frentes](site-expanded-checklist.md): A diagnóstico, B pesquisa/direção, C tokens/componentes, D landing, E movimento, F responsividade, G performance, H qualidade. A pesquisa complementar posterior está identificada na cronologia; não se reescreve a ordem histórica. Este fechamento cobre F–H e preservação, sem reiniciar etapas concluídas.

## Limites e reprodução

Verificações em Chromium/Electron no executor Linux; não foram executados leitores de tela, Safari/Firefox ou testes em aparelhos físicos. Não existe alegação de funcionamento perfeito em todos os dispositivos nem certificação WCAG completa. Core Web Vitals de campo e INP real exigem dados após uma eventual publicação autorizada.

```sh
node site/build.mjs
node site/preview.mjs
```

Abra http://127.0.0.1:4173/ na mesma máquina. O build requer Node.js e curl para preparar a fonte oficial verificada. As ferramentas temporárias de validação não viraram dependências do site. [Capturas de validação](preview/README.md).

## Medição final após corrigir o salto

Laboratório com três execuções de cache frio por viewport, CPU4×, latência150ms, download200.000 bytes/s e API externa bloqueada. Desktop: LCP mediano1,632s, layout shift0, interação amostrada40ms. Mobile: LCP mediano1,380s, layout shift0, interação amostrada40ms. O relatório bruto está em `accessibility` no [JSON](site-premium-performance.json); a implementação intermediária rejeitada está em `accessibilityAttempt`. A entrada original media0,840s/0,804s de LCP, portanto permanece regressão de792ms/576ms nas condições medidas, dentro da meta local de2,5s. A amostra de cliques não é INP de campo.

A revisão independente final recomendou `ship` no escopo examinado, após confirmar a resolução do layout shift. O documenter reconciliou DESIGN.md, sidecar e briefing com o código. Não foram acrescentadas dependências ou alterados dados do aplicativo.
