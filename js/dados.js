const chave = "bibliotecaAuroraDados";
const grupos = ["autores", "livros", "usuarios", "emprestimos"];
const camposId = {
  autores: "id_autor",
  livros: "id_livro",
  usuarios: "id_usuario",
  emprestimos: "id_emprestimo",
};

// A página servida pelo Flask recebe usarAPI=true. Uma falha nunca muda o destino.
async function requisicao(caminho, metodo = "GET", registro) {
  let resposta;
  try {
    resposta = await fetch("/api/" + caminho, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
      cache: "no-store",
    });
  } catch {
    throw new Error(
      "Sem conexão com o Flask. Confira o servidor e tente novamente.",
    );
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok)
    throw new Error(dados.erro || "A API não conseguiu concluir o pedido.");
  return dados;
}

function lerLocal() {
  const salvo = localStorage.getItem(chave);
  if (salvo === null)
    return { autores: [], livros: [], usuarios: [], emprestimos: [] };
  const banco = JSON.parse(salvo);
  if (!grupos.every((grupo) => Array.isArray(banco[grupo]))) {
    throw new Error(
      "O formato dos dados locais é inválido. O acervo foi preservado.",
    );
  }
  return banco;
}

async function carregarAcervo() {
  if (!usarAPI) return lerLocal();
  const banco = {};
  for (const grupo of grupos) banco[grupo] = await requisicao(grupo);
  return banco;
}

function localizar(lista, campo, id) {
  return lista.find((item) => Number(item[campo]) === Number(id));
}

function adicionarLocal(banco, grupo, dados) {
  const campo = camposId[grupo];
  // O histórico pode conter IDs de livros ou usuários já excluídos.
  const anteriores = [...banco[grupo], ...banco.emprestimos];
  dados[campo] =
    anteriores.reduce(
      (max, item) => Math.max(max, Number(item[campo]) || 0),
      0,
    ) + 1;
  if (grupo === "livros") {
    const autor = localizar(banco.autores, "id_autor", dados.id_autor);
    if (!autor) throw new Error("Cadastre e selecione um autor.");
    dados.nome_autor = autor.nome;
    dados.id_autor = autor.id_autor;
    dados.quantidade = Number(dados.quantidade);
    dados.ano_publicacao = dados.ano_publicacao
      ? Number(dados.ano_publicacao)
      : null;
  }
  if (
    grupo === "usuarios" &&
    banco.usuarios.some((item) => item.email === dados.email)
  ) {
    throw new Error("Este e-mail já está cadastrado.");
  }
  if (grupo === "emprestimos") {
    const livro = localizar(banco.livros, "id_livro", dados.id_livro);
    const usuario = localizar(banco.usuarios, "id_usuario", dados.id_usuario);
    if (!usuario || !livro || livro.quantidade < 1)
      throw new Error("Confira o leitor e a disponibilidade do livro.");
    dados.nome_usuario = usuario.nome;
    dados.id_usuario = usuario.id_usuario;
    dados.titulo_livro = livro.titulo;
    dados.id_livro = livro.id_livro;
    dados.data_devolucao = null;
    // A mesma gravação salva o empréstimo e a baixa de um exemplar.
    livro.quantidade -= 1;
  }
  banco[grupo].push(dados);
}

function excluirLocal(banco, grupo, id) {
  const registro = localizar(banco[grupo], camposId[grupo], id);
  if (!registro) throw new Error("Registro não encontrado.");
  if (
    grupo === "autores" &&
    banco.livros.some((livro) => livro.id_autor === registro.id_autor)
  ) {
    throw new Error("Este autor possui livros cadastrados.");
  }
  if (grupo === "emprestimos") {
    const livro = localizar(banco.livros, "id_livro", registro.id_livro);
    if (livro) livro.quantidade += 1;
  }
  banco[grupo] = banco[grupo].filter((item) => item !== registro);
}

async function alterarAcervo(grupo, dados, id) {
  if (usarAPI) {
    if (id !== undefined) await requisicao(grupo + "/" + id, "DELETE");
    else await requisicao(grupo, "POST", dados);
    return;
  }
  function gravar() {
    const banco = lerLocal();
    if (id !== undefined) excluirLocal(banco, grupo, id);
    else adicionarLocal(banco, grupo, dados);
    localStorage.setItem(chave, JSON.stringify(banco));
  }
  if (navigator.locks) await navigator.locks.request(chave, gravar);
  else gravar();
}
