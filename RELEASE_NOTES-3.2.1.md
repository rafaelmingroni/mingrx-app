# Mingrx 3.2.1

- Corrige a recuperação do compartilhamento quando a fonte rejeita as opções de vídeo (`OverconstrainedError`), tentando a mesma tela ou janela com opções mais flexíveis.
- Mantém o áudio do sistema solicitado durante a recuperação de vídeo e permite continuar sem áudio quando a captura de áudio não está disponível.
- Alinha o checkbox “Incluir áudio do sistema” ao texto, inclusive com escala de exibição ampliada, e permite marcar a opção clicando no texto.
- Evita iniciar capturas simultâneas, libera capturas que chegam depois de sair da chamada e limpa o indicador quando a preparação do compartilhamento falha.
- Exibe o aviso de áudio ausente somente quando o usuário escolheu incluir áudio.

O tratamento de erros e o layout foram verificados no renderer Electron em Linux e Windows, com falhas de captura simuladas. O comportamento específico do driver e do áudio do computador que apresentou o problema ainda requer confirmação nesse equipamento.
