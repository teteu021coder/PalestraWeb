const porId = (id) => document.getElementById(id);
const secoes = {
  inicio: "Visão geral",
  livros: "Livros",
  autores: "Autores",
  usuarios: "Usuários",
  emprestimos: "Empréstimos",
};
const formularios = {
  autores: "autor",
  livros: "livro",
  usuarios: "usuario",
  emprestimos: "emprestimo",
};
let acervo;
let tempoMensagem;

function mensagem(texto, erro = false) {
  const aviso = porId("message");
  clearTimeout(tempoMensagem);
  aviso.textContent = texto;
  aviso.className = erro ? "show error" : "show";
  tempoMensagem = setTimeout(() => (aviso.className = ""), erro ? 9000 : 4500);
}

function mostrarSecao() {
  const nome = location.hash.slice(1);
  const atual = Object.hasOwn(secoes, nome) ? nome : "inicio";
  porId("page-title").textContent = secoes[atual];
  document.querySelectorAll(".page-section").forEach((secao) => {
    secao.classList.toggle("active", secao.id === "section-" + atual);
  });
  document.querySelectorAll("[data-section]").forEach((botao) => {
    const ativo = botao.dataset.section === atual;
    botao.classList.toggle("active", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });
}

function opcoes(id, itens, chaveId, descricao, dica) {
  const select = porId(id);
  const anterior = select.value;
  select.replaceChildren(new Option(dica, ""));
  itens.forEach((item) =>
    select.add(new Option(item[descricao], item[chaveId])),
  );
  select.value = anterior;
}

function dataBrasil(data) {
  if (!data) return "Em aberto";
  return data.split("-").reverse().join("/");
}

function tabela(id, itens, campos, vazio, grupo) {
  const corpo = porId(id);
  corpo.replaceChildren();
  if (!itens.length) {
    const celula = corpo.insertRow().insertCell();
    celula.colSpan = campos.length + (grupo ? 1 : 0);
    celula.className = "empty";
    celula.textContent = vazio;
  }
  for (const item of itens) {
    const linha = corpo.insertRow();
    for (const campo of campos) {
      const valor = item[campo];
      linha.insertCell().textContent = campo.startsWith("data_")
        ? dataBrasil(valor)
        : (valor ?? "—");
    }
    if (grupo) {
      const botao = document.createElement("button");
      botao.className = "delete-button";
      botao.textContent = "Excluir";
      botao.onclick = () => confirmar(grupo, item);
      linha.insertCell().append(botao);
    }
  }
}

function mostrarLivros() {
  if (!acervo) return;
  const busca = porId("search-livros").value.trim().toLocaleLowerCase();
  const lista = acervo.livros.filter((livro) =>
    [livro.titulo, livro.nome_autor].some((texto) =>
      texto.toLocaleLowerCase().includes(busca),
    ),
  );
  tabela(
    "livros-table",
    lista,
    ["titulo", "nome_autor", "ano_publicacao", "quantidade"],
    busca
      ? "Nenhum livro corresponde à busca."
      : "Ainda não há livros no acervo.",
    "livros",
  );
}

async function atualizar() {
  try {
    acervo = await carregarAcervo();
    for (const grupo of grupos)
      porId("total-" + grupo).textContent = acervo[grupo].length;
    mostrarLivros();
    tabela(
      "autores-table",
      acervo.autores,
      ["nome", "nacionalidade", "id_autor"],
      "Nenhum autor cadastrado.",
      "autores",
    );
    tabela(
      "usuarios-table",
      acervo.usuarios,
      ["nome", "email", "telefone"],
      "Nenhum leitor cadastrado.",
      "usuarios",
    );
    const historico = [...acervo.emprestimos].sort(
      (a, b) => b.id_emprestimo - a.id_emprestimo,
    );
    const campos = [
      "titulo_livro",
      "nome_usuario",
      "data_emprestimo",
      "data_devolucao",
    ];
    tabela(
      "emprestimos-table",
      historico,
      campos,
      "Nenhum empréstimo registrado.",
      "emprestimos",
    );
    tabela(
      "recentes-table",
      historico.slice(0, 5),
      campos,
      "Os próximos empréstimos aparecerão aqui.",
    );
    opcoes(
      "livro-autor",
      acervo.autores,
      "id_autor",
      "nome",
      "Selecione um autor",
    );
    opcoes(
      "emprestimo-usuario",
      acervo.usuarios,
      "id_usuario",
      "nome",
      "Selecione um usuário",
    );
    opcoes(
      "emprestimo-livro",
      acervo.livros.filter((l) => l.quantidade > 0),
      "id_livro",
      "titulo",
      "Selecione um livro disponível",
    );
    porId("storage-status").textContent = usarAPI
      ? "Conectado ao SQLite"
      : "Dados neste navegador";
  } catch (erro) {
    porId("storage-status").textContent = usarAPI
      ? "Falha ao consultar o Flask. Recarregue para tentar novamente."
      : "Falha ao ler o acervo local.";
    mensagem(erro.message, true);
  }
}

function confirmar(grupo, item) {
  const dialogo = porId("confirm-dialog");
  const nome = item.nome || item.titulo || item.titulo_livro;
  porId("confirm-message").textContent = "Excluir o registro “" + nome + "”?";
  dialogo.returnValue = "";
  dialogo.onclose = async () => {
    if (dialogo.returnValue !== "confirm") return;
    try {
      await alterarAcervo(grupo, null, item[camposId[grupo]]);
      mensagem("Registro excluído.");
      await atualizar();
    } catch (erro) {
      mensagem(erro.message, true);
    }
  };
  dialogo.showModal();
}

for (const [grupo, nome] of Object.entries(formularios)) {
  const form = porId("form-" + nome);
  const abrir = document.querySelector('[data-open="' + form.id + '"]');
  abrir.onclick = () => {
    form.classList.remove("hidden");
    form.querySelector("input, select").focus();
  };
  form.querySelector("[data-close]").onclick = () => {
    form.classList.add("hidden");
    abrir.focus();
  };
  form.onsubmit = async (evento) => {
    evento.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    for (const campo in dados) dados[campo] = dados[campo].trim();
    if (dados.nome === "" || dados.titulo === "")
      return mensagem("Preencha o nome ou título.", true);
    const salvar = form.querySelector('[type="submit"]');
    salvar.disabled = true;
    try {
      await alterarAcervo(grupo, dados);
      form.reset();
      form.classList.add("hidden");
      abrir.focus();
      mensagem("Registro salvo.");
      await atualizar();
    } catch (erro) {
      mensagem(erro.message, true);
    } finally {
      salvar.disabled = false;
    }
  };
}

document.querySelectorAll("[data-section], [data-go]").forEach((botao) => {
  botao.onclick = () =>
    (location.hash = botao.dataset.section || botao.dataset.go);
});
porId("search-livros").oninput = mostrarLivros;
const hoje = new Date();
porId("today").textContent = hoje.toLocaleDateString("pt-BR", {
  dateStyle: "long",
});
porId("data-emprestimo").defaultValue = [
  hoje.getFullYear(),
  String(hoje.getMonth() + 1).padStart(2, "0"),
  String(hoje.getDate()).padStart(2, "0"),
].join("-");
window.addEventListener("hashchange", mostrarSecao);
window.addEventListener("storage", (e) => {
  if (!usarAPI && e.key === chave) atualizar();
});
mostrarSecao();
atualizar();
