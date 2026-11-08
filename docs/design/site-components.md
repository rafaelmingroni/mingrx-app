# Componentes reutilizáveis do site Mingrx

O site continua em HTML/CSS/JavaScript estáticos. `site/components.js` concentra comportamento de navegação, tabs, diálogos de captura, tooltips e estado de botão. Cards e accordions são padrões semânticos nativos com CSS compartilhado; não precisam de JavaScript para exibir conteúdo.

## Inicialização

Carregue `styles.css`, depois `components.js` antes de `app.js`, ambos com `defer`. O app chama `window.MingrxUI.mount(document)` após o parse. Para outro bloco de componentes na mesma página, chame `MingrxUI.mount(bloco)`.

A montagem é idempotente e registra cada raiz em WeakMap. A galeria resolve seus controles e painéis dentro da própria raiz, sem depender de IDs como `scene-conversation`. IDs continuam únicos no documento para cumprir ARIA. O teste de navegador monta duas galerias com IDs diferentes e confirma estado independente e ausência de indicador duplicado após remontagem.

O módulo é voltado às páginas estáticas existentes; não introduz roteador ou runtime de SPA.

| Componente | Contrato reutilizável | Comportamento |
| --- | --- | --- |
| Botão | `.button`, `.button-primary` ou `.button-secondary` | Foco, hover, active, disabled e tokens compartilhados. Links de download permanecem links com fallback oficial; não são bloqueados aguardando API. |
| Estado de carregamento | `MingrxUI.setButtonBusy(button, true, 'Carregando…')`, depois `false` | Salva e restaura rótulo e estado disabled original. Chamadas repetidas não sobrescrevem o original. Aceita `[data-button-label]` ou nó de texto do botão. Usado na cópia de link. |
| Card | `<article class="feature-card">` | Borda/raio/padding, iluminação, sombra e elevação de 3px com transições curtas. `.bento-grid` define a composição responsiva; variantes de mídia mantêm capturas genuínas. |
| Tabs | Raiz `[data-ui-tabs]`, `[role=tablist]`, botões `[role=tab][data-scene][aria-controls]`, painéis `[role=tabpanel]` | Indicador móvel, setas/Home/End, tabindex itinerante e aria-selected. Uma instância não altera a outra. `.select(nome)` via `MingrxUI.tabs(raiz)`; nome inexistente retorna sem trocar o conteúdo. |
| Diálogo de captura | `<dialog data-ui-dialog id="…">` com slots existentes da imagem/status/original/fechar | Foco/top layer nativos, Escape, backdrop, entrada/saída, recuperação de erro e retorno ao acionador. Sem suporte, links originais continuam normais. |
| Disparador de captura | `<a data-preview data-preview-dialog="id-do-dialogo" href="captura-real.webp">` | Liga explicitamente outra instância. Links sem alvo usam o diálogo com `data-primary-dialog`. Modificadores Ctrl/Cmd/Shift preservam a ação normal do navegador. |
| Tooltip | Disparador `[data-ui-tooltip="id-do-texto"]` e `aria-describedby` para `<span id="…" role="tooltip">` | Entrada em 120ms e movimento de 2px. Posição calculada com limite de viewport e preferência acima quando falta espaço abaixo. Usa popover manual no top layer quando disponível; fecha em Escape, blur/saída apropriados, scroll/resize ou fechamento do diálogo. |
| Accordion | `.faq-list.ui-accordion` envolvendo `details/summary` | Semântica, teclado e conteúdo nativos. Expansão de altura com interpolate-size quando disponível; abertura direta funcional como fallback. Ícone muda com estado open. |
| Navegação | Raiz `[data-ui-navigation]`, `.menu-button[aria-controls][aria-expanded]` e `.topnav` | Menu responsivo, Escape/foco restaurado, clique fora, fechamento após link e inert imediato durante saída. O controlador da página mantém aria-current conforme as seções visíveis, limpando estados antigos. |

## Exemplo mínimo de outra galeria

```html
<section class="product-stage" data-ui-tabs>
  <div class="scene-tabs" role="tablist" aria-label="Demonstração do produto">
    <button id="extra-tab-a" role="tab" aria-controls="extra-panel-a"
      aria-selected="true" data-scene="a">Conversas</button>
    <button id="extra-tab-b" role="tab" aria-controls="extra-panel-b"
      aria-selected="false" tabindex="-1" data-scene="b">Chamadas</button>
  </div>
  <div class="scene-panels">
    <figure id="extra-panel-a" class="scene-panel" role="tabpanel"
      aria-labelledby="extra-tab-a" tabindex="0">Conteúdo real da primeira captura</figure>
    <figure id="extra-panel-b" class="scene-panel" role="tabpanel"
      aria-labelledby="extra-tab-b" tabindex="0" hidden>Conteúdo real da segunda captura</figure>
  </div>
</section>
```

A galeria existente é a referência completa com imagens e legendas. O exemplo acima documenta a estrutura e não é apresentado aos visitantes como demonstração do produto.

## Continuidade e estados

A seleção ARIA muda imediatamente; a imagem anterior permanece em uma cópia inerte até a próxima decodificar. Há crossfade de opacidade com 4px de deslocamento e escala 0,995→1; sem Web Animations ou com movimento reduzido, há troca direta. O tempo vem de `--duration-scene`. Cliques repetidos e trocas rápidas têm cobertura de regressão.

Legendas reservam espaço responsivo sem cortar o texto. Um teste mede a altura do palco antes/depois de Conversas, Em chamada e Comunidades em cinco larguras, com tolerância de menos de 2px. Não se presume estabilidade apenas porque imagens têm dimensões semelhantes.

## Tokens

Cores, superfície, tinta, borda, raios e fonte estão em `:root` e em DESIGN.md/JSON. Os complementos desta passagem são:

- `--control-py`, `--control-px`: padding do botão base.
- `--space-card`, `--space-card-compact`: padding dos cards por classe de viewport.
- `--shadow-card-hover`, `--card-border-hover`: elevação/iluminação compartilhadas.
- `--duration-tooltip`: duração de entrada do tooltip.

Permanecem os tokens de espaçamento 1–8, radius de ação/controle/card, duração quick/scene/reveal/dialog/disclosure e easing. Não há dependência nova de runtime.
