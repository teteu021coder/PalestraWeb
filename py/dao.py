from datetime import date

from conexao import abrir
from modelos import Adesao, Conflito, Plano, Socio


def _plano(linha):
    return Plano(linha["plano_nome"], linha["plano_resumo"], linha["plano_valor"],
                 linha["plano_beneficios"], linha["id_plano"])


def _adesao(linha):
    socio = Socio(linha["nome"], linha["email"], linha["telefone"], linha["id_socio"])
    return Adesao(socio, _plano(linha), linha["data_adesao"], linha["carteirinha"],
                  linha["status"], linha["data_cancelamento"], linha["id_adesao"])


# Junta adesão, sócio e plano. Os nomes das colunas do plano ganham prefixo.
CONSULTA_ADESAO = """
    SELECT adesao.*, socio.nome, socio.email, socio.telefone,
           plano.nome AS plano_nome, plano.resumo AS plano_resumo,
           plano.valor_mensal AS plano_valor, plano.beneficios AS plano_beneficios
    FROM adesao
    JOIN socio ON adesao.id_socio = socio.id_socio
    JOIN plano ON adesao.id_plano = plano.id_plano
"""


class PlanoDAO:
    def listar(self):
        with abrir() as conexao:
            linhas = conexao.execute(
                "SELECT id_plano, nome AS plano_nome, resumo AS plano_resumo,"
                " valor_mensal AS plano_valor, beneficios AS plano_beneficios"
                " FROM plano ORDER BY valor_mensal"
            ).fetchall()
        return [_plano(linha) for linha in linhas]


class AdesaoDAO:
    def aderir(self, socio, id_plano):
        """Cria (ou reaproveita) o sócio e registra a adesão na mesma transação."""
        with abrir() as conexao:
            # Reserva a escrita antes de conferir as regras.
            conexao.execute("BEGIN IMMEDIATE")
            if conexao.execute("SELECT 1 FROM plano WHERE id_plano = ?",
                               (id_plano,)).fetchone() is None:
                raise LookupError("Esse plano não existe. Escolha um dos planos da lista.")

            existente = conexao.execute(
                "SELECT id_socio FROM socio WHERE email = ?", (socio.email,)
            ).fetchone()
            if existente:
                socio.id_socio = existente["id_socio"]
                ativa = conexao.execute(
                    "SELECT carteirinha FROM adesao WHERE id_socio = ? AND status = 'ativa'",
                    (socio.id_socio,)
                ).fetchone()
                if ativa:
                    raise Conflito("Este e-mail já tem uma adesão ativa. "
                                   "Consulte a carteirinha ou cancele a atual.")
                conexao.execute("UPDATE socio SET nome = ?, telefone = ? WHERE id_socio = ?",
                                (socio.nome, socio.telefone, socio.id_socio))
            else:
                cursor = conexao.execute(
                    "INSERT INTO socio (nome, email, telefone) VALUES (?, ?, ?)",
                    (socio.nome, socio.email, socio.telefone))
                socio.id_socio = cursor.lastrowid

            hoje = date.today()
            cursor = conexao.execute(
                "INSERT INTO adesao (data_adesao, id_socio, id_plano) VALUES (?, ?, ?)",
                (hoje.isoformat(), socio.id_socio, id_plano))
            carteirinha = f"AV-{hoje.year}-{cursor.lastrowid:06d}"
            conexao.execute("UPDATE adesao SET carteirinha = ? WHERE id_adesao = ?",
                            (carteirinha, cursor.lastrowid))
            linha = conexao.execute(
                CONSULTA_ADESAO + " WHERE adesao.id_adesao = ?", (cursor.lastrowid,)
            ).fetchone()
        return _adesao(linha)

    def consultar(self, carteirinha, email):
        with abrir() as conexao:
            linha = conexao.execute(
                CONSULTA_ADESAO + " WHERE adesao.carteirinha = ? AND socio.email = ?",
                (carteirinha, email)
            ).fetchone()
        return _adesao(linha) if linha else None

    def cancelar(self, carteirinha, email):
        """Cancelamento lógico: a adesão continua registrada, com status cancelada."""
        with abrir() as conexao:
            conexao.execute("BEGIN IMMEDIATE")
            linha = conexao.execute(
                CONSULTA_ADESAO + " WHERE adesao.carteirinha = ? AND socio.email = ?",
                (carteirinha, email)
            ).fetchone()
            if linha is None:
                return None
            if linha["status"] == "cancelada":
                raise Conflito("Esta adesão já foi cancelada.")
            conexao.execute(
                "UPDATE adesao SET status = 'cancelada', data_cancelamento = ?"
                " WHERE id_adesao = ?", (date.today().isoformat(), linha["id_adesao"]))
            linha = conexao.execute(
                CONSULTA_ADESAO + " WHERE adesao.id_adesao = ?", (linha["id_adesao"],)
            ).fetchone()
        return _adesao(linha)

    def resumo(self):
        with abrir() as conexao:
            linhas = conexao.execute(
                """SELECT plano.id_plano, plano.nome,
                          COUNT(adesao.id_adesao) AS total
                   FROM plano
                   LEFT JOIN adesao ON adesao.id_plano = plano.id_plano
                                   AND adesao.status = 'ativa'
                   GROUP BY plano.id_plano ORDER BY plano.valor_mensal"""
            ).fetchall()
        por_plano = [{"id_plano": l["id_plano"], "nome": l["nome"], "total": l["total"]}
                     for l in linhas]
        return {"total_ativas": sum(p["total"] for p in por_plano), "por_plano": por_plano}
