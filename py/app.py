import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from dao import AdesaoDAO, PlanoDAO
from modelos import Conflito, Socio

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024
planos = PlanoDAO()
adesoes = AdesaoDAO()
RAIZ = Path(__file__).resolve().parents[1]


# ---------- Páginas e arquivos do site ----------
@app.get("/")
@app.get("/index.html")
def interface():
    return send_from_directory(RAIZ, "index.html")


@app.get("/<any(css,js,pages,docs,fonts):pasta>/<path:nome>")
def arquivo(pasta, nome):
    return send_from_directory(RAIZ / pasta, nome)


@app.after_request
def cabecalhos(resposta):
    resposta.headers["X-Content-Type-Options"] = "nosniff"
    resposta.headers["Referrer-Policy"] = "same-origin"
    # O site e a API saem do mesmo endereço. CORS só se for pedido por variável.
    origens = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    origem = request.headers.get("Origin")
    if origem and (origem in origens or "*" in origens):
        resposta.headers["Access-Control-Allow-Origin"] = origem
        resposta.headers["Vary"] = "Origin"
        resposta.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resposta.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    return resposta


# ---------- API ----------
def erro(mensagem, codigo):
    return jsonify({"erro": mensagem}), codigo


def corpo():
    dados = request.get_json(silent=True)
    return dados if isinstance(dados, dict) else {}


@app.errorhandler(404)
def nao_encontrado(_):
    if request.path.startswith("/api/"):
        return erro("Rota não encontrada.", 404)
    return "Página não encontrada.", 404


@app.errorhandler(405)
def metodo_invalido(_):
    return erro("Método não permitido nesta rota.", 405)


@app.errorhandler(413)
def corpo_grande(_):
    return erro("O pedido é maior que o permitido.", 413)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "sistema": "Sócio Avanti"})


@app.get("/api/planos")
def listar_planos():
    return jsonify([plano.para_dict() for plano in planos.listar()])


@app.get("/api/resumo")
def resumo():
    return jsonify(adesoes.resumo())


@app.post("/api/adesoes")
def aderir():
    dados = corpo()
    try:
        socio = Socio(dados.get("nome"), dados.get("email"), dados.get("telefone"))
        id_plano = int(dados.get("id_plano"))
        adesao = adesoes.aderir(socio, id_plano)
    except (ValueError, TypeError) as problema:
        texto = str(problema)
        if "int()" in texto or "NoneType" in texto:
            texto = "Escolha um plano para continuar."
        return erro(texto, 400)
    except LookupError as problema:
        return erro(str(problema), 404)
    except Conflito as problema:
        return erro(str(problema), 409)
    return jsonify(adesao.para_dict()), 201


@app.post("/api/adesoes/consulta")
def consultar():
    dados = corpo()
    carteirinha = str(dados.get("carteirinha") or "").strip().upper()
    email = str(dados.get("email") or "").strip().lower()
    if not carteirinha or not email:
        return erro("Informe o número da carteirinha e o e-mail.", 400)
    adesao = adesoes.consultar(carteirinha, email)
    if adesao is None:
        return erro("Não encontramos uma adesão com esses dados. Confira o número e o e-mail.", 404)
    return jsonify(adesao.para_dict())


@app.delete("/api/adesoes/<carteirinha>")
def cancelar(carteirinha):
    email = str(corpo().get("email") or "").strip().lower()
    if not email:
        return erro("Informe o e-mail da adesão para cancelar.", 400)
    try:
        adesao = adesoes.cancelar(carteirinha.strip().upper(), email)
    except Conflito as problema:
        return erro(str(problema), 409)
    if adesao is None:
        return erro("Não encontramos uma adesão com esses dados.", 404)
    return jsonify(adesao.para_dict())


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.environ.get("PORT", 5000)), debug=False)
