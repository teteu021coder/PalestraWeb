import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from threading import Lock

PASTA = Path(__file__).resolve().parent
preparo = Lock()


def caminho_banco():
    if os.getenv("DB_PATH"):
        return Path(os.environ["DB_PATH"])
    # Ao atualizar um projeto antigo, continue usando o banco que já existe.
    for pasta in (PASTA / "banco", PASTA.parent / "etapa2/banco", PASTA.parent / "etapa1/banco"):
        arquivo = pasta / "aurora.db"
        if arquivo.is_file():
            return arquivo
    return PASTA / "banco/aurora.db"


def conectar():
    arquivo = caminho_banco()
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    with preparo:
        novo = not arquivo.exists()
        banco = sqlite3.connect(arquivo)
        if novo:
            try:
                schema = (PASTA / "sql/schema.sql").read_text(encoding="utf-8")
                dados = (PASTA / "sql/dados.sql").read_text(encoding="utf-8")
                banco.executescript("BEGIN;\n" + schema + dados + "\nCOMMIT;")
            except sqlite3.Error:
                banco.close()
                arquivo.unlink()
                raise
    banco.execute("PRAGMA foreign_keys = ON")
    banco.row_factory = sqlite3.Row
    return banco


@contextmanager
def abrir():
    """Abre a conexão, confirma ao final e desfaz tudo se houver erro.

    Sem isso, um INSERT que falha (e-mail repetido, por exemplo) deixa a
    transação aberta e bloqueia as próximas gravações com "database is locked".
    """
    banco = conectar()
    try:
        yield banco
        banco.commit()
    except BaseException:
        banco.rollback()
        raise
    finally:
        banco.close()
