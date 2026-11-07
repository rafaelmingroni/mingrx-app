# Mingrx — direção Orbit concluída

## Autoridade e escopo

A referência cósmica mais recente, fornecida e aprovada pelo usuário, define o novo mundo visual: pessoa fictícia sentada na crista rochosa, grande lua com borda violeta e M luminoso, céu navy, título branco com “compartilhe” violeta e ações arredondadas em gradiente. Ela substitui a antiga composição editorial e os vetos a gradientes, cápsulas e ilustração. Satoshi e a marca permanecem, conforme PRODUCT.md atualizado.

A direção está implementada no site público estático, incluindo linguagem compartilhada de convites, suporte e páginas legais. Não altera backend, aplicativo Windows, release, domínio ou deploy. A ilustração ficcional é marca, sem representar usuário real, testemunho ou interface. As provas do aplicativo continuam sendo capturas genuínas.

## Composição e tokens atuais

`.orbit-hero` reúne copy à esquerda e arte preenchendo o palco, com gamer e lua à direita. O título “Converse, jogue” / “e compartilhe.” usa Satoshi 500, clamp(48px,5.25vw,76px), entrelinha1.07 e tracking-.035em; o destaque usa750 e chega a80px acima de1600px. Até850px, copy e arte se empilham; a arte tem420px, reduzidos a330px até540px. Uma captura real inteira `.orbit-proof` fica sob as ações do hero, com largura máxima460px, object-fit:contain, altura automática, legenda e abertura no diálogo. No mobile ela vem antes da arte. A galeria completa permanece em `.product-intro` abaixo, com título próprio. No desktop a arte alinha à direita com overlay à esquerda para preservar pessoa e lua quando o hero cresce.

A base é canvas #070b17, surface #11172a, soft #0c1122, ink #f4f2ff, muted #bfc0d5 e border #28304b. Acento #b894ff, surface-raised #1b2240, surface-blue #101b35 e violet-field #11112b. A ação usa base #6c27d9, hover #7e35ed e tinta branca. `--orbit-button` é linear-gradient(135deg,#8a35fa,#6424df); `--orbit-title` é linear-gradient(110deg,#8e65f7,#c47bff). Primary e download do header usam radius-action28px; demais controles mantêm6px e cards14px. Sombra do palco real: 0 30px 80px -50px #6543b866.

Os tokens duráveis estão no YAML de DESIGN.md e no JSON schemaVersion2. Permanecem body16px, small14px, caption12px e label13px; space-1..8 são8,12,16,24,32,48,80,112px; panel32px (24px no telefone), border-default1px solid var(--line). Motion: quick160ms, scene360ms, reveal440ms, disclosure240ms, dialog200ms; ease-out cubic-bezier(.16,1,.3,1).

## Arte e evidência

A arte decorativa foi gerada por image_gen com a referência aprovada. Desktop WebP1672×941 tem cerca de72KB; pequeno1000×563, cerca de28KB. O picture tem aria-hidden e alt vazio; textos e controles são HTML. [Proveniência](../../site/assets/mingrx-orbit.provenance.json) conserva caminho original, transformações e SHA-256; [prompt](../../site/assets/mingrx-orbit.prompt.txt) conserva a instrução. Foram feitos apenas resize e codificação WebP.

Continuam existindo duas capturas reais do renderer Mingrx3.2 com contas de demonstração: conversa/comunidade e chamada. Três abas — Conversas, Em chamada e Comunidades — reutilizam essas duas imagens, com teclado, Home/End, alternativas e legendas próprias. A transmissão de tela não é demonstrada pela captura de chamada: a legenda explicita que mostra controles. O usuário dispensou a captura dedicada (“prossiga sem isso”); não existe quarta aba fictícia.

## Comportamento preservado

O bento tem dois cartões amplos e três compactos, todos com SVG. O showcase tem quatro âncoras nativas com aria-current=step e wrapper sticky reunindo progresso e imagem no desktop. Mobile oculta a imagem persistente e usa fluxo estático; reduced motion remove sticky e movimento. A sincronização da etapa permanece em todas as larguras. Scroll passivo e requestAnimationFrame não interceptam a rolagem.

Abas usam crossfade WAAPI, imagem anterior inerte enquanto a nova decodifica, aria-busy e preload por foco/ponteiro; indicador móvel acompanha seleção e ResizeObserver. O diálogo nativo oferece Fechar, Escape, backdrop, restauração de foco, tooltip acessível, status de erro e link original. Menu móvel usa160ms e inert imediato ao fechar. FAQ mantém details/summary com interpolate-size progressivo. Conteúdo é visível por padrão; não há efeitos infinitos, cursor especial ou dependência adicional de runtime.

Download dedicado informa Windows10/11 x64 e GitHub Releases oficial, com fallback antes da consulta de versão. Cópia usa disabled, aria-busy e rótulo temporário, com URL selecionável na falha. Perfil menciona status personalizável verificado no aplicativo. Limitações reais de criptografia e ausência de app para celular/navegador permanecem explícitas.

## Pesquisa e cronologia

A pesquisa anterior permanece em [site-reference-research.md](site-reference-research.md), como material histórico suplementar. DESIGN.md e capturas de Intercom, Dimension, Notion e Vercel no Refero foram examinados na continuação após a primeira implementação. HTML oficial complementar foi obtido, mas o navegador encontrou falha TLS; não se afirma observação dinâmica de animações externas. A referência cósmica posterior do usuário prevalece sobre essa pesquisa.

## Verificação e prévia

A revisão independente da direção Orbit concluiu SHIP sem correções materiais. Electron, inspeção Playwright em oito larguras e axe passaram. As verificações automáticas de acessibilidade não substituem itens manuais incompletos. ESLint10.14 foi aprovado somente no site; não foram adicionadas dependências de runtime de produção. O detector Impeccable foi tentado, mas o launcher estava ausente; não há sucesso de detector alegado.

No laboratório controlado, LCP foi1,504s no desktop e1,368s no mobile, CLS0 em ambos e amostras de interação48ms/40ms, respectivamente. São medições locais, sem alegação de INP de campo ou pontuação Lighthouse.

Na raiz do repositório:

```sh
node site/build.mjs && node site/preview.mjs
```

A prévia serve somente o build estático em http://127.0.0.1:4173/, aceita GET/HEAD e não publica o site. Rotas, scripts, fonte,404 e405 foram verificados. Ctrl+C encerra. Branch/PR de rascunho são etapas separadas; não se afirma aqui sua criação nem merge em main ou deploy.

## Camada reutilizável concluída

[site-components.md](site-components.md) documenta Buttons, Cards, Tabs, Dialogs, Tooltips, Accordion e Navigation. O módulo próprio `site/components.js` carrega com defer antes de app.js e entra no build; não usa framework ou dependência nova de runtime. Mount por escopo usa WeakMap para ser idempotente. Cada galeria resolve seus próprios aria-controls/painéis e oferece tabs(root).select; setButtonBusy preserva disabled/rótulo originais e aceita data-button-label. Navegação e diálogos têm instâncias próprias; links escolhem data-preview-dialog ou usam o diálogo primário. App.js mantém o controle das tarefas de página.

Tooltips usam popover manual no top layer quando disponível, clamp/flip na viewport, foco/hover e fechamento por Escape, scroll/resize ou diálogo. Cards e accordions são padrões nativos HTML/CSS. Tokens novos: duration-tooltip120ms, shadow-card-hover0 12px 28px -20px #8d64cc66, card-border-hover#6c5694, control-py13px, control-px23px, space-card28px e compact24px.

A chegada da prova real usa440ms com atraso130ms, opacidade0→1, escala.99→1 e deslocamento16px; descrição50ms e ações90ms seguem o título. A arte decorativa recebe profundidade limitada conforme a regra de movimento abaixo; as capturas não recebem parallax. Legendas da galeria reservam128px/140px nos breakpoints móveis, sem cortar texto. Testes confirmaram variação de palco menor que2px, duas galerias independentes com IDs próprios e remontagem sem duplicação, tooltip na viewport e cancelamento ao ativar reduced motion durante transição. Lint, build, Electron, oito larguras e axe passaram; revisão independente sem achados materiais. O escopo permanece na mesma branch/PR45, sem produção, backend ou aplicativo alterados.

## Movimento final

Revelações de seção usam opacidade 0→1 e deslocamento de 16px em440ms. WeakSet e unobserve garantem execução única, inclusive após alternar reduced motion; elementos contendo foco pulam a animação. Foram incluídos galeria, showcase, download, FAQ e filhos do rodapé. Sem JavaScript/IntersectionObserver o conteúdo permanece visível. Cards têm stagger40/80ms no desktop e zero no mobile; microinterações continuam160ms e crossfade360ms.

A arte Orbit usa parallax de no máximo8px (`orbit-depth`), apenas em desktop>=851px/no-preference e perto do hero visível. IO controla ativação; listeners passivos de scroll/resize agendam rAF apenas por eventos, sem loop contínuo. Will-change é temporário e escala1.025 evita bordas. Mobile/reduced motion removem listeners e profundidade; scroll nativo e capturas estáticas preservados. Nenhuma dependência foi adicionada. A revisão final de movimento concluiu entrega sem regressões materiais; verificações existentes passaram.
