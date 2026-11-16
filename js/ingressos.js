// Mapa demonstrativo de setores. Não consulta venda real: serve para testar a interação.
const setores = document.querySelectorAll(".setor");
const area = document.getElementById("assentos");
const titulo = document.getElementById("titulo-setor");
const instrucao = document.getElementById("instrucao");
const escolhido = document.getElementById("selecionado");
const legenda = document.getElementById("legenda-assentos");
const bilhete = document.getElementById("bilhete");
const TOTAL_ASSENTOS = 24;

// Ocupação fixa por setor, para o mapa não mudar a cada clique.
function ocupado(setor, numero) {
  let semente = 0;
  for (const letra of setor) semente += letra.charCodeAt(0);
  return (semente * numero + numero * numero) % 4 === 0;
}

function selecionarAssento(cadeira, setor) {
  area.querySelectorAll(".assento").forEach((a) => {
    a.setAttribute("aria-pressed", String(a === cadeira));
  });
  escolhido.textContent =
    "Assento demonstrativo " + cadeira.textContent + ", setor " + setor;
  document.getElementById("bilhete-setor").textContent = setor;
  document.getElementById("bilhete-numero").textContent = cadeira.textContent;
  bilhete.hidden = false;
}

function mostrarSetor(botao) {
  const setor = botao.dataset.setor;
  setores.forEach((b) => b.setAttribute("aria-pressed", String(b === botao)));
  titulo.textContent = setor;
  instrucao.textContent =
    "Assentos ilustrativos deste setor. Escolha um número livre para testar a interação.";
  escolhido.textContent = "";
  bilhete.hidden = true;
  legenda.hidden = false;
  area.replaceChildren();
  for (let n = 1; n <= TOTAL_ASSENTOS; n++) {
    const cadeira = document.createElement("button");
    cadeira.className = "assento";
    cadeira.type = "button";
    cadeira.textContent = n;
    if (ocupado(setor, n)) {
      cadeira.disabled = true;
      cadeira.setAttribute("aria-label", "Assento " + n + ", ocupado");
    } else {
      cadeira.setAttribute("aria-pressed", "false");
      cadeira.addEventListener("click", () => selecionarAssento(cadeira, setor));
    }
    area.append(cadeira);
  }
}

setores.forEach((botao) => botao.addEventListener("click", () => mostrarSetor(botao)));
