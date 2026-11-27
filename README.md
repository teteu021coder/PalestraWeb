# Arquivo Palestra

Site escolar sobre a história do Palmeiras, com uma área de cadastro demonstrativo do Sócio Avanti.

O projeto foi feito para praticar **HTML, CSS, JavaScript, Python, Flask, POO e Banco de Dados**. Não é um site oficial do Palmeiras. Os planos, valores e ingressos são apenas exemplos.

## Como executar

1. Instale o Python.
2. Abra a pasta do projeto no terminal.
3. Instale o Flask:

```bash
pip install -r py/requirements.txt
```

4. Inicie o sistema:

```bash
python py/app.py
```

5. Abra no navegador: http://127.0.0.1:5000

O banco SQLite é criado automaticamente na primeira execução. As tabelas e os planos iniciais estão no arquivo py/sql/schema.sql.

## Organização do projeto

| Parte | Arquivos |
| --- | --- |
| Site (HTML) | index.html e pasta pages/ |
| Estilos (CSS) | pasta css/ |
| Interações (JavaScript) | pasta js/ |
| Servidor e rotas (Flask) | py/app.py |
| Classes (POO) | py/modelos.py |
| Acesso ao banco | py/dao.py e py/conexao.py |
| Banco de dados (SQL) | py/sql/schema.sql |
| Modelagem | pasta docs/ |

## O que o sistema faz

- Mostra os planos disponíveis.
- Permite cadastrar um sócio.
- Salva os dados no banco SQLite.
- Gera uma carteirinha de demonstração.
- Permite consultar e cancelar uma adesão usando o número da carteirinha e o e-mail.

A página de ingressos também é uma demonstração visual: não consulta disponibilidade real e não realiza compras.

## Observação

O GitHub Pages hospeda apenas páginas estáticas. Para usar o cadastro, que depende do Python e do banco de dados, é necessário executar o Flask.
