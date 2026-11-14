import re

EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]{2,}$")


class Conflito(Exception):
    """A regra de negócio impede a operação (ex.: e-mail com adesão ativa)."""


class Plano:
    def __init__(self, nome, resumo, valor_mensal, beneficios, id_plano=None):
        self.id_plano = id_plano
        self.nome = nome
        self.resumo = resumo
        self.valor_mensal = valor_mensal
        # No banco os benefícios ficam em um texto separado por ponto e vírgula.
        self.beneficios = [item for item in beneficios.split(";") if item]

    def para_dict(self):
        return {
            "id_plano": self.id_plano,
            "nome": self.nome,
            "resumo": self.resumo,
            "valor_mensal": self.valor_mensal,
            "beneficios": self.beneficios,
        }


class Socio:
    def __init__(self, nome, email, telefone=None, id_socio=None):
        self.id_socio = id_socio
        self.nome = nome
        self.email = email
        self.telefone = telefone

    @property
    def nome(self):
        return self._nome

    @nome.setter
    def nome(self, valor):
        valor = " ".join(str(valor or "").split())
        if not 3 <= len(valor) <= 80:
            raise ValueError("Informe o nome completo, com 3 a 80 caracteres.")
        self._nome = valor

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, valor):
        valor = str(valor or "").strip().lower()
        if len(valor) > 120 or not EMAIL.match(valor):
            raise ValueError("Informe um e-mail válido, como nome@exemplo.com.")
        self._email = valor

    @property
    def telefone(self):
        return self._telefone

    @telefone.setter
    def telefone(self, valor):
        digitos = re.sub(r"\D", "", str(valor or ""))
        if digitos and len(digitos) not in (10, 11):
            raise ValueError("O telefone precisa ter DDD e 8 ou 9 dígitos.")
        self._telefone = digitos or None

    def para_dict(self):
        return {"id_socio": self.id_socio, "nome": self.nome, "telefone": self.telefone}


class Adesao:
    def __init__(self, socio, plano, data_adesao, carteirinha=None, status="ativa",
                 data_cancelamento=None, id_adesao=None):
        self.id_adesao = id_adesao
        self.socio = socio
        self.plano = plano
        self.data_adesao = data_adesao
        self.carteirinha = carteirinha
        self.status = status
        self.data_cancelamento = data_cancelamento

    def para_dict(self):
        # O e-mail não volta na resposta: quem consulta já o conhece.
        return {
            "carteirinha": self.carteirinha,
            "nome": self.socio.nome,
            "status": self.status,
            "data_adesao": self.data_adesao,
            "data_cancelamento": self.data_cancelamento,
            "plano": self.plano.para_dict(),
        }
