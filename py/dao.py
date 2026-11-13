from conexao import conectar
from modelos import Autor, Livro, Usuario, Emprestimo


class AuroraDAO:
    """O DAO concentra o SQL. As rotas lidam com pedidos HTTP."""

    # AUTOR
    def cadastrar_autor(self, autor):
        conexao = conectar()
        cursor = conexao.execute(
            "INSERT INTO autor (nome, nacionalidade) VALUES (?, ?)",
            (autor.nome, autor.nacionalidade)
        )
        conexao.commit()
        autor.id_autor = cursor.lastrowid
        conexao.close()
        return autor

    def listar_autores(self):
        conexao = conectar()
        linhas = conexao.execute(
            "SELECT * FROM autor ORDER BY nome"
        ).fetchall()
        conexao.close()
        return [Autor(linha["nome"], linha["nacionalidade"], linha["id_autor"])
                for linha in linhas]

    # LIVRO
    def cadastrar_livro(self, livro):
        conexao = conectar()
        cursor = conexao.execute(
            """INSERT INTO livro (titulo, ano_publicacao, quantidade, id_autor)
               VALUES (?, ?, ?, ?)""",
            (livro.titulo, livro.ano_publicacao, livro.quantidade, livro.id_autor)
        )
        conexao.commit()
        livro.id_livro = cursor.lastrowid
        conexao.close()
        return livro

    def listar_livros(self):
        conexao = conectar()
        linhas = conexao.execute(
            """SELECT livro.*, autor.nome AS nome_autor
               FROM livro JOIN autor ON livro.id_autor = autor.id_autor
               ORDER BY livro.titulo"""
        ).fetchall()
        conexao.close()
        resultado = []
        for linha in linhas:
            livro = Livro(linha["titulo"], linha["ano_publicacao"],
                          linha["quantidade"], linha["id_autor"], linha["id_livro"])
            dados = livro.para_dict()
            dados["nome_autor"] = linha["nome_autor"]
            resultado.append(dados)
        return resultado

    # USUARIO
    def cadastrar_usuario(self, usuario):
        conexao = conectar()
        cursor = conexao.execute(
            "INSERT INTO usuario (nome, email, telefone) VALUES (?, ?, ?)",
            (usuario.nome, usuario.email, usuario.telefone)
        )
        conexao.commit()
        usuario.id_usuario = cursor.lastrowid
        conexao.close()
        return usuario

    def listar_usuarios(self):
        conexao = conectar()
        linhas = conexao.execute(
            "SELECT * FROM usuario ORDER BY nome"
        ).fetchall()
        conexao.close()
        return [Usuario(linha["nome"], linha["email"], linha["telefone"],
                        linha["id_usuario"]).para_dict() for linha in linhas]

    # EMPRESTIMO
    def cadastrar_emprestimo(self, emprestimo):
        conexao = conectar()
        # Reserve a escrita antes de conferir o estoque do livro.
        conexao.execute("BEGIN IMMEDIATE")
        livro = conexao.execute(
            "SELECT quantidade FROM livro WHERE id_livro = ?",
            (emprestimo.id_livro,)
        ).fetchone()

        if livro is None:
            conexao.close()
            raise ValueError("Livro não encontrado.")

        if livro["quantidade"] <= 0:
            conexao.close()
            raise ValueError("Não há exemplares disponíveis desse livro.")

        usuario = conexao.execute(
            "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
            (emprestimo.id_usuario,)
        ).fetchone()

        if usuario is None:
            conexao.close()
            raise ValueError("Usuário não encontrado.")

        cursor = conexao.execute(
            """INSERT INTO emprestimo
               (data_emprestimo, data_devolucao, id_usuario, id_livro)
               VALUES (?, ?, ?, ?)""",
            (emprestimo.data_emprestimo, emprestimo.data_devolucao,
             emprestimo.id_usuario, emprestimo.id_livro)
        )
        conexao.execute(
            "UPDATE livro SET quantidade = quantidade - 1 WHERE id_livro = ?",
            (emprestimo.id_livro,)
        )
        conexao.commit()
        emprestimo.id_emprestimo = cursor.lastrowid
        conexao.close()
        return emprestimo

    def listar_emprestimos(self):
        conexao = conectar()
        linhas = conexao.execute(
            """SELECT emprestimo.*, usuario.nome AS nome_usuario,
                      livro.titulo AS titulo_livro
               FROM emprestimo
               JOIN usuario ON emprestimo.id_usuario = usuario.id_usuario
               JOIN livro ON emprestimo.id_livro = livro.id_livro
               ORDER BY emprestimo.id_emprestimo DESC"""
        ).fetchall()
        conexao.close()
        resultado = []
        for linha in linhas:
            emprestimo = Emprestimo(
                linha["data_emprestimo"], linha["id_usuario"],
                linha["id_livro"], linha["data_devolucao"],
                linha["id_emprestimo"]
            )
            dados = emprestimo.para_dict()
            dados["nome_usuario"] = linha["nome_usuario"]
            dados["titulo_livro"] = linha["titulo_livro"]
            resultado.append(dados)
        return resultado

    def excluir(self, tabela, registro):
        # Os nomes vêm da lista fechada na rota. Os valores usam parâmetros.
        banco = conectar()
        try:
            with banco:
                if tabela == "emprestimo":
                    banco.execute(
                        """UPDATE livro SET quantidade = quantidade + 1
                           WHERE id_livro = (SELECT id_livro FROM emprestimo
                                             WHERE id_emprestimo = ?)""", (registro,)
                    )
                cursor = banco.execute(f"DELETE FROM {tabela} WHERE id_{tabela} = ?", (registro,))
                return cursor.rowcount == 1
        finally:
            banco.close()
