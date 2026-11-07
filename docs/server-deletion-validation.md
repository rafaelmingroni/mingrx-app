# Exclusão da própria comunidade

Problema reproduzido: a rotina marcava a comunidade como `deleting` e apagava convites, mas gravava `inviteCode: ''` em seguida. `validServerFields` exige um código válido quando esse campo existe. O Firestore bloqueava essa gravação e a limpeza não chegava ao fim.

A implementação usa `deleteField()` para remover o convite e preservar o contrato do banco. O proprietário é conferido pelo `ownerId` do documento, sem confiar apenas no cargo ou em estado da interface. A rotina remove dados dependentes em páginas de 100 registros e só exclui a associação do dono, sua referência e o documento principal no último batch atômico. Cliques repetidos compartilham a operação em andamento.

As regras bloqueiam criação/alteração de registros na comunidade durante a exclusão. O dono pode limpar sessões e sinalizações de chamadas de seus próprios servidores somente após marcar a exclusão. A marca é irreversível pelo cliente; não pode ser temporariamente ativada e desativada. As permissões de chamada de comunidades ativas continuam protegidas.

## Verificação

- `test-server-deletion.js`: aprovado com Firestore Emulator 1.22.0 e as regras reais. Reproduz a recusa do convite vazio, testa dono/membro/admin/terceiro/e-mail não verificado, bloqueia o uso de um cargo `owner` atribuído a outro usuário como justificativa para excluir e verifica os dados efetivamente removidos.
- O cenário contém 109 membros com referências e presenças, 205 mensagens públicas, mensagem de canal restrito, 106 convites, sessões e sinais de chamadas, inclusive sinal sob slot já ausente. Uma interrupção após um batch confirmado deixa o dono autorizado a retomar e concluir a limpeza. Dados de outra comunidade e amizades permanecem presentes.
- `smoke:mingrx`, `smoke:cloud`, `smoke:hotfix315`, ciclo de conexão/logout e geração do bundle: aprovados localmente. O novo teste integra `smoke:rules` no CI e no release.
- A execução local conjunta de Firestore/RTDB não concluiu porque o inicializador cancelou o carregamento das regras do emulador RTDB. Não foi contada como aprovada; o teste Firestore específico foi executado diretamente contra o emulador ativo e concluiu.
- No Windows, a suíte completa de regras Firestore/RTDB, incluindo o novo teste de exclusão, passou no [CI do PR #44](https://github.com/rafaelmingroni/mingrx-app/actions/runs/42410196395) e novamente no fluxo de release. O E2E local de login, migração/restauração de sessão, recuperação de senha e saída/reconexão também concluiu com o bundle atualizado.

## Publicação autorizada

A [3.2.2 foi publicada](https://github.com/rafaelmingroni/mingrx-app/releases/tag/v3.2.2) após aprovação explícita de Rafael, com README, versão, lockfile e notas sincronizados. O [fluxo de release](https://github.com/rafaelmingroni/mingrx-app/actions/runs/42410657100) concluiu com sucesso no commit `6903f7d2ee5458593a4eb868642c93bb079eba85`. As regras foram aplicadas antes da liberação do aplicativo, e o hash Firestore conferido em produção foi `f298e02e55a9c4b21bfc8dccb3ee0d928cd0aaf7d11c08fc1d65d9530e1b4039`, igual à fonte testada.

Após a publicação, o instalador, o blockmap e `latest.yml` foram baixados sem autenticação e tiveram os SHA-256 conferidos com os assets do GitHub. Nome, versão, tamanho e SHA-512 do instalador correspondem ao manifesto da atualização automática. A release é pública, sem marca de prévia, e retornada pelo endpoint de versão mais recente.

Nenhum dado real do usuário foi excluído durante os testes. Os arquivos do site e a fonte das regras Realtime Database não foram alterados. O fluxo de publicação reaplicou a configuração RTDB existente junto às novas regras Firestore.
