# Mingrx 3.2.2

- Corrige a exclusão da própria comunidade: o convite é removido sem gravar um código vazio que as regras do Firebase rejeitam.
- Exclui mensagens, canais, convites, presenças, sessões e sinalizações de chamadas antes de remover os membros e o documento da comunidade.
- Mantém o vínculo do dono até a conclusão, permitindo repetir a operação se a conexão for interrompida.
- Impede novas mensagens, convites, entradas e outros registros na comunidade durante a exclusão.
- Mantém a exclusão restrita ao usuário registrado como dono. Administradores e outros membros não recebem essa permissão.

Esta versão requer publicar as regras Firestore correspondentes antes de liberar o aplicativo. A verificação de produção continua integrada ao fluxo de release; a atualização automática e a confirmação do nome da comunidade são preservadas.
