from flask import Flask, jsonify, request, send_from_directory
import os
import sqlite3

from pathlib import Path
from flask import Response
from dao import AuroraDAO
from modelos import Autor, Livro, Usuario, Emprestimo

app = Flask(__name__, static_folder=None)
dao = AuroraDAO()
RAIZ = Path(__file__).resolve().parents[1]


@app.get("/")
@app.get("/index.html")
def interface():
    return send_from_directory(RAIZ, "index.html")


@app.get("/<any(css,js,pages,docs):pasta>/<path:nome>")
def arquivo(pasta, nome):
    # O Flask identifica o modo da biblioteca sem testar se a API está online.
    if pasta == "js" and nome == "modo.js":
        return Response("const usarAPI = true;", mimetype="text/javascript",
                        headers={"Cache-Control": "no-store"})
    return send_from_directory(RAIZ / pasta, nome)


@app.after_request
def configurar_cors(resposta):
    origem = request.headers.get('Origin')
    permitidas = os.environ.get('CORS_ORIGINS', '*').split(',')
    if '*' in permitidas:
        resposta.headers['Access-Control-Allow-Origin'] = '*'
    elif origem in [item.strip() for item in permitidas]:
        resposta.headers['Access-Control-Allow-Origin'] = origem
        resposta.headers['Vary'] = 'Origin'
    resposta.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    resposta.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    return resposta

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'sistema': 'Biblioteca Aurora'})


@app.route("/api/autores", methods=["GET", "POST"])
def autores():
    if request.method == "GET":
        return jsonify([autor.para_dict() for autor in dao.listar_autores()])

    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    if not nome:
        return jsonify({"erro": "O nome do autor é obrigatório."}), 400

    autor = Autor(nome, dados.get("nacionalidade"))
    try:
        dao.cadastrar_autor(autor)
        return jsonify(autor.para_dict()), 201
    except sqlite3.Error as erro:
        return jsonify({"erro": str(erro)}), 400


@app.route("/api/livros", methods=["GET", "POST"])
def livros():
    if request.method == "GET":
        return jsonify(dao.listar_livros())

    dados = request.get_json(silent=True) or {}
    titulo = dados.get("titulo")
    id_autor = dados.get("id_autor")
    if not titulo or not id_autor:
        return jsonify({"erro": "Título e id_autor são obrigatórios."}), 400

    try:
        quantidade = int(dados.get("quantidade", 1))
        ano = dados.get("ano_publicacao")
        livro = Livro(titulo, ano, quantidade, int(id_autor))
        dao.cadastrar_livro(livro)
        return jsonify(livro.para_dict()), 201
    except (ValueError, TypeError) as erro:
        return jsonify({"erro": str(erro) or "Dados inválidos."}), 400
    except sqlite3.Error as erro:
        return jsonify({"erro": str(erro)}), 400


@app.route("/api/usuarios", methods=["GET", "POST"])
def usuarios():
    if request.method == "GET":
        return jsonify(dao.listar_usuarios())

    dados = request.get_json(silent=True) or {}
    nome = dados.get("nome")
    email = dados.get("email")
    if not nome or not email:
        return jsonify({"erro": "Nome e e-mail são obrigatórios."}), 400

    usuario = Usuario(nome, email, dados.get("telefone"))
    try:
        dao.cadastrar_usuario(usuario)
        return jsonify(usuario.para_dict()), 201
    except sqlite3.Error as erro:
        return jsonify({
            "erro": "Não foi possível cadastrar. Verifique se o e-mail já existe.",
            "detalhe": str(erro)
        }), 400


@app.route("/api/emprestimos", methods=["GET", "POST"])
def emprestimos():
    if request.method == "GET":
        return jsonify(dao.listar_emprestimos())

    dados = request.get_json(silent=True) or {}
    obrigatorios = ["data_emprestimo", "id_usuario", "id_livro"]
    if any(not dados.get(campo) for campo in obrigatorios):
        return jsonify({"erro": "Data, id_usuario e id_livro são obrigatórios."}), 400

    try:
        emprestimo = Emprestimo(
            dados["data_emprestimo"],
            int(dados["id_usuario"]),
            int(dados["id_livro"]),
            dados.get("data_devolucao")
        )
        dao.cadastrar_emprestimo(emprestimo)
        return jsonify(emprestimo.para_dict()), 201
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except (sqlite3.Error, TypeError) as erro:
        return jsonify({"erro": str(erro)}), 400


@app.delete("/api/<any(autores,livros,usuarios,emprestimos):grupo>/<int:registro>")
def excluir(grupo, registro):
    tabelas = {"autores": "autor", "livros": "livro", "usuarios": "usuario",
               "emprestimos": "emprestimo"}
    try:
        if not dao.excluir(tabelas[grupo], registro):
            return jsonify({"erro": "Registro não encontrado."}), 404
        return jsonify({"excluido": True})
    except sqlite3.IntegrityError:
        return jsonify({"erro": "Há registros vinculados. Confira os livros e os empréstimos."}), 409


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=int(os.environ.get('PORT', 5000)), debug=False)
