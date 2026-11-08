# Validação do redesign institucional premium

Data: 7 de novembro de 2026. Branch local: `redesign/premium-institutional`.

## Arquitetura e escopo

O site oficial está em `site/`: HTML, CSS e JavaScript estáticos, publicados pelo workflow `.github/workflows/pages.yml` no GitHub Pages. Não há etapa de bundling, servidor de aplicação ou comando de lint próprio do site. O preparo de produção existente adquire a fonte Satoshi oficial, verifica SHA-256 e valida os mesmos arquivos estáticos. O workflow de validação foi corrigido para preparar a fonte antes de verificá-la. O workflow de deploy e a configuração de hospedagem não foram alterados.

Mantidos o logo, a fonte Satoshi, as páginas e âncoras existentes, links legais, suporte, download oficial, resolução da release com fallback e redirecionamento de convites. Sem mudanças em desktop, backend, Firebase, autenticação, atualizador, instaladores, domínio ou releases. A entrega usa branch separada e PR em rascunho, sem merge ou publicação.

## Implementação

- Abertura assimétrica com chamada e download ao lado do título e captura real em largura completa abaixo.
- Bento de mensagens, voz, compartilhamento de tela, comunidades e amigos, com capturas reais e ícones vetoriais discretos.
- Showcase nativo com quatro passagens e crossfade entre as duas capturas reais disponíveis. Nenhum interceptador de roda, gesto ou navegação.
- Abas sem autoplay, navegação por setas/Home/End, crossfade via Web Animations após decodificação, indicador móvel e fallback imediato quando indisponível.
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

Capturas revisáveis de desktop, mobile e diálogo estão versionadas em `docs/design/preview/`. Cópias de trabalho também ficam em `.impeccable/review/`, ignorado pelo Git. Os servidores de teste foram encerrados.

## Limitações reais

- Existem apenas duas capturas verificadas: conversa/comunidade e chamada. O estágio de compartilhamento mostra os controles da chamada e informa explicitamente que a imagem não representa uma transmissão. O usuário dispensou uma captura dedicada nesta continuação; o recurso permanece descrito sem uma transmissão fabricada. Nenhuma imagem ou funcionalidade foi fabricada.
- As abas agora usam Web Animations para crossfade em mouse e teclado, mantendo a captura anterior até a próxima decodificar. Sem Web Animations ou com movimento reduzido, a troca continua funcional e imediata.
- Foram acrescentadas medições locais controladas de LCP, layout shift e latência de interações. Elas não representam Core Web Vitals de campo nem INP de produção; ver a tabela e as condições abaixo.
- O launcher/detector do Impeccable não está instalado neste executor. Ambos foram tentados e retornaram arquivo inexistente; a avaliação utilizou código, navegador e revisão independente. Não houve overlay injetado.
- O desktop compartilhado não expôs ferramenta de controle nesta sessão. A prévia foi verificada por capturas automatizadas, não por um link publicado.


## Continuação: fechamento das dez fases do TXT

| Fase | Implementação e evidência |
| --- | --- |
| 1. Análise | `site/`, workflows Pages/validação, fontes, capturas e proveniência, CSP, links, convites, app.js e testes inspecionados. Arquitetura estática mantida; shadcn depende de React, equivalente nativo aplicado sem migração. |
| 2. Identidade | Grafite, violeta e azul, Satoshi auto-hospedada conforme compromisso existente, raios e tempos centralizados; DESIGN.md e JSON sincronizados. |
| 3. Componentes | Botões, bento, abas por teclado, diálogo nativo, navegação ativa, menu responsivo e FAQ. Controles identificados por texto ou nome acessível; tooltips extras não trazem informação necessária. |
| 4. Landing | Hero, bento, showcase sticky, capturas selecionáveis, ampliação, seção dedicada de download/requisitos, FAQ e rodapé. Compartilhamento descrito com evidência disponível; captura própria dispensada pelo usuário. |
| 5. Animações | Entrada coordenada, revelação única, crossfade com preload por intenção/decodificação, hover/clique, accordion com tamanho natural, entrada/saída do diálogo, reduced motion. Parallax decorativo é opcional no TXT e foi omitido para priorizar legibilidade e desempenho. |
| 6. Performance | Sem dependências de runtime novas, imagens WebP existentes, fontes locais verificadas, escuta de scroll passiva limitada à seção. Benchmark comparativo de seis execuções por versão, abaixo. |
| 7. Responsividade | 320, 390, 540, 768, 850, 1024, 1280 e 1440px; zoom 200%; mobile com showcase estático. |
| 8. Acessibilidade | Teclado, foco, alt, estrutura semântica, reduced motion, contraste e axe-core: zero violações automáticas WCAG A/AA 2.0/2.1/2.2 nas páginas e diálogo examinados a 1440/390px. Checks incompletos exigem avaliação humana; o resultado automatizado não é uma certificação de conformidade. |
| 9. Segurança de escopo | Branch separada, sem alterar desktop, Firebase, backend, autenticação, atualizador, instaladores, domínio ou workflow de distribuição. |
| 10. Entrega | Build estático reproduzível, testes funcionais ampliados, benchmark versionado e capturas desktop/mobile/diálogo; revisão independente da continuação com disposição `ship`. Sem publicação. |

### Download e inspeção

A seção `#download` mostra Windows 10/11, instalador x64 e origem GitHub. A arquitetura de 64 bits é a já usada na seleção do arquivo oficial `Mingrx-Setup-*-x64.exe`. O cartão de perfil descreve status personalizado, verificado em `desktop/src/v1.js`; não promete uma personalização inexistente.

O diálogo usa top layer nativa, Escape, fechamento por botão/fundo, foco devolvido ao acionador, erro de carregamento com recuperação e link para a imagem original. Sem suporte ou JavaScript, os links originais continuam utilizáveis. Ctrl/Cmd/clique modificado preserva a abertura normal do navegador.

As abas atualizam seleção/foco imediatamente e mantêm o quadro anterior durante o carregamento. Um teste adicional cobre trocas rápidas e clique repetido sem deixar overlays ou `aria-busy` presos. A duração vem do token CSS. O FAQ usa `interpolate-size` quando disponível, com disclosure nativo como fallback.

### Build local

Execute `node site/build.mjs`. Opcionalmente: `node site/build.mjs --out /caminho/separado`. Para abrir o build padrão, execute depois `node site/preview.mjs` e acesse `http://127.0.0.1:4173/` na mesma máquina. Ctrl+C encerra a prévia.

O comando prepara/verifica a fonte, executa validação e convites e copia somente arquivos públicos para `work/site-preview/`, sem publicar. A saída contém HTML, CSS, scripts de runtime, assets, sitemap, robots, CNAME e .nojekyll; scripts de teste/build não são incluídos. O diretório local de build é ignorado pelo Git. A hospedagem existente continua sem migração.

### Comparação de performance em laboratório

Medições via `site/test-performance.cjs`, Electron 45.1.0, três execuções de cache frio por viewport, CPU 4×, latência simulada 150ms, download 200.000 bytes/s e upload 100.000 bytes/s. A API externa de release é bloqueada; o fallback oficial permanece disponível. A versão de comparação é a entrada do repositório `a241304`; o benchmark usa os mesmos assets locais e condições para as duas versões.

| Versão / viewport | LCP mediano | Layout shift mediano | Maior interação amostrada, mediana |
| --- | --- | --- | --- |
| Anterior / desktop | 0.840 s | 0.0008 | 24 ms |
| Anterior / mobile | 0.804 s | 0.0004 | 32 ms |
| Redesign / desktop | 1.160 s | 0.0138 | 56 ms |
| Redesign / mobile | 0.976 s | 0.0000 | 32 ms |

O redesign fica dentro das metas de laboratório de LCP ≤2,5s e layout shift ≤0,1 nas duas larguras. Há regressão de LCP de 320ms no desktop e 172ms no mobile frente à entrada: ela é registrada, não ocultada por um score. A amostra de cliques (abas e FAQ) permanece abaixo de 200ms, mas não é INP de campo. Layout shift no relatório acumula deslocamentos sem entrada recente durante a sessão controlada, uma verificação conservadora de estabilidade. Resultados brutos e recursos carregados estão em `site-premium-performance.json`.

Reprodução com o Electron do projeto: `MINGRX_PERFORMANCE_REPORT=work/performance.json ./desktop/node_modules/.bin/electron --no-sandbox --headless --ozone-platform=headless --ozone-override-screen-size=1920,1080 site/test-performance.cjs`. `MINGRX_SITE_ROOT` permite apontar uma cópia da versão anterior para comparação. Não executa o aplicativo desktop e não usa Firebase. Os servidores e perfis temporários encerram ao final do teste.

As verificações finais incluíram novamente build, sintaxe, validação, convites e suíte Electron; a matriz Chromium verificou as novas telas e a auditoria axe incluiu o diálogo aberto. Nenhuma dependência foi adicionada ao projeto; Electron, Chromium e axe foram usados apenas como ferramentas de validação.


## Fechamento da entrega

- Tokens reais de tipografia, espaçamento e bordas agora utilizados no CSS compartilhado, além de cores, raios e movimento.
- Indicador das abas move-se entre as opções e recalcula a geometria após carregamento da fonte e resize.
- Menu mobile abre/fecha com transição de 160ms e fica `inert` imediatamente ao fechar; rodapé refeito em grid com espaçamento e tipografia de leitura.
- Tooltip de fechamento disponível por hover/foco; cópia de link comunica carregamento via texto, `aria-busy` e estado desabilitado.
- `node site/build.mjs` seguido de `node site/preview.mjs` abre a prévia local em `http://127.0.0.1:4173/`. O servidor serve somente o build, não publica e aceita GET/HEAD. Teste de fumaça validou páginas, scripts, fonte, 404 e 405; processo encerrado após verificação.
- Capturas persistidas em `docs/design/preview/`, fora dos arquivos enviados ao GitHub Pages, para revisão visual pela PR.
- Correção do CI: `.github/workflows/site-validation.yml` não preparava a fonte, causando ENOENT em `satoshi-variable.woff2` (confirmado nos logs da execução 42408713482). Acrescentada a preparação/verificação oficial existente antes da validação. Sem mudar Pages, instaladores ou releases.

A medição final após estes ajustes fica registrada em `site-premium-performance.json`; os resultados anteriores abaixo documentam a passagem anterior. Medições de laboratório variam conforme a contenção de CPU do executor e não equivalem a dados de campo.


## Briefing ampliado recebido posteriormente

A [conferência em quinze frentes](site-expanded-checklist.md) trata da versão com Refero Styles. Foram acrescentados pesquisa rastreável e seus limites, galeria de Comunidades, ícones nos cinco cards e indicadores de progresso clicáveis por âncoras nativas. `aria-current="step"` acompanha o texto mais próximo do centro da viewport, inclusive no mobile e em reduced motion. Não há scroll hijacking.

A revisão independente detectou que o novo contêiner sticky podia sobrepor a navegação ao header em alturas pequenas. O topo agora respeita no mínimo 110px e a imagem limita sua altura abaixo de 700px. O teste Electron verifica posição e hit testing em 1440×700, 600 e 500px; a galeria ganhou teste de End selecionando Comunidades. Build, testes existentes e matriz de navegador foram executados após as mudanças.

Foi introduzida uma configuração de ESLint exclusivamente para o site. A execução real com ESLint 10.14.0 passou sobre todos os arquivos JS/MJS/CJS do site, incluindo testes e ferramentas. O mesmo comando foi acrescentado à validação no GitHub. Isso complementa, sem confundir, a verificação de sintaxe anterior. Não há dependência de runtime nova.


A medição posterior às novas funções está em `expandedBrief` no JSON: mediana de três execuções, desktop LCP 1,468s e layout shift 0; mobile LCP 1,196s e layout shift 0. As maiores interações amostradas tiveram medianas 64ms e 48ms. Continuam sendo resultados locais, não INP de campo, sujeitos à carga do executor. A correção de alturas afeta apenas viewports curtos e não altera as duas viewports desse benchmark.


## Direção espacial aprovada por imagem

A solicitação mais recente substitui a direção anterior por um hero espacial: personagem fictício sentado em uma encosta, lua com monograma M, grafite/azul-noturno, iluminação violeta e ações arredondadas. Esta imagem específica prevalece sobre as restrições anteriores de gradientes, formas de botão e ausência de ilustração. PRODUCT.md, DESIGN.md, tokens e contratos de validação foram atualizados para refletir essa autorização, preservando as proteções sobre prova social e evidência real do produto.

Foi criada uma ilustração via image_gen usando a imagem do usuário como referência. A arte não contém UI/textos promocionais embutidos; título, botões e links são HTML acessível. A pessoa é uma figura ficcional sem identidade ou depoimento. As capturas autênticas do aplicativo continuam separadas e identificadas logo abaixo, na galeria, bento e showcase. A marca oficial e os links do app continuam preservados.

Arquivo original gerado: 1672×941. WebP desktop 72.424 bytes; WebP menor 27.758 bytes. São apenas redimensionamentos/codificações da arte, sem compositar capturas ou inventar funcionalidade. Prompt completo, origem e SHA-256 foram registrados em `site/assets/mingrx-orbit.prompt.txt` e `mingrx-orbit.provenance.json`. O validador confere os hashes e limites de payload, além de continuar verificando as capturas reais separadamente.

Desktop: hero com texto à esquerda e cena à direita. Até 850px: texto e ações primeiro, arte em faixa própria abaixo, evitando corte do personagem ou sobreposição de texto. Os demais componentes foram harmonizados em superfícies azul-noturnas e ações violeta. Não há estrelas animadas, autoplay ou efeitos contínuos.

Após esta substituição foram executados ESLint, build, validação/convites, suíte Electron, matriz Chromium em 320,390,540,768,850,1024,1280 e1440px, e axe nas telas cobertas. Todos passaram. As capturas desktop/mobile e página completa foram examinadas; a revisão independente recomendou `ship`, sem correções materiais. O revisor não recebeu o mock inline como arquivo local; o agente principal comparou a referência da conversa com os renders e o revisor recebeu a direção detalhada e a arte gerada.

Última medição controlada (`orbit` no JSON): LCP mediano 1,440s desktop/1,392s mobile, layout shift0/0 e maior interação amostrada48ms em ambas. Não é INP de campo nem promessa de desempenho em produção. Medidas anteriores permanecem registradas como histórico. O projeto não ganhou dependência de runtime.


## Componentes reutilizáveis e captura no hero

A solicitação seguinte reforçou componentes reutilizáveis e captura verdadeira em destaque. `site/components.js` extrai navegação, tabs, diálogo e tooltip do controlador da página para instâncias próprias, montadas por atributos. `site/app.js` conserva comportamento específico de release/convite, scroll e cópia. O build inclui o novo arquivo e o HTML o carrega antes do controlador, ambos com defer. Sem migração e sem biblioteca adicional.

A montagem usa WeakMap e é idempotente. O teste cria outra galeria com IDs diferentes, monta duas vezes e verifica que a seleção de uma não altera a outra nem duplica o indicador. Botões preservam rótulo/disabled anteriores ao busy. O diálogo usa delegação para links adicionados posteriormente, com alvo explícito ou instância primária, sem reabrir cópias por montagem repetida. Tooltips usam top layer de popover manual quando disponível, clamp de viewport e troca de lado quando falta espaço. Seus limites foram verificados por geometria após foco.

Cards e accordions permanecem componentes de HTML/CSS nativos. Padding de card e botão ganhou tokens específicos; a iluminação/sombra do card transiciona junto da elevação. O módulo responde à mudança de prefers-reduced-motion durante uma transição, cancelando animações Web Animations em andamento, além dos fallbacks CSS já existentes.

O hero mantém o personagem e a lua aprovados e agora contém uma captura real ampliável de 460px, renderizada inteira com object-fit: contain. A imagem é HTML e a entrada é a quarta na sequência (130ms de atraso, 440ms, opacidade, 16px e escala discreta). A direção espacial foi mantida; a arte usa enquadramento à direita e overlay à esquerda para proteger a leitura quando a seção cresce. No mobile, a captura vem antes da faixa da ilustração.

Foi corrigida na primeira inspeção uma altura intrínseca que ampliava/cortava a captura; o render final usa height:auto e contém a imagem verdadeira completa. As legendas da galeria reservam 128px/140px em larguras menores. O teste mede diferença de altura inferior a 2px ao trocar cada captura em cinco larguras; não depende somente de uma inspeção visual. A espera de limpeza de trocas rápidas usa condição com limite em vez de assumir callback de compositor em 500ms sob contenção de CPU.

Foram executados novamente lint, build, validação, convites, Electron, matriz Chromium e axe. A auditoria automatizada não reportou violações nos cenários cobertos; contraste no hero com imagem/gradiente exige avaliação manual e apareceu como verificação incompleta. Os pares principais de texto/botão passaram na medida de contraste do teste Electron, sem declarar certificação completa. A revisão independente recomendou ship no escopo examinado.

Medição local final desta passagem (`components` no JSON): LCP mediano1,596s desktop/1,372s mobile; layout shift0/0; maior interação amostrada56/40ms. São dados de laboratório, não INP de campo. [Contratos e exemplos reutilizáveis](site-components.md).


## Download, FAQ e sistema de movimento — itens 6.5 a 8

Download preserva Windows 10/11 x64, resolução de asset oficial e fallback para releases/latest; não anuncia macOS/Linux. FAQ mantém details/summary nativos e expansão progressiva. Páginas legais, suporte e contato existentes continuam preservados. Os testes de convites exercitam API indisponível e URL de download maliciosa, sem executar instaladores.

Reveal de opacidade 0→1 e deslocamento de 16px por 440ms agora cobre títulos, cards, galeria, showcase, download, FAQ e os grupos do rodapé. A sequência dos cards em desktop usa 40/80ms; mobile remove a defasagem. WeakSet e unobserve garantem uma execução por elemento, inclusive ao alternar a preferência de movimento. Um elemento contendo o foco não recebe entrada que o ocultaria. Sem JavaScript ou IntersectionObserver o conteúdo permanece visível. O teste conta animationstart e confirma que voltar pelo scroll não repete a animação.

Apenas a arte decorativa do hero ganha profundidade de até 8px. Em desktop e sem redução de movimento, o observer ativa listeners passivos de scroll/resize enquanto o hero está próximo da viewport. requestAnimationFrame agrupa atualizações solicitadas por evento, sem loop permanente. will-change existe somente durante a região ativa; imagem usa transform com escala de 1,025 para evitar bordas vazias. Mobile e reduced motion removem esse efeito e seus listeners. As capturas reais, textos e controles não recebem parallax. Scroll nativo e dimensões estáveis são mantidos.

ESLint, build, validação/convites, Electron, matriz Chromium 320–1440px e axe foram executados e passaram. Electron inclui reveal único, limite de 8px e desativação em reduced motion. Axe não reportou violações automatizadas nas telas cobertas, mantendo os limites de avaliação de contraste já descritos. Capturas desktop/mobile foram examinadas nesta passagem.

Medição controlada em `motion` no JSON: três execuções por viewport, cache frio, CPU 4×, latência150ms e download200.000 bytes/s. Medianas de LCP1,504s desktop/1,368s mobile; layout shift0/0; maior interação amostrada48/40ms. Não são dados de campo nem INP real. O LCP permanece maior que a página de entrada (0,840s/0,804s), com acréscimo de 664ms/564ms nas condições medidas, dentro da meta local de 2,5s. Sem dependência nova ou publicação no domínio.

A revisão independente desta passagem recomendou `ship`, sem regressões materiais no escopo. Inspecionou diff, contexto, quatro capturas e dados do laboratório; não repetiu os testes executados pelo agente principal. A documentação foi reconciliada com a profundidade decorativa e com microinterações existentes de 160ms.


## Fechamento de responsividade e acessibilidade — itens 9 a 13

A [auditoria desta passagem](site-responsive-accessibility.md) registra achados, correções, cobertura e limites. Navegação sem scripts, links nativos para imagens/endereço, convite sem ação inoperante, contraste do hover e foco interno das capturas foram corrigidos. A primeira solução causava layout shift mobile0,1163; foi substituída por stylesheet exclusivo de noscript. A medição final voltou a0 em ambas as viewports, com LCP1,632s/1,380s e amostras40/40ms. Resultados intermediários e finais estão preservados no JSON. Não houve dependência nova, mudança no aplicativo ou publicação.

Revisão independente final: `ship` no escopo responsivo/acessível examinado; a regressão intermediária de CLS foi resolvida. O documenter atualizou DESIGN.md, sidecar e briefing com comportamento real e limites de teste. Capturas foram conferidas depois do carregamento/decodificação, incluindo tablet, modo sem scripts e foco.
