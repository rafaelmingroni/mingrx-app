# Conferência do briefing ampliado do Mingrx

Esta matriz corresponde à versão reenviada na conversa, com Refero Styles e exigência de indicadores de progresso. Os cinco primeiros títulos seguem a numeração recebida. Os blocos seguintes chegaram sem títulos numerados e foram agrupados pelos assuntos em quinze frentes de rastreio; não se atribuem títulos literais ausentes à mensagem.

## Estado por frente

| Frente | Estado | Evidência / ressalva |
| --- | --- | --- |
| 1. Referências e ferramentas | Consultadas e avaliadas | Refero, shadcn/ui, Motion e páginas oficiais de Linear/Raycast/Vercel acessadas; Impeccable aplicado. [Pesquisa e limites](site-reference-research.md). CSS/HTML/JS nativos escolhidos; Motion não foi incorretamente tratado como exclusivo de React. |
| 2. Análise obrigatória | Executada | Repositório, stack estática, componentes, páginas, capturas, fontes, download, convites e workflows inspecionados antes da primeira implementação. Sem migração ou mudanças no aplicativo. |
| 3. Pesquisa no Refero e DESIGN.md | Complementada nesta continuação | DESIGN.md e capturas de quatro estilos examinados; princípios e fontes registrados, mantendo a cronologia verdadeira. A pesquisa específica não havia sido feita na primeira passagem. Navegação dinâmica externa bloqueada por certificado; não se inventam observações de animação. |
| 4. Identidade Mingrx | Implementada | Grafite/charcoal, branco suave, violeta sólido e azul discreto, bordas finas, raios e sombras contidos. Satoshi mantida como escolha explícita existente; Geist/Inter avaliadas, sem troca obrigatória no briefing. |
| 5. Design system/componentes | Implementados | Tokens; botões primário/secundário, busy/disabled/foco, cinco cards com SVG, três tabs com indicador móvel, diálogo nativo, tooltip, FAQ e menu acessível. |
| 6. Estrutura da landing | Implementada | Hero coordenado, screenshot real protagonista, bento variável, showcase de quatro etapas, galeria manual Conversas/Em chamada/Comunidades, download Windows real, FAQ e rodapé. Captura de transmissão dispensada pelo usuário; sem aba com imagem fabricada. |
| 7. Movimento e continuidade | Implementados | Reveal único, entrada coordenada, crossfade com decodificação, microinterações, menu/dialog e accordion progressivos. Showcase tem indicadores nativos sincronizados, sem autoplay ou interceptação do scroll. Parallax decorativo não foi usado; era opcional e não há necessidade visual para ele. |
| 8. Performance | Medida em laboratório | Imagens WebP, fonte local, prioridade do hero, lazy loading e nenhuma biblioteca nova no runtime. LCP/layout shift/interações amostradas medidos (última passagem: 1,468s/1,196s de LCP, layout shift 0/0, amostras 64/48ms); [dados brutos](site-premium-performance.json). INP e demais dados de campo não foram presumidos. |
| 9. Responsividade | Verificada | Matriz 320–1440px; 1920/2560px verificados na passagem anterior. Testes adicionais em 1440×700/600/500 para garantir progresso clicável abaixo do header. Mobile simplifica sticky e mantém controles. |
| 10. Acessibilidade | Implementada e verificada nos cenários descritos | Teclado, Home/End, foco, diálogo, menu, alt, contraste, zoom 200%, reduced motion e axe A/AA. Testes automáticos não são certificação completa de conformidade. Conteúdo e links têm fallback nativo. |
| 11. Impeccable | Skill aplicado; CLI indisponível | Contexto real, direção, craft floor, revisão independente e documentação utilizados. Launcher/detector foram realmente tentados e estavam ausentes; essa parte não é declarada como executada com sucesso. |
| 12. Branch e preservação | Mantidas | `redesign/premium-institutional`, PR em rascunho. Sem desktop, Firebase, autenticação, backend, dados, updater, instaladores, releases ou domínio alterados. |
| 13. Fluxo A–H | Aplicado à evolução do projeto | Diagnóstico existente, pesquisa complementar e direção documentada, sistema/estrutura/movimento, adaptações e qualidade. A sequência da pesquisa do Refero é explicitada na frente 3, sem reescrever a história. |
| 14. Testes e correções | Executados | ESLint 10.14.0, sintaxe, testes existentes, build, Electron, Chromium, axe, medições e correção de regressão em alturas baixas. [Registro detalhado](site-premium-validation.md). |
| 15. Entrega para revisão | Disponível na PR #45 | [PR](https://github.com/rafaelmingroni/mingrx-app/pull/45), [capturas](preview/README.md), build e prévia local. Sem publicação automática em mingrx.site. |

## Como abrir e conferir

Na raiz do repositório, nesta branch:

```sh
node site/build.mjs
node site/preview.mjs
```

Abra http://127.0.0.1:4173/ na mesma máquina. Não é preciso instalar ou iniciar o desktop/backend. O preparo usa curl para obter e verificar a fonte oficial licenciada; ela não é redistribuída como arquivo no repositório.

Lint reproduzível, como executado no CI do site:

```sh
npm exec --yes --package=eslint@10.14.0 -- eslint --config site/eslint.config.mjs site/
```

Nenhuma dependência foi adicionada ao runtime do site. ESLint é uma ferramenta de desenvolvimento/CI, obtida temporariamente pela versão fixada; Electron, Playwright e axe são ferramentas de validação.

## Limitações que não são apresentadas como resultados concluídos

- Não há captura própria de transmissão; o usuário autorizou prosseguir sem ela.
- Não foram medidos Core Web Vitals de campo ou INP real da nova versão em produção. Há medição local controlada e amostras de interação identificadas como tais.
- O CLI do Impeccable não foi instalado neste executor; o skill e revisões foram utilizados, sem alegar um detector bem-sucedido.
- Não foram verificadas animações ao vivo dos sites de referência cujo navegador rejeitou o certificado. Os DESIGN.md/capturas do catálogo foram acessados e examinados por caminhos com TLS verificado.
- A nova versão não foi publicada no domínio. Essa ação depende de autorização conforme o briefing.
