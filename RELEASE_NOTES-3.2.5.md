# Mingrx 3.2.5

## Chamadas
- Quem está falando agora é detectado por cada pessoa a partir do áudio que já recebe. O estado "falando" não passa mais pelo Firebase, onde qualquer membro da comunidade conseguia lê-lo, e a sua foto não é mais gravada em cada vaga de chamada.
- Corrigida a causa dos cards que ficavam no centro da tela depois que alguém saía: eventos atrasados da conexão recriavam o card de quem já tinha ido embora.
- Ao ligar para alguém no privado, toca um som de chamada até a pessoa atender. Depois de 45 segundos sem resposta aparece "Ninguém atendeu.". O volume segue o volume dos sons nas configurações.
- Chamadas pesam menos no computador: numa chamada com 4 pessoas, a CPU média caiu de 0,78% para 0,36% e a memória do app de 220 MB para 184 MB em relação à 3.2.4.

## Comunidades e configurações
- O menu de cargos nas configurações da comunidade não é mais cortado: ele acompanha a rolagem e abre para cima quando não há espaço embaixo.
- A barra de comunidades no topo não mostra mais uma barra de rolagem vertical perto dos botões da janela. A roda do mouse rola a barra para os lados.
- Os seletores das configurações voltam a mostrar a setinha, e a página não pula mais ao abrir um seletor.
- Os controles deslizantes mostram a parte preenchida em violeta sobre uma trilha escura, no lugar da trilha branca.

## Acessibilidade
- Janelas de diálogo se comportam como diálogos: o foco entra nelas ao abrir, Tab fica dentro delas, Esc fecha e o foco volta para onde estava.
- Campos e controles sem rótulo visível ganharam nome para leitores de tela, inclusive o volume de cada pessoa na chamada.
- Textos pequenos em cargos, status, ping, menus de configurações e avisos passaram a ter pelo menos 11 px.

## Conexão e Firebase
- Quando a internet cai, o topo mostra "sem internet" e um aviso diz que o Mingrx reconecta sozinho. Quando volta, aparece "Conexão restabelecida.".
- Presença e vagas de chamada são renovadas com menos frequência (presença a cada 85 s, chamada a cada 45 s), o que reduz em cerca de um terço essas leituras no Firebase. Quem cai continua sumindo em menos de 2 minutos.

Quem ainda estiver na 3.2.4 não vê o anel de fala de quem já atualizou para a 3.2.5 até atualizar também.

## Para quem desenvolve
- `UI_AUDIT=1 npm run ui:snapshot` grava um `audit.json` por tela com controles sem nome, imagens sem texto alternativo, textos abaixo de 11 px e erros do console.
- `npm run smoke:voice-race` verifica a detecção local de fala e que as vagas de chamada não guardam "falando" nem foto.

Esta versão não altera as regras do Firebase nem o fluxo de login. A atualização automática e a compatibilidade com convites existentes são preservadas.
