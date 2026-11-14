// Lightbox da galeria: abre a foto, navega com botões ou setas e fecha clicando fora.
const ampliacao = document.querySelector("#ampliacao");
const fotos = [...document.querySelectorAll(".ampliar")];
const imagem = ampliacao.querySelector("img");
const legenda = ampliacao.querySelector("p");
const contador = ampliacao.querySelector(".ampliacao-contador");
let atual = 0;

function mostrar(indice) {
  atual = (indice + fotos.length) % fotos.length;
  const botao = fotos[atual];
  const foto = botao.querySelector("img");
  imagem.src = foto.src;
  imagem.alt = foto.alt;
  legenda.textContent = botao.nextElementSibling.textContent
    .replace(/\s+/g, " ")
    .trim();
  contador.textContent = atual + 1 + " de " + fotos.length;
}

fotos.forEach((botao, indice) => {
  botao.addEventListener("click", () => {
    mostrar(indice);
    ampliacao.showModal();
  });
});

ampliacao.querySelectorAll("[data-dir]").forEach((botao) => {
  botao.addEventListener("click", () => mostrar(atual + Number(botao.dataset.dir)));
});

ampliacao.addEventListener("keydown", (evento) => {
  if (evento.key === "ArrowLeft") mostrar(atual - 1);
  if (evento.key === "ArrowRight") mostrar(atual + 1);
});

// Clique no fundo escurecido fecha o diálogo.
ampliacao.addEventListener("click", (evento) => {
  if (evento.target === ampliacao) ampliacao.close();
});
