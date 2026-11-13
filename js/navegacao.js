const menu = document.querySelector(".menu");
const botaoMenu = document.querySelector("#abrir-menu");
function mostrarMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  botaoMenu.setAttribute("aria-expanded", String(aberto));
}
botaoMenu.addEventListener("click", () =>
  mostrarMenu(!menu.classList.contains("aberto")),
);
document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && menu.classList.contains("aberto")) {
    mostrarMenu(false);
    botaoMenu.focus();
  }
});
