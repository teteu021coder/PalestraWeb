// Mapa demonstrativo de setores. Não consulta venda real: serve para testar a interação.
// Valores e ocupação são ilustrativos e nada é reservado nem cobrado.
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

const FILAS = ["A", "B", "C", "D"];
const POR_FILA = 6;
const MAX_ASSENTOS = 4;

// Valor ilustrativo por setor.
const PRECOS = { Oeste: 180, Leste: 140, "Gol Norte": 90, "Gol Sul": 80 };

const dinheiro = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

let setorAtual = null;
let selecionados = [];

// Ocupação fixa por setor, para o mapa não mudar a cada clique.
function ocupado(setor, indice) {
  let semente = 0;
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

function criarBilhete(assento) {
  const bilhete = document.createElement("div");
  bilhete.className = "bilhete";

  const corpo = document.createElement("div");
  corpo.className = "bilhete__corpo";
  const nome = document.createElement("h3");
  nome.textContent = setorAtual;
  const texto = document.createElement("p");
  texto.textContent = "Assento de demonstração. Nada foi reservado.";
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

  const unitario = PRECOS[setorAtual];
  document.getElementById("resumo-setor").textContent = setorAtual;
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

  let livres = 0;
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
        livres++;
        cadeira.setAttribute("aria-label", "Assento " + rotulo + ", livre");
        cadeira.setAttribute("aria-pressed", "false");
        cadeira.addEventListener("click", () => alternarAssento(cadeira));
      }
      fila.append(cadeira);
    }
    area.append(fila);
  });

  meta.hidden = false;
  meta.textContent = dinheiro(PRECOS[setor]) + " por ingresso · " + livres + " assentos livres · até " + MAX_ASSENTOS + " por pedido";

  atualizarResumo();
}

setores.forEach((botao) => botao.addEventListener("click", () => mostrarSetor(botao)));
botaoLimpar.addEventListener("click", limparSelecao);
