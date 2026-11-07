# Prévia do redesign Mingrx

Capturas do site implementado, com imagens autênticas do aplicativo e conteúdo de demonstração. São evidências de navegador, não composições conceituais.

## Desktop

![Primeira tela desktop](desktop.png)

[Ver página desktop completa](desktop-completo.png)

## Mobile

![Primeira tela mobile](mobile.png)

[Ver página mobile completa](mobile-completo.png)

## Ampliação da captura

![Diálogo de inspeção no celular](captura-ampliada.png)

## Prévia interativa local

Na raiz do repositório, na branch `redesign/premium-institutional`:

```sh
node site/build.mjs
node site/preview.mjs
```

Abra http://127.0.0.1:4173/ na mesma máquina. O build requer Node.js e curl para obter/verificar a fonte licenciada oficial. Não é necessário instalar as dependências do aplicativo desktop. Ctrl+C encerra o servidor.

O servidor atende apenas o build estático, sem publicar o site, alterar domínio ou iniciar backend/Firebase. As capturas em documentos não entram nos arquivos enviados ao GitHub Pages. A imagem completa de uma captura estática não representa todas as posições de uma seção sticky; as mudanças durante scroll são exercitadas pelos testes de navegador.
