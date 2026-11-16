// Menu, topo que muda ao rolar, progresso da linha do tempo e brilho da carteirinha.
const topo = document.querySelector(".topo");
const menu = document.querySelector("#menu");
const botaoMenu = document.querySelector("#abrir-menu");
const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

function mostrarMenu(aberto) {
  menu.classList.toggle("aberto", aberto);
  topo.classList.toggle("aberto", aberto);
  document.body.classList.toggle("menu-aberto", aberto);
  botaoMenu.setAttribute("aria-expanded", String(aberto));
}
botaoMenu.addEventListener("click", () => mostrarMenu(!menu.classList.contains("aberto")));
menu.addEventListener("click", (e) => { if (e.target.closest("a")) mostrarMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu.classList.contains("aberto")) {
    mostrarMenu(false);
    botaoMenu.focus();
  }
});

const lista = document.querySelector(".tempo__lista");
function aoRolar() {
  topo.classList.toggle("rolou", window.scrollY > 24);
  if (lista) {
    const r = lista.getBoundingClientRect();
    const visto = (innerHeight * 0.65 - r.top) / r.height;
    lista.style.setProperty("--progresso", Math.min(1, Math.max(0, visto)).toFixed(3));
  }
}
addEventListener("scroll", aoRolar, { passive: true });
aoRolar();

// A carteirinha acompanha o ponteiro, como um cartão de plástico na mão.
if (!reduzido && matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".carteirinha").forEach((cartao) => {
    cartao.addEventListener("pointermove", (e) => {
      const r = cartao.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      cartao.style.setProperty("--ang-y", ((x - 0.5) * 12).toFixed(2) + "deg");
      cartao.style.setProperty("--ang-x", ((0.5 - y) * 12).toFixed(2) + "deg");
      cartao.style.setProperty("--brilho-x", (x * 100).toFixed(0) + "%");
      cartao.style.setProperty("--brilho-y", (y * 100).toFixed(0) + "%");
    });
    cartao.addEventListener("pointerleave", () => {
      cartao.style.setProperty("--ang-x", "0deg");
      cartao.style.setProperty("--ang-y", "0deg");
    });
  });
}
