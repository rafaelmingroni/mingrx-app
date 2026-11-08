# Mingrx: pesquisa visual e decisão técnica

## Escopo e cronologia

Este registro complementa o briefing de 15 frentes reenviado na conversa. A implementação inicial usou o TXT anterior, de dez fases. A pesquisa específica no Refero foi realizada nesta continuação, depois da primeira implementação, antes dos ajustes de indicadores, galeria e cobertura do briefing ampliado. Não é apresentada como uma pesquisa que já tivesse ocorrido anteriormente.

Consulta em 7 de novembro de 2026. O HTML de todas as URLs abaixo foi obtido com verificação TLS via curl. Os quatro estilos do Refero expõem DESIGN.md, tokens, descrição e capturas; esses materiais foram lidos e as capturas examinadas. A navegação direta dessas fontes no Chromium falhou com ERR_CERT_AUTHORITY_INVALID, inclusive após configurar um repositório temporário das CAs disponibilizadas pelo ambiente. Não foram desativadas verificações TLS. Não se afirma que interações ou animações desses sites tenham sido testadas ao vivo.

## Refero Styles: fontes examinadas

| Referência | Evidência examinada | Princípio aplicado ao Mingrx | Limite da adaptação |
| --- | --- | --- | --- |
| [Intercom](https://styles.refero.design/style/12255b63-e506-4bc1-a4cd-d05487de32f3) | DESIGN.md publicado no catálogo, tokens e captura: título largo à esquerda, explicação/ações à direita e apresentação do produto abaixo. | Separação entre título, explicação e ação; captura do aplicativo como prova visual principal; acento contido. | Não reproduzir tema claro, fotografias editoriais, textos comerciais, família tipográfica ou afirmações sobre IA. |
| [Dimension](https://styles.refero.design/style/fbcf9cbb-7c6b-449d-862a-bce521a8ab1d) | DESIGN.md e captura com navegação lateral de funcionalidades e grande apresentação do produto. | Indicadores de etapa associados à narrativa do showcase; leitura de um recurso por vez com demonstração persistente. | Não copiar gradientes, glassmorphism, controles em cápsula ou promessas de desempenho. A captura contém aviso de encerramento: referência visual histórica, não recomendação do serviço. |
| [Notion](https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9) | DESIGN.md e captura com título central, ações hierarquizadas e interface real em destaque. | Uma ação primária clara, secundária mais discreta, produto reconhecível e variação de superfícies no bento. | Sem ilustradores/personagens, métricas, logos de clientes ou claims emprestados. Não copiar o tema claro. |
| [Vercel](https://styles.refero.design/style/f24daf3a-d43f-4dec-85a9-8ac1d5148a03) | DESIGN.md, escala, bordas e captura de composição esparsa com tipografia, objeto central e ações contidas. | Ritmo consistente, hierarquia tipográfica e limites finos; espaço vazio separa decisões. | Não importar a marca, o terminal como demonstração do Mingrx, o monocromatismo integral ou tracking abaixo de -0,04em. |

Os DESIGN.md do catálogo declaram que medidas são normalizadas, papéis/recomendações são interpretados e exemplos HTML são reconstruções. Servem como referências interpretadas, não como código-fonte oficial das marcas. Há recomendações que não coincidem integralmente com as capturas; por isso não foram copiadas como regras normativas.

As capturas externas ficaram apenas nos arquivos de pesquisa temporários. Não entraram no site como imagens do Mingrx.

## Referências complementares e ferramentas

- [Linear](https://linear.app/): HTML oficial acessado; não foi possível confirmar visualmente a composição ou animações ao vivo. Elegância e precisão são objetivos do briefing do usuário, não resultados de uma observação inventada.
- [Raycast](https://www.raycast.com/): HTML oficial acessado; animações/profundidade não foram verificadas no navegador. Apresentação do produto é o princípio solicitado, aplicado com as capturas autênticas do Mingrx.
- [Vercel](https://vercel.com/): HTML oficial acessado, complementado pelo DESIGN.md e captura do Refero acima.
- [shadcn/ui](https://ui.shadcn.com/): página oficial acessada. Adotada como referência de componentes e semântica, não como dependência já instalada. O projeto não usa React; migrar para introduzir shadcn ampliaria o escopo. Botões, tabs, disclosures e dialog foram implementados com HTML/CSS/JS e recursos nativos do navegador, com testes de teclado e foco.
- [Motion](https://motion.dev/): página oficial acessada. Motion também oferece JavaScript fora de React; portanto não é tratado como incompatível com a arquitetura. Foi avaliado, mas CSS, Web Animations e IntersectionObserver já cobrem as transições desta página sem dependência adicional. Uma biblioteca não foi adicionada apenas para satisfazer um nome de ferramenta.
- Tailwind: tecnicamente utilizável em site estático com etapa de geração, mas não necessário para obter os tokens/componentes desejados. Mantido CSS do projeto para preservar páginas e processo existente.
- Impeccable: skill lido e aplicado, contexto existente inspecionado, revisões independentes e verificações de navegador executadas. Launcher/detector tentados e ausentes; não há alegação de sucesso do detector.

## Direção própria consolidada

Mingrx apresenta seu grupo de amigos em cena: Satoshi auto-hospedada, grafite/charcoal, violeta sólido nas ações, azul como acento secundário e capturas reais sem ornamentação concorrente. A referência de projeto é [DESIGN.md](../../DESIGN.md), com tokens e regras executáveis no CSS; `.impeccable/design.json` acompanha o sistema.

Geist e Inter foram consideradas por constarem nas referências e no briefing. Satoshi foi preservada porque PRODUCT.md registra uma escolha explícita anterior para a identidade Mingrx; não há requisito atual de substituição obrigatória. Nenhuma fonte externa é buscada pelo navegador em produção.

A pesquisa valida e complementa a direção existente. Os ajustes concretos são navegação de progresso no showcase, galeria explícita de comunidades com captura verdadeira e iconografia coerente em todos os cards. Sem copiar outro produto, inventar funções ou refazer a arquitetura.
