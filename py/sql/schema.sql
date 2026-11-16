PRAGMA foreign_keys = ON;

-- Planos do Sócio Avanti (valores fictícios, só para demonstração).
CREATE TABLE plano (
    id_plano INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    resumo TEXT NOT NULL,
    valor_mensal REAL NOT NULL CHECK (valor_mensal >= 0),
    beneficios TEXT NOT NULL
);

-- Quem aderiu. O e-mail identifica a pessoa.
CREATE TABLE socio (
    id_socio INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT
);

-- Cada adesão liga um sócio a um plano. O cancelamento é lógico: o registro fica.
CREATE TABLE adesao (
    id_adesao INTEGER PRIMARY KEY AUTOINCREMENT,
    carteirinha TEXT UNIQUE,
    data_adesao TEXT NOT NULL,
    data_cancelamento TEXT,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada')),
    id_socio INTEGER NOT NULL,
    id_plano INTEGER NOT NULL,
    FOREIGN KEY (id_socio) REFERENCES socio (id_socio),
    FOREIGN KEY (id_plano) REFERENCES plano (id_plano)
);

-- Regra no próprio banco: cada sócio tem no máximo uma adesão ativa.
CREATE UNIQUE INDEX uma_adesao_ativa_por_socio
    ON adesao (id_socio) WHERE status = 'ativa';
