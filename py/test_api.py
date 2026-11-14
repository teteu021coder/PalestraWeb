"""Testes da API do Sócio Avanti. Rode com: python py/test_api.py -v"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))


class TesteApi(unittest.TestCase):
    def setUp(self):
        self.pasta = tempfile.TemporaryDirectory()
        os.environ["DB_PATH"] = str(Path(self.pasta.name) / "teste.db")
        from app import app
        self.cliente = app.test_client()

    def tearDown(self):
        self.pasta.cleanup()

    def aderir(self, **extra):
        dados = {"nome": "Ana Souza", "email": "ana@exemplo.com",
                 "telefone": "(19) 99999-1111", "id_plano": 1}
        dados.update(extra)
        return self.cliente.post("/api/adesoes", json=dados)

    def test_planos_iniciais(self):
        planos = self.cliente.get("/api/planos").get_json()
        self.assertEqual([p["nome"] for p in planos], ["Palestra", "Parque", "Arena"])
        self.assertTrue(all(p["beneficios"] for p in planos))

    def test_adesao_gera_carteirinha(self):
        resposta = self.aderir()
        self.assertEqual(resposta.status_code, 201)
        corpo = resposta.get_json()
        self.assertRegex(corpo["carteirinha"], r"^AV-\d{4}-\d{6}$")
        self.assertEqual(corpo["status"], "ativa")
        self.assertNotIn("email", corpo)

    def test_validacoes(self):
        self.assertEqual(self.aderir(nome="A").status_code, 400)
        self.assertEqual(self.aderir(email="sem-arroba").status_code, 400)
        self.assertEqual(self.aderir(telefone="123").status_code, 400)
        self.assertEqual(self.aderir(id_plano=None).status_code, 400)
        self.assertEqual(self.aderir(id_plano=99).status_code, 404)

    def test_email_com_adesao_ativa_e_recusado_sem_travar_o_banco(self):
        self.assertEqual(self.aderir().status_code, 201)
        self.assertEqual(self.aderir().status_code, 409)
        # O erro anterior não pode deixar o banco bloqueado.
        self.assertEqual(self.aderir(email="outra@exemplo.com").status_code, 201)

    def test_consulta_exige_numero_e_email(self):
        carteirinha = self.aderir().get_json()["carteirinha"]
        ok = self.cliente.post("/api/adesoes/consulta",
                               json={"carteirinha": carteirinha.lower(), "email": "ANA@exemplo.com"})
        self.assertEqual(ok.status_code, 200)
        errada = self.cliente.post("/api/adesoes/consulta",
                                   json={"carteirinha": carteirinha, "email": "outra@exemplo.com"})
        self.assertEqual(errada.status_code, 404)
        self.assertEqual(self.cliente.post("/api/adesoes/consulta", json={}).status_code, 400)

    def test_cancelamento_e_nova_adesao(self):
        carteirinha = self.aderir().get_json()["carteirinha"]
        url = f"/api/adesoes/{carteirinha}"
        self.assertEqual(self.cliente.delete(url, json={"email": "x@y.com"}).status_code, 404)
        cancelada = self.cliente.delete(url, json={"email": "ana@exemplo.com"})
        self.assertEqual(cancelada.status_code, 200)
        self.assertEqual(cancelada.get_json()["status"], "cancelada")
        self.assertEqual(self.cliente.delete(url, json={"email": "ana@exemplo.com"}).status_code, 409)
        # Depois de cancelar, o mesmo e-mail pode aderir de novo.
        nova = self.aderir(id_plano=3)
        self.assertEqual(nova.status_code, 201)
        self.assertNotEqual(nova.get_json()["carteirinha"], carteirinha)

    def test_resumo_conta_so_adesoes_ativas(self):
        self.aderir()
        self.aderir(email="b@exemplo.com", id_plano=2)
        c = self.aderir(email="c@exemplo.com", id_plano=2).get_json()["carteirinha"]
        self.cliente.delete(f"/api/adesoes/{c}", json={"email": "c@exemplo.com"})
        resumo = self.cliente.get("/api/resumo").get_json()
        self.assertEqual(resumo["total_ativas"], 2)
        self.assertEqual({p["nome"]: p["total"] for p in resumo["por_plano"]},
                         {"Palestra": 1, "Parque": 1, "Arena": 0})

    def test_telefone_e_opcional_e_so_guarda_digitos(self):
        self.assertEqual(self.aderir(telefone="").status_code, 201)
        corpo = self.aderir(email="t@exemplo.com", telefone="(19) 99999-1111").get_json()
        self.assertEqual(corpo["status"], "ativa")

    def test_rotas_invalidas_respondem_json(self):
        self.assertEqual(self.cliente.get("/api/nada").get_json()["erro"], "Rota não encontrada.")
        self.assertEqual(self.cliente.delete("/api/planos").status_code, 405)


if __name__ == "__main__":
    unittest.main()
