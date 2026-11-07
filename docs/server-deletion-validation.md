# Exclusão da própria comunidade

Problema reproduzido: a rotina marcava a comunidade como `deleting` e apagava convites, mas gravava `inviteCode: ''` em seguida. `validServerFields` exige um código válido quando esse campo existe. O Firestore bloqueava essa gravação e a limpeza não chegava ao fim.

A implementação usa `deleteField()` para remover o convite e preservar o contrato do banco. O proprietário é conferido pelo `ownerId` do documento, sem confiar apenas no cargo ou em estado da interface. A rotina remove dados dependentes em páginas de 100 registros e só exclui a associação do dono, sua referência e o documento principal no último batch atômico. Cliques repetidos compartilham a operação em andamento.

As regras bloqueiam criação/alteração de registros na comunidade durante a exclusão. O dono pode limpar sessões e sinalizações de chamadas de seus próprios servidores somente após marcar a exclusão. A marca é irreversível pelo cliente; não pode ser temporariamente ativada e desativada. As permissões de chamada de comunidades ativas continuam protegidas.

## Verificação

- `test-server-deletion.js`: aprovado com Firestore Emulator 1.22.0 e as regras reais. Reproduz a recusa do convite vazio, testa dono/membro/admin/terceiro/e-mail não verificado, bloqueia o uso de um cargo `owner` atribuído a outro usuário como justificativa para excluir e verifica os dados efetivamente removidos.
- O cenário contém 109 membros com referências e presenças, 205 mensagens públicas, mensagem de canal restrito, 106 convites, sessões e sinais de chamadas, inclusive sinal sob slot já ausente. Uma interrupção após um batch confirmado deixa o dono autorizado a retomar e concluir a limpeza. Dados de outra comunidade e amizades permanecem presentes.
- `smoke:mingrx`, `smoke:cloud`, `smoke:hotfix315`, ciclo de conexão/logout e geração do bundle: aprovados localmente. O novo teste integra `smoke:rules` no CI e no release.
- A execução local conjunta de Firestore/RTDB não concluiu porque o inicializador cancelou o carregamento das regras do emulador RTDB. Não foi contada como aprovada; o teste Firestore específico foi executado diretamente contra o emulador ativo e concluiu.

3.2.2 preparada com README, versão, lockfile e notas sincronizados. Nenhum dado real do usuário foi excluído durante os testes. As regras Realtime Database e os arquivos do site não foram alterados. A publicação de novas regras Firestore e do aplicativo ainda não foi realizada nesta revisão.
