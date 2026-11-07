---
name: Mingrx — mingrx.site
description: Sistema visual escuro do site público, baseado no aplicativo real.
colors:
  primary: "#b894ff"
  primary-hover: "#7e35ed"
  action-ink: "#ffffff"
  action: "#6c27d9"
  soft: "#0c1122"
  canvas: "#070b17"
  surface: "#11172a"
  ink: "#f4f2ff"
  muted: "#bfc0d5"
  border: "#28304b"
  surface-hover: "#242330"
  border-hover: "#666174"
  scene-hover: "#23222e"
  scene-selected: "#33283f"
  scene-selected-ink: "#f0e6ff"
  violet-field: "#11112b"
  surface-raised: "#1b2240"
  surface-blue: "#101b35"
  blue: "#a8c8ff"
gradients:
  orbit-button: "linear-gradient(135deg,#8a35fa,#6424df)"
  orbit-title: "linear-gradient(110deg,#8e65f7,#c47bff)"
text-sizes:
  body: "16px"
  small: "14px"
  caption: "12px"
  label: "13px"
  section: "clamp(34px,4vw,54px)"
borders:
  default: "1px solid {colors.border}"
typography:
  display:
    fontFamily: "Satoshi, Arial, sans-serif"
    fontSize: "clamp(48px,5.25vw,76px)"
    fontWeight: 500
    lineHeight: 1.07
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Satoshi, Arial, sans-serif"
    fontSize: "clamp(34px, 4vw, 54px)"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Satoshi, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 720
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Satoshi, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Satoshi, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 750
    lineHeight: 1.5
rounded:
  action: "28px"
  control: "6px"
  image: "12px"
  frame: "14px"
  card: "14px"
spacing:
  space-1: "8px"
  space-2: "12px"
  space-3: "16px"
  space-4: "24px"
  space-5: "32px"
  space-6: "48px"
  space-7: "80px"
  space-8: "112px"
  control-gap: "12px"
  compact: "20px"
  content: "24px"
  section-gap: "35px"
  wide-gap: "48px"
  story-gap: "80px"
  panel: "32px"
motion:
  duration-quick: "160ms"
  duration-scene: "360ms"
  duration-reveal: "440ms"
  duration-disclosure: "240ms"
  duration-dialog: "200ms"
  ease-out: "cubic-bezier(.16,1,.3,1)"
shadows:
  stage: "0 30px 80px -50px #6543b866"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    backgroundImage: "{gradients.orbit-button}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.action}"
    padding: "13px 23px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 23px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-hover}"
  button-text:
    textColor: "{colors.ink}"
    padding: "7px 0"
  scene-tab:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "9px 15px"
  scene-tab-selected:
    backgroundColor: "{colors.scene-selected}"
    textColor: "{colors.scene-selected-ink}"
  utility-card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.frame}"
    padding: "42px"
---

# Design System: Mingrx — mingrx.site

## Overview

**Creative North Star: "Converse, jogue e compartilhe — no universo Mingrx"**

A referência cósmica fornecida e aprovada mais recentemente pelo usuário é a autoridade visual principal: pessoa fictícia sentada em uma crista rochosa, lua enorme com contorno violeta e M luminoso, céu navy, título branco e “compartilhe” violeta. Esta direção Orbit está implementada e substitui as antigas regras de hero editorial dividido, ação sólida, ausência de gradientes, cápsulas e ilustração. Satoshi e a marca Mingrx permanecem.

O sistema governa somente o site público, incluindo início, convites, suporte e páginas legais. Mantém arquitetura estática e fatos do aplicativo Windows. A ilustração de marca é ficcional e decorativa; a demonstração do produto usa capturas genuínas em uma seção própria abaixo do hero.

## Colors

Canvas navy #070b17, surface #11172a e soft #0c1122 sustentam texto claro #f4f2ff e muted #bfc0d5. Border #28304b delimita os planos; surface-raised #1b2240, surface-blue #101b35 e violet-field #11112b mantêm profundidade tonal. O acento #b894ff identifica foco, links e seleção de cenas.

**Orbit Action Rule.** Ações principais e download do header usam tinta branca, base #6c27d9, gradiente violeta `linear-gradient(135deg,#8a35fa,#6424df)` e raio 28px. Hover usa base #7e35ed e gradiente #9e4cff → #7633ee. O destaque “compartilhe” usa `linear-gradient(110deg,#8e65f7,#c47bff)`. Gradientes de superfície e o reaproveitamento discreto da arte no fechamento pertencem à direção aprovada; não indicam capacidades do produto.

## Typography

Satoshi variável é auto-hospedada em `site/assets/fonts/satoshi-variable.woff2`, com licença ITF Free Font License preservada ao lado. O arquivo oficial, sem modificações, é obtido no build e verificado por SHA-256; não é redistribuído no repositório. O arquivo cobre pesos 300–900; Arial e sans-serif são os fallbacks.

Os tokens CSS compartilhados `--text-body`, `--text-small`, `--text-caption` e `--text-label` usam 16, 14, 12 e 13px; `--type-section` usa `clamp(34px,4vw,54px)`. O label do botão padrão conserva 14px pela variante small.

Display serve à abertura; headline às passagens principais; title aos passos; body ao texto corrente; label ao botão padrão. A navegação usa texto de 13px com peso 650, e notas/captions usam 12–13px. Textos legais usam 15px com entrelinha 1.95, reduzindo a 14px no telefone; a coluna de artigo limita-se a 74ch.

O hero usa “Converse, jogue” / “e compartilhe.” em Satoshi 500, `clamp(48px,5.25vw,76px)`, entrelinha 1.07 e tracking -.035em; o destaque usa peso 750. Acima de 1600px chega a 80px. Até 850px usa clamp de 46–64px; até 540px usa `clamp(38px,10.5vw,56px)` e entrelinha 1.08. Títulos de seção no telefone usam 36px. Não simular outra família tipográfica com peso ou espaçamento.

## Layout

A largura principal é limitada a 1240px, com 40px de margem lateral no desktop. Os pontos de adaptação são 1100px, 850px e 540px: margens laterais passam a 32px, 24px e 20px. A navegação fixa ocupa 82px no desktop e 74px até 850px.

O `.orbit-hero` apresenta copy à esquerda, com largura de 53% (máximo 640px), e a arte preenchendo o palco, com gamer e lua à direita. O hero tem altura mínima limitada a 820px/viewport no desktop e 860px acima de 1600px. Até 850px copy e arte se empilham; a arte tem 420px, reduzidos a 330px até 540px, com enquadramento à direita. A prova do aplicativo fica abaixo, em `.product-intro`, com título próprio e galeria real em largura integral. O bento tem dois cartões amplos e três compactos, todos com iconografia SVG coerente; até 850px os compactos se reorganizam e até 540px todos ocupam uma coluna. O showcase tem wrapper `.showcase-display` sticky à esquerda, reunindo navegação de progresso e visual, e quatro etapas à direita, sem interceptar a rolagem nativa; até 850px usa apresentação estática em sequência, com imagens nas duas primeiras etapas. O ritmo das seções passa de 112px para 75px e 65px. Passos e tópicos de suporte tornam-se uma coluna até 540px. Não transformar todas as passagens em cartões iguais.

O ritmo compartilhado `--space-1` a `--space-8` usa 8, 12, 16, 24, 32, 48, 80 e 112px. `--border-default` centraliza `1px solid var(--line)` e `--radius-control` centraliza 6px nos controles. O rodapé usa grid de marca e três grupos de links, gap de 80px no desktop, títulos de grupo de 14px e links de 13px; até 850px a marca fica acima dos grupos e até 540px os links usam duas colunas, com o último grupo em largura total.

As páginas legais usam largura máxima de 1100px, sumário de 200px e artigo em coluna fluida, com intervalo de 75px. Até 850px, o sumário entra no fluxo antes do artigo; o título permanece fora do disclosure. Convites usam um contêiner de até 660px.

As capturas mantêm acesso à imagem completa. No telefone, a galeria abaixo do hero mostra recortes reais de detalhe em um quadro de proporção 430/164 com `object-fit: contain`; o link para a captura completa continua disponível. O showcase móvel evita repetir imagens nas etapas de tela e comunidade.

## Elevation & Depth

A sombra do palco de produto é `0 30px 80px -50px #6543b866`. Botões têm borda e luz interna discretas; a lua e a iluminação violeta pertencem à arte estática. Ações e cartões têm hover discreto. Os tokens de duração são quick 160ms, scene 360ms e reveal 440ms; a curva de saída é `cubic-bezier(.16,1,.3,1)`. A chegada do palco usa 500ms com atraso de 120ms. O disclosure usa 240ms para interpolar altura quando `interpolate-size` está disponível, além da entrada de conteúdo existente em 200ms. O diálogo usa 200ms para entrada e saída nativas com transições discretas de display e overlay quando suportadas.

Conteúdo é visível por padrão. IntersectionObserver adiciona revelações uma única vez e só acompanha o showcase quando ele se aproxima da viewport. O acompanhamento usa listeners passivos e requestAnimationFrame, sem scroll hijack. As imagens do showcase alternam opacidade e escala discreta; as abas usam crossfade com Web Animations API, sem depender de View Transitions. A imagem anterior permanece em uma cópia inerte e oculta à acessibilidade durante a decodificação da próxima; o palco sinaliza `aria-busy` enquanto aguarda. Foco ou pointerenter antecipa a carga. Erros mantêm os links originais disponíveis; movimento reduzido ou ausência da API resulta em troca direta. Não há autoplay, rolagem imposta ou dependência de animação para ler.

`prefers-reduced-motion: reduce` remove animações, transições, transformações de hover e sticky; a narrativa permanece legível. Até 850px, o showcase também dispensa sticky e oculta o visual persistente; a narrativa e os quatro links de progresso ficam no fluxo nativo. A etapa mais próxima da linha central e `aria-current="step"` continuam sincronizados em todas as larguras, inclusive com movimento reduzido, sem animação ou rolagem imposta.

## Shapes

Ações principais e download do header usam raio 28px; os demais controles mantêm 6px. Figuras e blocos de contato usam o raio image, e a moldura principal e o convite usam frame. A moldura principal passa a image no telefone. Bordas estruturais têm 1px. O formato arredondado das ações é explicitamente autorizado pela nova referência.

## Components

**Botões.** Primary destaca download ou abertura do aplicativo; secondary oferece o caminho alternativo. Ambos têm altura mínima de 52px; a variante compacta tem 44px. O link textual sublinhado tem alvo mínimo de 44px. Hover altera cor/preenchimento e desloca o botão em 2px; botões em operação ficam desabilitados, com opacidade .7 e cursor de espera.

**Foco e seleção.** O foco visível usa contorno violeta de 3px e afastamento de 5px. A seleção de texto usa #6930c9 com tinta branca; o skip link usa #6c27d9 com tinta branca. O skip link aparece ao receber foco; alvos de navegação programática não recebem contorno artificial.

**Navegação.** Links discretos clareiam em hover. IntersectionObserver identifica a seção corrente dos links internos com `aria-current="location"` e sublinhado violeta; Download leva à seção dedicada `#download`. Até 850px, o botão Menu alterna `aria-expanded` e abre links em coluna. Escape fecha e devolve foco ao botão; clique externo, navegação e retorno ao desktop fecham o menu. A entrada e saída móvel usam 160ms com opacidade, deslocamento de 6px e display discreto quando suportado; ao fechar, `inert` retira imediatamente os links da interação, antes de terminar a transição.

**Cenas.** Três abas, Conversas, Em chamada e Comunidades, controlam um painel visível com imagem e legenda. `aria-selected`, `tabindex` itinerante e `hidden` representam o estado; setas, Home e End selecionam e movem foco entre as três abas. A aba Comunidades reutiliza a captura verdadeira de conversa/comunidade, com alternativa textual e legenda próprias; não representa uma terceira captura distinta. O indicador de seleção se move em 160ms por `--tab-x` e `--tab-width`; ResizeObserver e o término da carga das fontes recalculam posição e largura. A faixa é decorativa (`aria-hidden`), enquanto a seleção continua representada por `aria-selected`. Não há rotação automática. O showcase tem quatro etapas (conversas, chamada, tela e comunidade), mas reutiliza somente duas capturas reais. A etapa de compartilhamento declara explicitamente que a imagem mostra controles, não uma transmissão de tela. O usuário autorizou prosseguir sem uma captura dedicada de transmissão ("prossiga sem isso"). As capturas são do renderer real 3.2 com conteúdo demonstrativo; a proveniência está em `site/assets/mingrx-captures.provenance.json`.

**Leitura e disclosure.** FAQ usa `details/summary` nativos, divisórias e símbolo de mais que gira ao abrir. `interpolate-size: allow-keywords` e `::details-content` acrescentam transição de altura em 240ms quando suportados; sem suporte, o disclosure nativo continua operacional. O sumário legal é outro disclosure real: abre inicialmente em larguras acima de 850px; em telas menores inicia recolhido. Os tópicos de suporte são links de tarefa com divisórias, sem campos de formulário.

**Inspeção de capturas.** Links `data-preview` abrem um `<dialog>` nativo quando `showModal` está disponível. Fechar, Escape e clique no backdrop encerram a inspeção e devolvem foco ao acionador, sem rolar a página. O botão Fechar tem tooltip “Fechar (Esc)” associado por `aria-describedby`, visível em hover e foco, com entrada discreta de 120ms. O diálogo tem título acessível, alternativa textual, status de carregamento/erro e link permanente à imagem original. Cliques modificados e ambientes sem suporte mantêm o link original. A imagem usa `object-fit: contain`; a página bloqueia rolagem de fundo durante o modal. Entrada e saída usam opacidade e deslocamento mínimos, sem movimento em reduced motion.

**Download e perfil.** A seção `#download` apresenta Windows 10 ou 11, instalador de 64 bits e GitHub Releases oficial, com ajuda de instalação e aviso de ausência de versão para celular/navegador. A arquitetura x64 foi conferida no instalador. O painel usa padding de 32px (24px até 540px), raio card e ação em largura total; as duas colunas viram uma até 850px. O cartão “Do seu jeito” descreve status personalizável no perfil, capacidade verificada em `desktop/src/v1.js:149`, além de amigos e conversas recentes.

**Convite e retorno de estado.** O cartão mostra código e mensagem em região de status. Código malformado oculta a abertura e pede outro convite; instalação continua secundária. Código de formato válido tenta o protocolo e oferece recuperação, sem afirmar validade ou autorização da comunidade. Durante a cópia, o botão fica desabilitado, recebe `aria-busy` e texto “Copiando link…”. Ao terminar, restaura o rótulo e a disponibilidade. Cópia anuncia sucesso somente após confirmação da API; falha revela texto selecionável. Downloads têm fallback oficial disponível antes da consulta de versão.

## Do's and Don'ts

### Do:
- Do preservar tema escuro, marca reconhecível e foco visível.
- Do usar capturas reais com conteúdo demonstrativo identificado e proveniência.
- Do manter download, convite e leitura compreensíveis também no telefone.

### Don't:
- Don't adicionar animação excessiva ou infinita, cursor especial ou scroll hijack.
- Don't inventar depoimentos, métricas, usuários reais ou diferenciação do produto; a pessoa fictícia da arte não é testemunho.
- Don't aplicar estes tokens ao aplicativo Windows como se fossem seu sistema existente.

## Arte própria e proveniência

A ilustração gerada por image_gen representa uma pessoa anônima fictícia na crista rochosa, lua violeta e monograma M. Não é captura, usuário real ou evidência funcional. O `<picture>` é decorativo (`aria-hidden`, alt vazio), enquanto headline e controles permanecem HTML. O WebP desktop tem 1672×941 e cerca de 72KB; a versão pequena tem 1000×563 e cerca de 28KB. `site/assets/mingrx-orbit.provenance.json` registra original, transformações e SHA-256; `site/assets/mingrx-orbit.prompt.txt` conserva o prompt. As transformações foram resize e WebP, sem UI composta na imagem.

A direção acrescenta somente HTML/CSS e arte otimizada, sem runtime JS adicional, efeitos infinitos ou cursor especial. As duas capturas genuínas e suas três vistas de galeria continuam separadas da ilustração.

## Fontes e pesquisa do briefing ampliado

A referência visual cósmica mais recente do usuário prevalece sobre a pesquisa anterior. O registro histórico suplementar está em [docs/design/site-reference-research.md](docs/design/site-reference-research.md). Foram examinados os DESIGN.md e capturas de Intercom, Dimension, Notion e Vercel no Refero Styles. São materiais interpretados do catálogo, não código oficial das marcas. O tema escuro, a fonte Satoshi e a realidade do produto Mingrx prevalecem sobre os materiais claros e as regras tipográficas das referências.

A pesquisa específica no Refero ocorreu na continuação do briefing, depois da implementação inicial; não é atribuída retroativamente à primeira passagem. HTML oficial de Linear, Raycast, Vercel, shadcn/ui e Motion foi consultado. O navegador encontrou falhas de certificado nessas fontes; não se afirma que animações externas tenham sido verificadas ao vivo.

A galeria oferece Conversas, Em chamada e Comunidades. A comunidade usa a captura real já disponível, sem fabricar uma terceira imagem. O showcase expõe quatro links nativos de progresso; `aria-current="step"` acompanha o texto em foco de leitura. O scroll continua nativo. A captura dedicada de transmissão foi dispensada pelo usuário; não é criada uma aba fictícia de compartilhamento.

Em desktop de pouca altura, o wrapper sticky respeita topo mínimo de 110px abaixo do header; até 700px de altura, a moldura limita-se a `calc(100svh - 250px)`. A navegação de progresso continua clicável, validada por hit testing em 700, 600 e 500px de altura.
