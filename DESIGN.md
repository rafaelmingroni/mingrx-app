---
name: Mingrx — mingrx.site
description: Sistema visual escuro do site público, baseado no aplicativo real.
colors:
  primary: "#c3acff"
  primary-hover: "#d4c3ff"
  action-ink: "#20152f"
  canvas: "#0c0d12"
  surface: "#161720"
  ink: "#f6f3ff"
  muted: "#b3b0c1"
  border: "#30303e"
  surface-hover: "#242330"
  border-hover: "#666174"
  scene-hover: "#23222e"
  scene-selected: "#33283f"
  scene-selected-ink: "#f0e6ff"
  violet-field: "#21192f"
  surface-raised: "#1b1d29"
  surface-blue: "#121b2b"
  blue: "#a8c8ff"
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
    fontSize: "clamp(44px, 6.2vw, 88px)"
    fontWeight: 750
    lineHeight: 1.08
    letterSpacing: "-0.04em"
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
  stage: "0 24px 70px -35px #0009"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
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

**Creative North Star: "Seu grupo de amigos, em cena"**

O sistema de mingrx.site coloca o uso social real em primeiro plano: fundo quase preto, tipografia clara e generosa, violeta sólido nas ações e capturas autênticas do produto. A apresentação institucional premium usa grafite, violeta e azul, hierarquia editorial, bento e movimento sutil com CSS e IntersectionObserver. A solicitação atual do usuário substitui a orientação anterior de ausência de animações.

Este documento governa somente o site público, incluindo início, convites, suporte e páginas de leitura. Não substitui o CSS nem a identidade de componentes do aplicativo Windows. A direção escrita já foi aprovada; os tokens registram a implementação concluída.

**Key Characteristics:**
- Fundo grafite com limites finos, superfícies violetas e azuis e sombra restrita ao palco real do produto.
- Satoshi de peso substancial e controles de cantos curtos.
- Demonstrações reais identificadas e interações deliberadas.

## Colors

O violeta claro conduz a ação; a base neutra sustenta imagens, navegação e leitura prolongada. O frontmatter é a referência normativa dos valores.

### Primary

O violeta de marca aparece no download, nos destaques tipográficos, nos links de leitura e no foco. O estado hover clareia o preenchimento; a tinta escura mantém a legibilidade do botão. O campo violeta profundo contextualiza a passagem de chamadas.

### Neutral

Canvas e surface distinguem página e contêiner. Ink identifica títulos e ações; muted organiza descrições. Border delimita navegação, sumários e conteúdo. Surface-raised permite elevação tonal; surface-blue e blue dão contraste à chamada e ao compartilhamento. As cenas selecionadas têm seu próprio par tonal.

**The Solid Action Rule.** A ação principal usa violeta sólido; nunca um gradiente.

## Typography

Satoshi variável é auto-hospedada em `site/assets/fonts/satoshi-variable.woff2`, com licença ITF Free Font License preservada ao lado. O arquivo oficial, sem modificações, é obtido no build e verificado por SHA-256; não é redistribuído no repositório. O arquivo cobre pesos 300–900; Arial e sans-serif são os fallbacks.

Os tokens CSS compartilhados `--text-body`, `--text-small`, `--text-caption` e `--text-label` usam 16, 14, 12 e 13px; `--type-section` usa `clamp(34px,4vw,54px)`. O label do botão padrão conserva 14px pela variante small.

Display serve à abertura; headline às passagens principais; title aos passos; body ao texto corrente; label ao botão padrão. A navegação usa texto de 13px com peso 650, e notas/captions usam 12–13px. Textos legais usam 15px com entrelinha 1.95, reduzindo a 14px no telefone; a coluna de artigo limita-se a 74ch.

Títulos têm quebra balanceada. Em telas até 540px, o título inicial usa `clamp(34px,9.7vw,48px)` com entrelinha 1.13; títulos de seção usam 36px. Não simular outra família tipográfica com peso ou espaçamento.

## Layout

A largura principal é limitada a 1240px, com 40px de margem lateral no desktop. Os pontos de adaptação são 1100px, 850px e 540px: margens laterais passam a 32px, 24px e 20px. A navegação fixa ocupa 82px no desktop e 74px até 850px.

O hero usa duas colunas no desktop: título à esquerda, descrição e ações à direita, com captura real em largura integral abaixo. Até 850px o conteúdo se empilha. O bento tem dois cartões amplos e três compactos; até 850px os compactos se reorganizam e até 540px todos ocupam uma coluna. O showcase tem visual sticky à esquerda e quatro etapas à direita, sem interceptar a rolagem nativa; até 850px usa apresentação estática em sequência, com imagens nas duas primeiras etapas. O ritmo das seções passa de 112px para 75px e 65px. Passos e tópicos de suporte tornam-se uma coluna até 540px. Não transformar todas as passagens em cartões iguais.

O ritmo compartilhado `--space-1` a `--space-8` usa 8, 12, 16, 24, 32, 48, 80 e 112px. `--border-default` centraliza `1px solid var(--line)` e `--radius-control` centraliza 6px nos controles. O rodapé usa grid de marca e três grupos de links, gap de 80px no desktop, títulos de grupo de 14px e links de 13px; até 850px a marca fica acima dos grupos e até 540px os links usam duas colunas, com o último grupo em largura total.

As páginas legais usam largura máxima de 1100px, sumário de 200px e artigo em coluna fluida, com intervalo de 75px. Até 850px, o sumário entra no fluxo antes do artigo; o título permanece fora do disclosure. Convites usam um contêiner de até 660px.

As capturas mantêm acesso à imagem completa. No telefone, o hero mostra recortes reais de detalhe em um quadro de proporção 430/164 com `object-fit: contain`; o link para a captura completa continua disponível. O showcase móvel evita repetir imagens nas etapas de tela e comunidade.

## Elevation & Depth

A sombra `stage` (`0 24px 70px -35px #0009`) destaca somente a moldura do produto. Ações e cartões têm hover discreto, sem halos. Os tokens de duração são quick 160ms, scene 360ms e reveal 440ms; a curva de saída é `cubic-bezier(.16,1,.3,1)`. A chegada do palco usa 500ms com atraso de 120ms. O disclosure usa 240ms para interpolar altura quando `interpolate-size` está disponível, além da entrada de conteúdo existente em 200ms. O diálogo usa 200ms para entrada e saída nativas com transições discretas de display e overlay quando suportadas.

Conteúdo é visível por padrão. IntersectionObserver adiciona revelações uma única vez e só acompanha o showcase quando ele se aproxima da viewport. O acompanhamento usa listeners passivos e requestAnimationFrame, sem scroll hijack. As imagens do showcase alternam opacidade e escala discreta; as abas usam crossfade com Web Animations API, sem depender de View Transitions. A imagem anterior permanece em uma cópia inerte e oculta à acessibilidade durante a decodificação da próxima; o palco sinaliza `aria-busy` enquanto aguarda. Foco ou pointerenter antecipa a carga. Erros mantêm os links originais disponíveis; movimento reduzido ou ausência da API resulta em troca direta. Não há autoplay, rolagem imposta ou dependência de animação para ler.

`prefers-reduced-motion: reduce` remove animações, transições, transformações de hover e sticky; a narrativa permanece legível. Até 850px, o showcase também dispensa sticky e acompanhamento de etapas.

## Shapes

Controles usam cantos curtos; figuras e blocos de contato usam o raio image, e a moldura principal e o convite usam frame. A moldura principal passa a image no telefone. Bordas estruturais têm 1px. Botões não têm formato de cápsula.

## Components

**Botões.** Primary destaca download ou abertura do aplicativo; secondary oferece o caminho alternativo. Ambos têm altura mínima de 52px; a variante compacta tem 44px. O link textual sublinhado tem alvo mínimo de 44px. Hover altera cor/preenchimento e desloca o botão em 2px; botões em operação ficam desabilitados, com opacidade .7 e cursor de espera.

**Foco e seleção.** O foco visível usa contorno violeta de 3px e afastamento de 5px. A seleção de texto usa o mesmo violeta com tinta escura. O skip link aparece ao receber foco; alvos de navegação programática não recebem contorno artificial.

**Navegação.** Links discretos clareiam em hover. IntersectionObserver identifica a seção corrente dos links internos com `aria-current="location"` e sublinhado violeta; Download leva à seção dedicada `#download`. Até 850px, o botão Menu alterna `aria-expanded` e abre links em coluna. Escape fecha e devolve foco ao botão; clique externo, navegação e retorno ao desktop fecham o menu. A entrada e saída móvel usam 160ms com opacidade, deslocamento de 6px e display discreto quando suportado; ao fechar, `inert` retira imediatamente os links da interação, antes de terminar a transição.

**Cenas.** Duas abas, Conversas e Em chamada, controlam um painel visível com imagem e legenda. `aria-selected`, `tabindex` itinerante e `hidden` representam o estado; setas, Home e End selecionam e movem foco. O indicador de seleção se move em 160ms por `--tab-x` e `--tab-width`; ResizeObserver e o término da carga das fontes recalculam posição e largura. A faixa é decorativa (`aria-hidden`), enquanto a seleção continua representada por `aria-selected`. Não há rotação automática. O showcase tem quatro etapas (conversas, chamada, tela e comunidade), mas reutiliza somente duas capturas reais. A etapa de compartilhamento declara explicitamente que a imagem mostra controles, não uma transmissão de tela. O usuário autorizou prosseguir sem uma captura dedicada de transmissão ("prossiga sem isso"). As capturas são do renderer real 3.2 com conteúdo demonstrativo; a proveniência está em `site/assets/mingrx-captures.provenance.json`.

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
- Don't usar gradientes, cápsulas, halos, animação excessiva, cursor especial ou scroll hijack.
- Don't inventar depoimentos, métricas, retratos ou diferenciação do produto.
- Don't aplicar estes tokens ao aplicativo Windows como se fossem seu sistema existente.
