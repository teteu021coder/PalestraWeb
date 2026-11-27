import sqlite3
from contextlib import contextmanager
from pathlib import Path

PASTA = Path(__file__).resolve().parent


def conectar():
    """Abre o banco e cria as tabelas na primeira execução."""
    banco = PASTA / "banco" / "avanti.db"
    banco.parent.mkdir(parents=True, exist_ok=True)

    conexao = sqlite3.connect(banco)
    conexao.row_factory = sqlite3.Row
    conexao.execute("PRAGMA foreign_keys = ON")

    tabela = conexao.execute(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'plano'"
    ).fetchone()

    if tabela is None:
        sql = (PASTA / "sql" / "schema.sql").read_text(encoding="utf-8")
        conexao.executescript(sql)

    return conexao


@contextmanager
def abrir():
    """Abre a conexão, salva as alterações e fecha o banco."""
    banco = conectar()
    try:
        yield banco
        banco.commit()
    except Exception:
        banco.rollback()
        raise
    finally:
        banco.close()
