-- MODELO FÍSICO — BIBLIOTECA AURORA


PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS autor (
    id_autor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    nacionalidade TEXT
);

CREATE TABLE IF NOT EXISTS livro (
    id_livro INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    ano_publicacao INTEGER,
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade >= 0),
    id_autor INTEGER NOT NULL,
    FOREIGN KEY (id_autor) REFERENCES autor (id_autor)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT
);

CREATE TABLE IF NOT EXISTS emprestimo (
    id_emprestimo INTEGER PRIMARY KEY AUTOINCREMENT,
    data_emprestimo TEXT NOT NULL,
    data_devolucao TEXT,
    id_usuario INTEGER NOT NULL,
    id_livro INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario (id_usuario),
    FOREIGN KEY (id_livro) REFERENCES livro (id_livro)
);
