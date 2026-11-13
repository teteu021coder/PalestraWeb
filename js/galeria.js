const ampliacao = document.querySelector("#ampliacao");
for (const botao of document.querySelectorAll(".ampliar")) {
  botao.addEventListener("click", () => {
    const foto = botao.querySelector("img");
    const destino = ampliacao.querySelector("img");
    destino.src = foto.src;
    destino.alt = foto.alt;
    ampliacao.querySelector("p").textContent =
      botao.nextElementSibling.textContent;
    ampliacao.showModal();
  });
}
