# Biblioteca Aurora

Um autor pode ter vários livros. Cada livro tem um autor. Um empréstimo liga um usuário a um livro em uma determinada data. Os arquivos modelo_conceitual.svg, modelo_logico.svg e diagrama_classes.png mostram esses relacionamentos e as classes originais.

## Do formulário ao banco

1. A página pages/biblioteca.html reúne os formulários e o histórico. O script biblioteca.js lê os campos e atualiza as tabelas.
2. No GitHub Pages, dados.js usa a chave bibliotecaAuroraDados do navegador. O acervo pode começar vazio. Cadastre um autor antes do primeiro livro e um usuário antes de emprestar. Para recuperar os dados anteriores, use a mesma origem e o mesmo perfil do navegador.
3. No Flask, os mesmos formulários enviam JSON a /api/autores, /api/livros, /api/usuarios e /api/emprestimos. GET consulta, POST cadastra e DELETE remove um registro pelo ID no caminho.
4. app.py recebe o pedido. modelos.py representa as entidades. dao.py faz as consultas e reúne o registro de empréstimo e a baixa de estoque em uma transação.
5. conexao.py habilita as chaves estrangeiras. Em uma instalação nova, cria py/banco/aurora.db com py/sql/schema.sql e py/sql/dados.sql. O SQL inicial conserva os exemplos do projeto original.

## Continuidade

Para reutilizar uma instalação anterior, copie o aurora.db com o servidor parado para py/banco/ ou indique o arquivo em DB_PATH. Ao extrair por cima da estrutura antiga, o sistema também procura etapa2/banco/aurora.db e etapa1/banco/aurora.db se ainda não houver banco no novo caminho.

No navegador, o histórico guarda título e nome do leitor quando o livro ou usuário é excluído. No SQLite, as chaves estrangeiras bloqueiam essa exclusão enquanto existir o empréstimo. Nos dois modos, um autor com livros vinculados permanece cadastrado. Excluir um empréstimo repõe um exemplar se o livro ainda existir.

## Publicação

No GitHub Pages, publique o conteúdo da pasta projeto na raiz do repositório e escolha a raiz da branch como origem. O Flask é executado localmente com python py/app.py após instalar py/requirements.txt.
