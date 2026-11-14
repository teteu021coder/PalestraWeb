# Arquivo Palestra

Site sobre a história do Palmeiras, com uma aba de **Sócio Avanti** ligada a um back-end em Flask e a um banco SQLite. Projeto Integrado de DWS, POO e Banco de Dados. Não é um site oficial do clube.

## Como rodar

```bash
pip install -r py/requirements.txt
python py/app.py
```

Abra <http://127.0.0.1:5000>. O Flask serve o site e a API no mesmo endereço, e o banco (`py/banco/avanti.db`) é criado na primeira execução. Para outra porta: `PORT=8000 python py/app.py`.

> O GitHub Pages só hospeda arquivos estáticos. O cadastro do Avanti precisa do Flask rodando.

## Testes

```bash
python py/test_api.py -v
```

## Como as camadas se encontram

| Camada | Onde |
| --- | --- |
| Front-end (HTML, CSS, JS com `fetch`) | `index.html`, `pages/`, `css/`, `js/` |
| Rotas Flask | `py/app.py` |
| Classes e validações (POO) | `py/modelos.py` |
| Acesso ao banco (DAOs) | `py/dao.py`, `py/conexao.py` |
| Banco de dados | `py/sql/schema.sql`, `py/sql/dados.sql` |
| Modelagem e rotas | `docs/modelagem.md` |

## Páginas

História, Conquistas, Ídolos e elenco, Galeria, Ingressos (mapa ilustrativo) e Sócio Avanti (cadastro, consulta e cancelamento de carteirinha).

Créditos de imagens, fontes tipográficas e referências em `docs/creditos.html`.
