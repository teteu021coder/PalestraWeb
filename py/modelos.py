class Autor:
    def __init__(self, nome, nacionalidade=None, id_autor=None):
        self.id_autor = id_autor
        self.nome = nome
        self.nacionalidade = nacionalidade

    def para_dict(self):
        return {
            "id_autor": self.id_autor,
            "nome": self.nome,
            "nacionalidade": self.nacionalidade
        }


class Livro:
    def __init__(self, titulo, ano_publicacao, quantidade, id_autor, id_livro=None):
        self.id_livro = id_livro
        self.titulo = titulo
        self.ano_publicacao = ano_publicacao
        self.quantidade = quantidade
        self.id_autor = id_autor

    def para_dict(self):
        return {
            "id_livro": self.id_livro,
            "titulo": self.titulo,
            "ano_publicacao": self.ano_publicacao,
            "quantidade": self.quantidade,
            "id_autor": self.id_autor
        }


class Usuario:
    def __init__(self, nome, email, telefone=None, id_usuario=None):
        self.id_usuario = id_usuario
        self.nome = nome
        self.email = email
        self.telefone = telefone

    def para_dict(self):
        return {
            "id_usuario": self.id_usuario,
            "nome": self.nome,
            "email": self.email,
            "telefone": self.telefone
        }


class Emprestimo:
    def __init__(self, data_emprestimo, id_usuario, id_livro,
                 data_devolucao=None, id_emprestimo=None):
        self.id_emprestimo = id_emprestimo
        self.data_emprestimo = data_emprestimo
        self.data_devolucao = data_devolucao
        self.id_usuario = id_usuario
        self.id_livro = id_livro

    def para_dict(self):
        return {
            "id_emprestimo": self.id_emprestimo,
            "data_emprestimo": self.data_emprestimo,
            "data_devolucao": self.data_devolucao,
            "id_usuario": self.id_usuario,
            "id_livro": self.id_livro
        }
