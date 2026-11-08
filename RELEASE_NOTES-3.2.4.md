# Mingrx 3.2.4

## Chamadas
- Quem sai da chamada não fica mais preso no centro da tela. A grade é conferida com quem realmente está na chamada, e cards de quem já saiu somem em poucos segundos, mesmo que o aviso de saída se perca.
- O anel verde de quem está falando aparece só na chamada em que você está. A lista de canais não mostra mais quem fala em outras chamadas da comunidade.
- A contagem mostra "4 de 5 na chamada". O selo "conectado" sai do topo e só aparece um aviso quando a conexão cai.
- Ao compartilhar a tela, a sua prévia mostra um ícone desenhado e uma frase curta no lugar da explicação técnica.

## Comunidades
- Donos e administradores voltam a conseguir trocar a foto da comunidade: o cartão "Foto da comunidade" não aparecia nas configurações.
- Configurações da comunidade mais limpas: cada cargo tem uma bolinha de cor clicável no lugar da faixa colorida e do código hexadecimal, cargos e membros ficam em listas únicas, e os textos ficaram curtos.
- Convite mais simples, com o link exibido de forma discreta e textos curtos.

## Novo visual
- Novo logo: o M da arte do Mingrx, com brilho 3D, no app, no ícone do Windows, na bandeja e no instalador. O "x" do nome continua em itálico violeta.
- Login e cadastro com a arte do astronauta do mingrx.site ao lado do formulário.
- Atualizador nas cores do tema, em português e com textos curtos.
- O botão de atualização no topo só aparece quando existe uma versão mais nova baixando ou pronta para instalar. Antes ele podia aparecer durante a verificação, depois de uma falha ao verificar ou sem uma versão mais nova.
- Emojis com Fluent Emoji 3D (Microsoft, licença MIT) nas mensagens, reações e respostas. Mensagens só com emoji aparecem maiores. Copiar uma mensagem continua copiando o emoji como texto.
- Títulos de seção sem caixa alta, lista de membros sem faixas coloridas e coroa desenhada para o dono.
- Perfil de membro em uma superfície só, com "Sobre", "Cargo" e "Na comunidade".
- Configurações com rótulos legíveis, seletor de arquivo no visual do app e botões sem símbolos.
- Aparência com cartões de tema neutros, só o tema escolhido destacado, e descrições curtas.
- O rodapé das configurações mostra a versão instalada; antes mostrava "3.1.0" em todas as versões.
- O instalador cresce cerca de 3 MB por causa das imagens dos emojis, que só carregam quando aparecem na tela.

## Para quem desenvolve
- `npm run ui:snapshot` captura todas as abas de configurações, amigos e a criação de comunidade.
- `npm run smoke:voice-race` também faz alguém sair da chamada enquanto outra pessoa não recebe o aviso de saída, e verifica que o card some.
- O teste de membros e convites espera a janela terminar de redimensionar antes de medir; antes ele falhava às vezes em telas de 1280 px.

Esta versão não altera as regras do Firebase nem o fluxo de login. A atualização automática e a compatibilidade com convites existentes são preservadas.
