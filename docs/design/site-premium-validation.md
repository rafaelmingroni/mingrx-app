# Validação do redesign institucional premium

Data: 7 de novembro de 2026. Branch local: `redesign/premium-institutional`.

## Arquitetura e escopo

O site oficial está em `site/`: HTML, CSS e JavaScript estáticos, publicados pelo workflow `.github/workflows/pages.yml` no GitHub Pages. Não há etapa de bundling, servidor de aplicação ou comando de lint próprio do site. O preparo de produção existente adquire a fonte Satoshi oficial, verifica SHA-256 e valida os mesmos arquivos estáticos. Nenhum workflow ou configuração de hospedagem foi alterado.

Mantidos o logo, a fonte Satoshi, as páginas e âncoras existentes, links legais, suporte, download oficial, resolução da release com fallback e redirecionamento de convites. Sem mudanças em desktop, backend, Firebase, autenticação, atualizador, instaladores, domínio ou releases. Não houve push, merge ou publicação.

## Implementação

- Abertura assimétrica com chamada e download ao lado do título e captura real em largura completa abaixo.
- Bento de mensagens, voz, compartilhamento de tela, comunidades e amigos, com capturas reais e ícones vetoriais discretos.
- Showcase nativo com quatro passagens e crossfade entre as duas capturas reais disponíveis. Nenhum interceptador de roda, gesto ou navegação.
- Abas sem autoplay, navegação por setas/Home/End, mudança visual via View Transitions quando disponível e fallback imediato quando indisponível.
- Transições CSS rápidas, revelação única via IntersectionObserver, conteúdo visível por padrão e assinatura do scroll ativa somente quando o showcase se aproxima da viewport.
- Mobile até 850px com demonstrações no fluxo, sem sticky. Movimento reduzido remove animações/transições e o sticky.
- FAQ com disclosures nativos e feedback de ícone; foco, menu com Escape e cópia com recuperação preservados.
- Tokens de superfícies, raios e movimento documentados. Nenhuma dependência adicionada ao projeto: React/shadcn e Motion não são necessários para os comportamentos implementados.

## Verificações executadas

- `node site/prepare-fonts.mjs`: fonte oficial obtida e SHA-256 confirmado.
- `node --check site/app.js` e `node --check site/test-browser.cjs`: sintaxe aprovada.
- `node site/validate.mjs`: conteúdo factual, links e âncoras locais, CSP, imagens/proveniência, fontes, documentos legais e metadados aprovados. Atualizado o contrato antigo que proibia qualquer animação para admitir movimento opcional e reduced motion, conforme o novo briefing.
- `node site/test-invites.mjs`: download confiável, fallback offline, rejeição de URL externa, códigos antigos/novos, protocolo e códigos inválidos aprovados.
- `site/test-browser.cjs` executado no Electron 45.1.0 fixado pelo projeto: 1440, 1024, 768, 390 e 320px; imagens, Satoshi, contraste >=4,5:1 dos pares principais, skip link, abas por teclado, FAQ, menu/Escape/foco, versão pública, cópia com permissão negada/sucesso, zoom 200%, ausência de tracking e erros de página. Acrescentada cobertura de cenas por scroll, reduced motion e introdução de recursos empilhada no mobile.
- Matriz adicional em Chromium/Playwright: 1440, 1280, 1024, 850, 768, 540, 390 e 320px; sem overflow horizontal, abas/Home, menu/Escape, FAQ, sincronização de cenas, reduced motion e páginas auxiliares. Recursos servidos por interceptação local de requests no navegador, sem deploy ou servidor de preview persistente.
- Revisão visual independente solicitou uma correção de especificidade no título mobile dos recursos. Correção aplicada, recapturada e classificada como resolvida pelo revisor (disposição `ship` no escopo dessa correção).
- `git diff --check`: sem problemas de whitespace.

Capturas de desktop e mobile estão disponíveis localmente em `.impeccable/review/`, diretório ignorado pelo Git. Nenhum servidor de preview foi mantido em execução.

## Limitações reais

- Existem apenas duas capturas verificadas: conversa/comunidade e chamada. O estágio de compartilhamento mostra os controles da chamada e informa explicitamente que a imagem não representa uma transmissão. Uma captura dedicada ainda é necessária para demonstrar esse recurso visualmente. Nenhuma imagem ou funcionalidade foi fabricada.
- A mudança de abas usa crossfade com View Transitions em navegadores compatíveis; demais navegadores conservam a troca acessível imediata.
- LCP, CLS e INP de produção não foram medidos: a execução de navegador usou recursos locais e respostas controladas da API. Não se afirma cumprimento das metas de Core Web Vitals sem medição representativa após uma publicação autorizada.
- O launcher/detector do Impeccable não está instalado neste executor. Ambos foram tentados e retornaram arquivo inexistente; a avaliação utilizou código, navegador e revisão independente. Não houve overlay injetado.
- O desktop compartilhado não expôs ferramenta de controle nesta sessão. A prévia foi verificada por capturas automatizadas, não por um link publicado.
