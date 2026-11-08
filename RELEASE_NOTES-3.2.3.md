# Mingrx 3.2.3

## Chamadas mais confiáveis
- Corrige chamadas que ficavam presas em "conectando" com a primeira pessoa da sala quando outras entravam em seguida: a resposta de conexão não é mais descartada enquanto a lista da sala se atualiza.
- Ofertas de conexão sem resposta são reenviadas automaticamente (até três vezes), para que uma sinalização perdida não deixe ninguém fora da call.
- O indicador de "falando" continua funcionando com o Mingrx minimizado ou atrás do jogo.
- Em uma instalação nova, o compartilhamento de tela, o volume de saída e os sons de notificação usam os valores padrão em vez de começar zerados.

## Mais leve
- A detecção de voz roda 20 vezes por segundo em vez de acompanhar a taxa do monitor (antes chegava a 280 vezes por segundo em monitores de alta frequência).
- Fora de uma chamada, o Windows volta a economizar recursos do aplicativo em segundo plano normalmente.
- Remove o antigo modo de servidor local, o download do túnel cloudflared e as dependências que só ele usava, reduzindo o instalador e o que é carregado ao abrir o app.

## Novo visual
- Paleta navy e violeta, tipografia Satoshi e superfícies alinhadas ao site mingrx.site no tema padrão. Os demais temas mantêm suas cores.
- Ícones desenhados no lugar de emojis em controles de voz, canais, chamadas, mensagens privadas e configurações. Mensagens e reações continuam com emoji.
- Painel da chamada com botão de desligar em destaque, "Sair da voz" sem a cor de ação principal, anel verde em quem está falando e controles de cada participante visíveis ao passar o mouse.
- "Ativar áudio" aparece como um botão pequeno no canto do participante, sem cobrir a tela compartilhada.
- O botão "Enviar" se ajusta ao texto; informações técnicas de conexão aparecem apenas ao passar o mouse.
- Textos restantes da marca antiga e do convite foram revisados.

## Para quem desenvolve
- `npm run perf:probe` mede CPU, memória, atividade do DOM e a detecção de voz em segundo plano contra os emuladores do Firebase.
- `npm run ui:snapshot` captura as telas de chat, chamada, convite, configurações e mensagens privadas do aplicativo real.
- `npm run smoke:voice-race` coloca quatro contas entrando em sequência rápida e verifica que todas se conectam, inclusive com respostas perdidas de propósito.
- A fonte Satoshi é baixada e verificada no build (`scripts/prepare-fonts.js`), como no site.

Esta versão não altera as regras do Firebase nem o fluxo de login. A atualização automática e a compatibilidade com convites existentes são preservadas.
