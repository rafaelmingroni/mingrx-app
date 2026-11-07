# Correção de captura de tela

Relato: `OverconstrainedError` ao iniciar compartilhamento e checkbox de áudio desalinhado.

O tratamento anterior repetia as mesmas restrições de vídeo, mesmo quando o erro indicava opções incompatíveis. A correção usa FPS preferencial validado; se a fonte recusar as opções, tenta o mesmo conteúdo com `video: true`. O áudio solicitado é mantido nessa tentativa e só é removido em falhas compatíveis com indisponibilidade de áudio. Não há nova tentativa após negação de permissão ou cancelamento. A seleção é liberada ao concluir ou falhar.

Também foram protegidos clique repetido, saída da chamada enquanto a captura inicia e falhas na preparação dos emissores. Uma captura que chega após a saída tem suas faixas encerradas; falha de preparação limpa o indicador e tenta restaurar a câmera. O aviso de áudio ausente só aparece quando o usuário solicitou áudio.

O label de áudio usa flex, centralização vertical, área clicável e checkbox nativo de 18 px, sem herdar largura, margens e padding dos campos de texto.

## Verificação local

- `node desktop/scripts/smoke-screen-share.js` aprovado.
- `desktop/scripts/e2e-screen-share.js`, no Electron 45 com isolamento de produção: aprovado. Resultados sintéticos de captura cobrem combinações de falhas de vídeo/áudio, limites de tentativas, permissões, cancelamento, FPS inválido, clique repetido, saída de chamada e restauração da câmera. O CSS real foi medido em 100%, 125%, 150% e 200%; o clique no label alterna o checkbox. Captura visual do modal revisada.
- `npm run smoke:mingrx`, `npm run smoke:cloud`, `npm run release:check` e `git diff --check`: aprovados.
- O teste antigo `e2e-mingrx-media-invite.js` relata quatro asserções sobre a foto da comunidade nas configurações. O mesmo resultado foi reproduzido em uma cópia das fontes do HEAD anterior, sem esta correção. Seu processo retorna zero apesar da mensagem de falha; não foi contabilizado como aprovado.

O novo teste também integra a sequência de interações do release e tem um workflow Windows independente, sem publicação nem acesso ao Firebase de produção. Estes testes não substituem a validação do driver e do áudio loopback no computador Windows afetado.

O workflow Windows específico foi aprovado: https://github.com/rafaelmingroni/mingrx-app/actions/runs/42407502686. Confirma a recuperação simulada e o alinhamento em 100%, 125%, 150% e 200% no Windows.

Nenhum arquivo do site, regra Firebase ou código do backend foi alterado por esta correção. Após a aprovação explícita de Rafael, o PR #43 foi integrado e o fluxo completo de release reaplicou as regras de produção e verificou a proteção contra enumeração de e-mails e a correspondência das regras Firestore com as fontes testadas.

## Publicação

A [3.2.1 está publicada](https://github.com/rafaelmingroni/mingrx-app/releases/tag/v3.2.1), com versão, README, lockfile e notas sincronizados. O [workflow de release](https://github.com/rafaelmingroni/mingrx-app/actions/runs/42408519378) usou o commit `7a6cf671c465509fa8f3a3ba46f2c34d1579f103`. O teste específico de compartilhamento passou novamente no fluxo completo.

Depois da publicação, foram baixados sem autenticação o instalador Windows, seu blockmap e `latest.yml`. Os três SHA-256 conferem com os hashes dos assets publicados. A versão, nome, tamanho e SHA-512 do instalador também correspondem ao manifesto da atualização automática. A release está pública, sem marca de prévia, e é retornada pelo endpoint de versão mais recente.
