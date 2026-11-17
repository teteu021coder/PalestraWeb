// Central de ingressos demonstrativa. Não consulta venda real: serve para testar a interação.
// Jogos, valores e ocupação são ilustrativos e nada é reservado nem cobrado.
const setores = document.querySelectorAll(".setor");
const area = document.getElementById("assentos");
const titulo = document.getElementById("titulo-setor");
const instrucao = document.getElementById("instrucao");
const meta = document.getElementById("setor-meta");
const escolhido = document.getElementById("selecionado");
const legenda = document.getElementById("legenda-assentos");
const resumo = document.getElementById("resumo");
const listaBilhetes = document.getElementById("bilhetes");
const botaoLimpar = document.getElementById("limpar");
const passos = document.querySelectorAll(".passo");
const listaJogos = document.getElementById("jogos-lista");
const avisoJogo = document.getElementById("jogo-escolhido");
const corpoPrecos = document.querySelector("#tabela-precos tbody");
const legendaPrecos = document.getElementById("precos-legenda");

const FILAS = ["A", "B", "C", "D"];
const POR_FILA = 6;
const MAX_ASSENTOS = 4;

// Valor ilustrativo por setor, para um jogo de peso normal.
const PRECOS = { Oeste: 180, Leste: 140, "Gol Norte": 90, "Gol Sul": 80 };
const ORDEM_SETORES = ["Oeste", "Leste", "Gol Norte", "Gol Sul"];

// Jogos de exemplo: não vêm da tabela oficial. "fator" encarece jogos maiores.
const JOGOS = [
  { id: "j1", data: "Dom, 22 nov", hora: "16h", adversario: "Santos", competicao: "Brasileirão", fator: 1, selo: "" },
  { id: "j2", data: "Dom, 29 nov", hora: "18h30", adversario: "Corinthians", competicao: "Brasileirão", fator: 1.25, selo: "Clássico" },
  { id: "j3", data: "Qua, 2 dez", hora: "21h30", adversario: "Grêmio", competicao: "Brasileirão", fator: 1.1, selo: "" },
  { id: "j4", data: "Dom, 6 dez", hora: "16h", adversario: "Bahia", competicao: "Brasileirão", fator: 1, selo: "" },
];

// "mult" é o que se paga em relação à inteira.
const TIPOS = {
  inteira: { nome: "Inteira", mult: 1 },
  meia: { nome: "Meia-entrada", mult: 0.5 },
  socio: { nome: "Sócio Avanti", mult: 0.7 },
};

const dinheiro = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

let setorAtual = null;
let selecionados = [];
let jogoAtual = JOGOS[0];
let tipoAtual = "inteira";

function preco(setor, jogo = jogoAtual, tipo = tipoAtual) {
  return Math.round(PRECOS[setor] * jogo.fator * TIPOS[tipo].mult);
}

const nomeJogo = (jogo) => "Palmeiras x " + jogo.adversario;
const quando = (jogo) => jogo.data + ", " + jogo.hora;

// Ocupação fixa por setor e jogo, para o mapa não mudar a cada clique.
function ocupado(setor, indice) {
  let semente = JOGOS.indexOf(jogoAtual) * 7;
  for (const letra of setor) semente += letra.charCodeAt(0);
  return (semente * indice + indice * indice) % 4 === 0;
}

function marcarPasso(atual) {
  passos.forEach((p) => {
    const n = Number(p.dataset.passo);
    p.classList.toggle("passo--ativo", n === atual);
    p.classList.toggle("passo--feito", n < atual);
    if (n === atual) p.setAttribute("aria-current", "step");
    else p.removeAttribute("aria-current");
  });
}

// ---------- Jogos ----------
function criarCartaoJogo(jogo) {
  const item = document.createElement("li");
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "jogo";
  botao.dataset.id = jogo.id;
  botao.setAttribute("aria-pressed", String(jogo === jogoAtual));

  const topo = document.createElement("span");
  topo.className = "jogo__topo";
  const data = document.createElement("span");
  data.className = "jogo__data";
  data.textContent = quando(jogo);
  topo.append(data);
  if (jogo.selo) {
    const selo = document.createElement("span");
    selo.className = "jogo__selo";
    selo.textContent = jogo.selo;
    topo.append(selo);
  }

  const times = document.createElement("strong");
  times.className = "jogo__times";
  times.textContent = nomeJogo(jogo);

  const comp = document.createElement("span");
  comp.className = "jogo__comp";
  comp.textContent = jogo.competicao + " · Allianz Parque";

  const aPartir = document.createElement("span");
  aPartir.className = "jogo__preco";
  aPartir.textContent = "a partir de " + dinheiro(preco("Gol Sul", jogo, "inteira"));

  botao.append(topo, times, comp, aPartir);
  botao.addEventListener("click", () => escolherJogo(jogo));
  item.append(botao);
  return item;
}

function desenharJogos() {
  listaJogos.replaceChildren(...JOGOS.map(criarCartaoJogo));
}

function textoJogoEscolhido() {
  avisoJogo.replaceChildren();
  const texto = document.createElement("span");
  texto.textContent = "Jogo escolhido: " + nomeJogo(jogoAtual) + ", " + quando(jogoAtual) + ".";
  const ir = document.createElement("a");
  ir.href = "#mapa";
  ir.textContent = "Escolher setor e assentos";
  avisoJogo.append(texto, ir);
}

function escolherJogo(jogo) {
  const mudou = jogo !== jogoAtual;
  jogoAtual = jogo;
  listaJogos.querySelectorAll(".jogo").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === jogo.id)));
  textoJogoEscolhido();
  atualizarPrecos();

  if (mudou && setorAtual) {
    // A ocupação muda por jogo; refaz o setor aberto e limpa a seleção.
    const botao = [...setores].find((b) => b.dataset.setor === setorAtual);
    mostrarSetor(botao);
    escolhido.textContent = "Jogo trocado. Os assentos deste setor mudaram, escolha de novo.";
  } else {
    atualizarResumo();
  }
}

// ---------- Preços ----------
function atualizarPrecos() {
  setores.forEach((botao) => {
    botao.querySelector(".setor__preco").textContent = "a partir de " + dinheiro(preco(botao.dataset.setor));
  });
  document.querySelectorAll("[data-preco-setor]").forEach((el) => {
    el.textContent = dinheiro(preco(el.dataset.precoSetor));
  });

  corpoPrecos.replaceChildren(
    ...ORDEM_SETORES.map((setor) => {
      const linha = document.createElement("tr");
      const nome = document.createElement("th");
      nome.scope = "row";
      nome.textContent = setor;
      linha.append(nome);
      for (const tipo of Object.keys(TIPOS)) {
        const celula = document.createElement("td");
        celula.textContent = dinheiro(preco(setor, jogoAtual, tipo));
        if (tipo === tipoAtual) celula.className = "tabela-precos__ativo";
        linha.append(celula);
      }
      return linha;
    })
  );
  legendaPrecos.textContent =
    "Valores de demonstração para " + nomeJogo(jogoAtual) + ", " + quando(jogoAtual) + ".";

  if (setorAtual) {
    meta.textContent = textoMeta(setorAtual);
  }
}

// ---------- Bilhetes e resumo ----------
function criarBilhete(assento) {
  const bilhete = document.createElement("div");
  bilhete.className = "bilhete";

  const corpo = document.createElement("div");
  corpo.className = "bilhete__corpo";
  const nome = document.createElement("h3");
  nome.textContent = setorAtual;
  const texto = document.createElement("p");
  texto.textContent = nomeJogo(jogoAtual) + " · " + quando(jogoAtual) + ". Demonstração, nada foi reservado.";
  corpo.append(nome, texto);

  const canhoto = document.createElement("div");
  canhoto.className = "bilhete__canhoto";
  const rotulo = document.createElement("small");
  rotulo.textContent = "Assento";
  const numero = document.createElement("span");
  numero.className = "bilhete__numero";
  numero.textContent = assento;
  canhoto.append(rotulo, numero);

  bilhete.append(corpo, canhoto);
  return bilhete;
}

function atualizarResumo() {
  const quantidade = selecionados.length;
  botaoLimpar.hidden = quantidade === 0;

  if (quantidade === 0) {
    resumo.hidden = true;
    listaBilhetes.replaceChildren();
    escolhido.textContent = setorAtual ? "Nenhum assento selecionado." : "";
    marcarPasso(setorAtual ? 2 : 1);
    return;
  }

  const unitario = preco(setorAtual);
  document.getElementById("resumo-jogo").textContent = nomeJogo(jogoAtual) + " · " + quando(jogoAtual);
  document.getElementById("resumo-setor").textContent = setorAtual;
  document.getElementById("resumo-tipo").textContent = TIPOS[tipoAtual].nome;
  document.getElementById("resumo-qtd").textContent =
    quantidade + (quantidade === 1 ? " ingresso" : " ingressos");
  document.getElementById("resumo-unit").textContent = dinheiro(unitario);
  document.getElementById("resumo-total").textContent = dinheiro(unitario * quantidade);

  listaBilhetes.replaceChildren(...selecionados.map(criarBilhete));
  resumo.hidden = false;
  marcarPasso(3);

  escolhido.textContent =
    quantidade + (quantidade === 1 ? " assento demonstrativo selecionado" : " assentos demonstrativos selecionados") +
    " no setor " + setorAtual + ": " + selecionados.join(", ") +
    ". Total de demonstração: " + dinheiro(unitario * quantidade) + ".";
}

function alternarAssento(cadeira) {
  const rotulo = cadeira.dataset.rotulo;
  const indice = selecionados.indexOf(rotulo);

  if (indice >= 0) {
    selecionados.splice(indice, 1);
    cadeira.setAttribute("aria-pressed", "false");
  } else {
    if (selecionados.length >= MAX_ASSENTOS) {
      escolhido.textContent = "Limite de " + MAX_ASSENTOS + " assentos por pedido. Desmarque um para escolher outro.";
      return;
    }
    selecionados.push(rotulo);
    cadeira.setAttribute("aria-pressed", "true");
  }

  atualizarResumo();
}

function limparSelecao() {
  selecionados = [];
  area.querySelectorAll(".assento[aria-pressed='true']").forEach((a) => a.setAttribute("aria-pressed", "false"));
  atualizarResumo();
}

function textoMeta(setor) {
  const livres = area.querySelectorAll(".assento:not(:disabled)").length;
  return dinheiro(preco(setor)) + " por ingresso (" + TIPOS[tipoAtual].nome.toLowerCase() + ") · " + livres + " assentos livres · até " + MAX_ASSENTOS + " por pedido";
}

function mostrarSetor(botao) {
  const setor = botao.dataset.setor;
  setorAtual = setor;
  selecionados = [];

  setores.forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  titulo.textContent = setor;
  instrucao.textContent =
    "Assentos ilustrativos deste setor. Escolha até " + MAX_ASSENTOS + " números livres para testar a interação.";
  legenda.hidden = false;
  area.replaceChildren();

  FILAS.forEach((letra, f) => {
    const fila = document.createElement("div");
    fila.className = "fila";
    fila.setAttribute("role", "group");
    fila.setAttribute("aria-label", "Fila " + letra);

    const nomeFila = document.createElement("span");
    nomeFila.className = "fila__letra";
    nomeFila.setAttribute("aria-hidden", "true");
    nomeFila.textContent = letra;
    fila.append(nomeFila);

    for (let n = 1; n <= POR_FILA; n++) {
      const rotulo = letra + n;
      const cadeira = document.createElement("button");
      cadeira.className = "assento";
      cadeira.type = "button";
      cadeira.textContent = rotulo;
      cadeira.dataset.rotulo = rotulo;

      if (ocupado(setor, f * POR_FILA + n)) {
        cadeira.disabled = true;
        cadeira.setAttribute("aria-label", "Assento " + rotulo + ", ocupado");
      } else {
        cadeira.setAttribute("aria-label", "Assento " + rotulo + ", livre");
        cadeira.setAttribute("aria-pressed", "false");
        cadeira.addEventListener("click", () => alternarAssento(cadeira));
      }
      fila.append(cadeira);
    }
    area.append(fila);
  });

  meta.hidden = false;
  meta.textContent = textoMeta(setor);

  atualizarResumo();
}

// ---------- Eventos ----------
setores.forEach((botao) => botao.addEventListener("click", () => mostrarSetor(botao)));
botaoLimpar.addEventListener("click", limparSelecao);

document.getElementById("tipos").addEventListener("change", (e) => {
  if (e.target.name !== "tipo") return;
  tipoAtual = e.target.value;
  atualizarPrecos();
  atualizarResumo();
});

desenharJogos();
textoJogoEscolhido();
atualizarPrecos();
