# Mingrx — direção institucional premium

## Escopo e intenção

Redesign completo do site público, mantendo HTML, CSS e JavaScript estáticos, rotas existentes e hospedagem atual. Não altera backend, aplicativo Windows, release ou deploy. A solicitação explícita do usuário autoriza movimento sutil e substitui a orientação antiga de ausência de animações em DESIGN.md. PRODUCT.md permanece a referência de capacidades e compromissos de marca.

## Direção implementada

Grafite escuro, violeta sólido e azul; Satoshi e marca reconhecível preservadas. Hero editorial: título à esquerda, descrição e ações à direita, captura real em largura integral abaixo. Bento com dois cartões amplos e três compactos. Ação principal de download oficial clara, com alternativa de copiar o endereço no celular. Convites, suporte e páginas legais mantêm linguagem visual compartilhada e leitura acessível.

O showcase tem quatro etapas: conversas, chamada, compartilhamento de tela e comunidade. Há somente duas capturas reais: conversa/comunidade e chamada, com contas de demonstração. A imagem de chamada mostra controles de compartilhamento; a etapa correspondente explicita que uma transmissão de tela não está representada. Não foram inventados depoimentos, métricas, evidência visual ou diferenciação competitiva. A proveniência está em site/assets/mingrx-captures.provenance.json. O usuário dispensou a captura dedicada de transmissão de tela ("prossiga sem isso"); a ressalva continua explícita no site.

## Tokens e comportamento

DESIGN.md contém os tokens YAML duráveis; .impeccable/design.json preserva schemaVersion 2 e registra os mesmos novos tokens nas extensões. Cores: surface-raised #1b1d29, surface-blue #121b2b e blue #a8c8ff. Raios: card 14px, control 6px. Espaço: panel 32px (24px no telefone). Tempos: quick 160ms, scene 360ms, reveal 440ms, disclosure 240ms, dialog 200ms. Curva: cubic-bezier(.16,1,.3,1). Sombra do palco: 0 24px 70px -35px #0009.

CSS e IntersectionObserver fornecem revelações únicas e transições discretas. Conteúdo permanece visível por padrão; não há autoplay nem interceptação da rolagem. O showcase usa sticky nativo no desktop, acompanhamento passivo e requestAnimationFrame. Até 850px a narrativa é estática; até 540px o bento vira uma coluna. Reduced motion remove animações, transições, transformações de hover e sticky. Abas, menu e disclosures preservam teclado, foco e semântica nativa.

## Conclusão da segunda passagem

A seção dedicada `#download` apresenta Windows 10/11 de 64 bits, instalador oficial pelo GitHub Releases, ajuda de instalação e limitações de plataforma. A arquitetura x64 foi conferida no instalador. O cartão de perfil inclui status personalizável, verificado em `desktop/src/v1.js:149`. A navegação interna acompanha a seção ativa com `aria-current="location"`.

A inspeção de capturas usa `<dialog>` nativo, com Fechar, Escape, clique no backdrop e restauração de foco. Status informa carga e falha; o link à imagem original permanece disponível. Cliques modificados e falta de `showModal` preservam a navegação original. CSS anima entrada e saída com display/overlay discretos quando suportados; reduced motion remove o movimento.

A troca das abas usa WAAPI por ponteiro e teclado, sem depender de View Transitions. A captura anterior fica em uma cópia inerte enquanto a nova decodifica, com `aria-busy` no palco durante a espera; foco e pointerenter antecipam a carga. A FAQ mantém `details/summary`, com interpolação progressiva de altura em navegadores compatíveis.

`site/build.mjs` prepara a fonte verificada, valida HTML e convites e copia somente arquivos públicos para saída estática separada. O benchmark de `site/test-performance.cjs` mede cenários locais controlados com cache frio e limites de CPU/rede; não representa INP de campo, dados de produção ou pontuação Lighthouse. Resultados e números finais de performance são registrados separadamente pela verificação principal.

## Verificação e limites

A implementação foi verificada pela suíte Electron existente e por inspeção Playwright em oito larguras, incluindo navegação, abas, responsividade e movimento reduzido; as rotas foram preservadas. O detector foi tentado, mas seu launcher não estava disponível: não há relatório de detector concluído. Não houve publicação ou alteração de release.

A segunda revisão independente concluiu disposição de entrega sem problemas materiais. Axe verificou WCAG 2 A/AA, 2.1 e 2.2 na home, diálogo aberto, suporte, privacidade e convite inválido, em 1440px e 390px, sem violações automáticas. Itens classificados como incompletos continuam exigindo avaliação manual; isso não constitui certificação integral de conformidade. A suíte Electron inclui abertura do diálogo por teclado, Escape com restauração de foco e origem oficial do download dedicado.
