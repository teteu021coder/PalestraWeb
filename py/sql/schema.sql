PRAGMA foreign_keys = ON;

-- Tabela dos planos do Sócio Avanti (valores fictícios para a demonstração).
CREATE TABLE plano (
    id_plano INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    resumo TEXT NOT NULL,
    valor_mensal REAL NOT NULL CHECK (valor_mensal >= 0),
    beneficios TEXT NOT NULL
);

-- Dados das pessoas cadastradas.
CREATE TABLE socio (
    id_socio INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT
);

-- Cada adesão liga um sócio a um plano.
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

-- Planos usados no cadastro de demonstração.
INSERT INTO plano (nome, resumo, valor_mensal, beneficios) VALUES
('Palestra',
 'Para começar a fazer parte.',
 19.90,
 'Carteirinha digital;Newsletter do arquivo;Acesso às edições especiais da galeria'),
('Parque',
 'Para quem acompanha o ano inteiro.',
 49.90,
 'Tudo do plano Palestra;Desconto de 10% em ingressos na simulação;Escolha de setor antes da abertura geral'),
('Arena',
 'Para quem não quer perder um jogo.',
 99.90,
 'Tudo do plano Parque;Assento cativo na simulação;Convite para a visita ao acervo do clube');
