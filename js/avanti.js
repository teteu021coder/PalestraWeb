// Sócio Avanti: conversa com a API Flask usando fetch.
const el = (id) => document.getElementById(id);
const formAdesao = el("form-adesao");
const formConsulta = el("form-consulta");
const previa = el("previa");
const cartao = el("cartao");
let planos = [];
let adesaoAtual = null;

const reais = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dataBr = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

async function api(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(caminho, {
      headers: { "Content-Type": "application/json" },
      ...opcoes,
    });
  } catch {
    el("offline").hidden = false;
    throw new Error("Não foi possível falar com o servidor. Confira se o Flask está rodando.");
  }
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.erro || "Algo deu errado. Tente de novo.");
  el("offline").hidden = true;
  return dados;
}

function desenharCarteirinha(c, { nome, plano, desde, numero, cancelada }) {
  c.querySelector(".carteirinha__nome").textContent = nome;
  const dd = c.querySelectorAll("dd");
  dd[0].textContent = plano;
  dd[1].textContent = desde;
  c.querySelector(".carteirinha__numero").textContent = numero;
  c.classList.toggle("carteirinha--cancelada", Boolean(cancelada));
  c.classList.toggle("carteirinha--vazia", numero.startsWith("AV-0000"));
}

function atualizarPrevia() {
  const dados = new FormData(formAdesao);
  const plano = planos.find((p) => String(p.id_plano) === dados.get("id_plano"));
  desenharCarteirinha(previa, {
    nome: (dados.get("nome") || "").trim() || "Seu nome aqui",
    plano: plano ? plano.nome : "A escolher",
    desde: dataBr(new Date().toISOString().slice(0, 10)),
    numero: "AV-0000-000000",
  });
}

function mostrarErro(id, texto) {
  const p = el(id);
  p.textContent = texto || "";
  p.hidden = !texto;
}

async function carregarPlanos() {
  try {
    planos = await api("/api/planos");
  } catch (erro) {
    el("planos-carregando").textContent = "Não foi possível carregar os planos.";
    return;
  }
  const area = el("planos");
  el("planos-carregando").remove();
  planos.forEach((p, i) => {
    const rotulo = document.createElement("label");
    rotulo.className = "plano";
    const entrada = document.createElement("input");
    Object.assign(entrada, { type: "radio", name: "id_plano", value: p.id_plano, required: true });
    if (i === 1) entrada.checked = true;
    const nome = Object.assign(document.createElement("span"), { className: "plano__nome", textContent: p.nome });
    const preco = Object.assign(document.createElement("span"), { className: "plano__preco" });
    preco.append(reais(p.valor_mensal), Object.assign(document.createElement("small"), { textContent: " por mês" }));
    const resumo = Object.assign(document.createElement("span"), { className: "plano__resumo", textContent: p.resumo });
    const itens = document.createElement("ul");
    p.beneficios.forEach((b) => itens.append(Object.assign(document.createElement("li"), { textContent: b })));
    rotulo.append(entrada, nome, preco, resumo, itens);
    area.append(rotulo);
  });
  atualizarPrevia();
}

async function carregarResumo() {
  try {
    const r = await api("/api/resumo");
    const c = el("contador");
    c.textContent = r.total_ativas === 1 ? "1 sócio ativo no Avanti." : `${r.total_ativas} sócios ativos no Avanti.`;
    c.hidden = false;
  } catch { /* o aviso de servidor já aparece */ }
}

formAdesao.addEventListener("input", atualizarPrevia);
formAdesao.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarErro("erro-adesao", "");
  const dados = Object.fromEntries(new FormData(formAdesao));
  const botao = el("enviar");
  botao.disabled = true;
  botao.textContent = "Criando…";
  try {
    const adesao = await api("/api/adesoes", { method: "POST", body: JSON.stringify(dados) });
    desenharCarteirinha(previa, {
      nome: adesao.nome, plano: adesao.plano.nome,
      desde: dataBr(adesao.data_adesao), numero: adesao.carteirinha,
    });
    formAdesao.hidden = true;
    el("sucesso").hidden = false;
    el("sucesso").querySelector("h3").focus?.();
    formConsulta.elements.carteirinha.value = adesao.carteirinha;
    formConsulta.elements.email.value = dados.email;
    carregarResumo();
  } catch (erro) {
    mostrarErro("erro-adesao", erro.message);
  } finally {
    botao.disabled = false;
    botao.textContent = "Criar minha carteirinha";
  }
});

function mostrarAdesao(a) {
  adesaoAtual = a;
  desenharCarteirinha(cartao, {
    nome: a.nome, plano: a.plano.nome, desde: dataBr(a.data_adesao),
    numero: a.carteirinha, cancelada: a.status === "cancelada",
  });
  el("info-adesao").textContent = a.status === "cancelada"
    ? `Adesão cancelada em ${dataBr(a.data_cancelamento)}.`
    : `Plano ${a.plano.nome}, ${reais(a.plano.valor_mensal)} por mês.`;
  el("cancelar").hidden = a.status === "cancelada";
  el("confirmacao").hidden = true;
  el("resultado").hidden = false;
}

formConsulta.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarErro("erro-consulta", "");
  el("resultado").hidden = true;
  const dados = Object.fromEntries(new FormData(formConsulta));
  try {
    mostrarAdesao(await api("/api/adesoes/consulta", { method: "POST", body: JSON.stringify(dados) }));
  } catch (erro) {
    mostrarErro("erro-consulta", erro.message);
  }
});

el("cancelar").addEventListener("click", () => {
  el("confirmacao").hidden = false;
  el("confirmar-cancelamento").focus();
});
el("manter").addEventListener("click", () => {
  el("confirmacao").hidden = true;
  el("cancelar").focus();
});
el("confirmar-cancelamento").addEventListener("click", async () => {
  try {
    const email = formConsulta.elements.email.value;
    const a = await api(`/api/adesoes/${encodeURIComponent(adesaoAtual.carteirinha)}`, {
      method: "DELETE", body: JSON.stringify({ email }),
    });
    mostrarAdesao(a);
    carregarResumo();
  } catch (erro) {
    mostrarErro("erro-consulta", erro.message);
    el("confirmacao").hidden = true;
  }
});

carregarPlanos();
carregarResumo();
