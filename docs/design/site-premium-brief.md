# Mingrx — direção institucional premium

## Escopo e intenção

Redesign completo do site público, mantendo HTML, CSS e JavaScript estáticos, rotas existentes e hospedagem atual. Não altera backend, aplicativo Windows, release ou deploy. A solicitação explícita do usuário autoriza movimento sutil e substitui a orientação antiga de ausência de animações em DESIGN.md. PRODUCT.md permanece a referência de capacidades e compromissos de marca.

## Direção implementada

Grafite escuro, violeta sólido e azul; Satoshi e marca reconhecível preservadas. Hero editorial: título à esquerda, descrição e ações à direita, captura real em largura integral abaixo. Bento com dois cartões amplos e três compactos. Ação principal de download oficial clara, com alternativa de copiar o endereço no celular. Convites, suporte e páginas legais mantêm linguagem visual compartilhada e leitura acessível.

O showcase tem quatro etapas: conversas, chamada, compartilhamento de tela e comunidade. Há somente duas capturas reais: conversa/comunidade e chamada, com contas de demonstração. A imagem de chamada mostra controles de compartilhamento; a etapa correspondente explicita que uma transmissão de tela não está representada. Não foram inventados depoimentos, métricas, evidência visual ou diferenciação competitiva. A proveniência está em site/assets/mingrx-captures.provenance.json.

## Tokens e comportamento

DESIGN.md contém os tokens YAML duráveis; .impeccable/design.json preserva schemaVersion 2 e registra os mesmos novos tokens nas extensões. Cores: surface-raised #1b1d29, surface-blue #121b2b e blue #a8c8ff. Raios: card 14px, control 6px. Tempos: quick 160ms, scene 360ms, reveal 440ms. Curva: cubic-bezier(.16,1,.3,1). Sombra do palco: 0 24px 70px -35px #0009.

CSS e IntersectionObserver fornecem revelações únicas e transições discretas. Conteúdo permanece visível por padrão; não há autoplay nem interceptação da rolagem. O showcase usa sticky nativo no desktop, acompanhamento passivo e requestAnimationFrame. Até 850px a narrativa é estática; até 540px o bento vira uma coluna. Reduced motion remove animações, transições, transformações de hover e sticky. Abas, menu e disclosures preservam teclado, foco e semântica nativa.

## Verificação e limites

A implementação foi verificada pela suíte Electron existente e por inspeção Playwright em oito larguras, incluindo navegação, abas, responsividade e movimento reduzido; as rotas foram preservadas. O detector foi tentado, mas seu launcher não estava disponível: não há relatório de detector concluído. Não houve publicação ou alteração de release.
