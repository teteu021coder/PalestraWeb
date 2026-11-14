# Arquivo Palestra · Projeto Integrado (DWS + POO + BD)

Site editorial sobre a história do Palmeiras, com um sistema de **Biblioteca Aurora**
(livros, autores, usuários e empréstimos) integrado de ponta a ponta:
**HTML/CSS/JS (Fetch) → rotas Flask → DAOs → SQLite**.

## Como rodar (modo completo, com Flask e banco)

```bash
pip install -r py/requirements.txt
python py/app.py
```

Abra <http://127.0.0.1:5000>. A página **Biblioteca** passa a usar a API
(`/api/autores`, `/api/livros`, `/api/usuarios`, `/api/emprestimos`) e mostra
"Conectado ao SQLite". O banco `py/banco/aurora.db` é criado na primeira execução
a partir de `py/sql/schema.sql` e `py/sql/dados.sql`.

Variáveis opcionais: `PORT` (porta), `DB_PATH` (arquivo do banco), `CORS_ORIGINS`.

## Modo estático (GitHub Pages)

Sem o Flask, `js/modo.js` define `usarAPI = false` e a biblioteca grava no
`localStorage` do navegador. O restante do site funciona igual.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `index.html`, `pages/` | Capa, história, conquistas, ídolos, galeria, ingressos, Avanti e biblioteca |
| `css/` | `revista.css` (identidade visual) e `biblioteca.css` (sistema da biblioteca) |
| `js/` | Navegação, galeria, mapa de ingressos e a camada da biblioteca (`dados.js` faz o Fetch) |
| `py/` | `app.py` (rotas Flask), `dao.py`, `modelos.py`, `conexao.py` e `sql/` |
| `docs/` | Modelagem (conceitual, lógica, física), diagrama de classes, imagens e créditos |

## Rotas da API

| Método | Rota | Ação |
| --- | --- | --- |
| GET / POST | `/api/autores`, `/api/livros`, `/api/usuarios`, `/api/emprestimos` | Listar / cadastrar |
| DELETE | `/api/<grupo>/<id>` | Excluir (409 se houver registros vinculados) |
| GET | `/api/health` | Verificar o servidor |

O empréstimo registra a saída e baixa um exemplar na mesma transação; excluir o
empréstimo repõe o exemplar.

## Créditos

Procedência das imagens e fontes de consulta em `docs/creditos.html`.
Projeto escolar independente, sem vínculo oficial com o clube.
