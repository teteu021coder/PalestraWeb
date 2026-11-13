INSERT INTO autor (nome, nacionalidade) VALUES
('Machado de Assis', 'Brasileira'),
('Clarice Lispector', 'Brasileira'),
('George Orwell', 'Britânica'),
('Jorge Amado', 'Brasileira');

INSERT INTO livro (titulo, ano_publicacao, quantidade, id_autor) VALUES
('Dom Casmurro', 1899, 3, 1),
('Memórias Póstumas de Brás Cubas', 1881, 2, 1),
('A Hora da Estrela', 1977, 2, 2),
('1984', 1949, 4, 3),
('A Revolução dos Bichos', 1945, 3, 3),
('Capitães da Areia', 1937, 2, 4);

INSERT INTO usuario (nome, email, telefone) VALUES
('Ana Souza', 'ana.souza@email.com', '19 99999-1111'),
('Bruno Lima', 'bruno.lima@email.com', '19 99999-2222'),
('Carla Mendes', 'carla.mendes@email.com', '19 99999-3333');

INSERT INTO emprestimo (data_emprestimo, data_devolucao, id_usuario, id_livro) VALUES
('2026-10-01', '2026-10-08', 1, 1),
('2026-10-05', NULL, 2, 4),
('2026-10-10', '2026-10-17', 3, 3),
('2026-10-20', NULL, 1, 6);
