// renderer.js — Calculadora IMT V1.0 RE/MAX Grupo Vantagem

const VALOR_ESCRITURA_REGISTO = 850;
const VALOR_PROCESSO_BANCARIO = 850;
const PERCENTAGEM_FINANCIAMENTO_PADRAO = 90;
const NOTA_LEGAL = "NOTA: A informação aqui apresentada é meramente indicativa e depende dos dados introduzidos pelo utilizador. Para obter cálculos finais e vinculativos deverá contactar a Autoridade Tributária e Aduaneira. Os valores de Escritura + Registo e Processo Bancário são meramente indicativos.";

if (window.REMAX_LOGO_PDF_DATA) {
  const logo = document.getElementById("logo");
  if (logo) logo.src = window.REMAX_LOGO_PDF_DATA;
}

function formatarEuro(valor) {
  return valor.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + " €";
}

function obterValorNumerico(id) {
  const valor = parseFloat(document.getElementById(id).value);
  return isNaN(valor) ? 0 : valor;
}

function formatarValorInput(valor) {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
}

function atualizarFinanciamentoAutomatico() {
  const valorAquisicao = obterValorNumerico("valor");
  const campoFinanciamento = document.getElementById("financiamento");
  const campoPercentagem = document.getElementById("percentagem-financiamento");
  const percentagem = campoPercentagem.value === "" ? PERCENTAGEM_FINANCIAMENTO_PADRAO : obterValorNumerico("percentagem-financiamento");

  if (valorAquisicao <= 0) {
    campoFinanciamento.value = "";
    return;
  }

  const financiamento = Math.round(valorAquisicao * (percentagem / 100) * 100) / 100;
  campoFinanciamento.value = formatarValorInput(financiamento);
}

function atualizarPercentagemFinanciamento() {
  const valorAquisicao = obterValorNumerico("valor");
  const financiamento = obterValorNumerico("financiamento");
  const campoPercentagem = document.getElementById("percentagem-financiamento");

  if (valorAquisicao <= 0) {
    campoPercentagem.value = String(PERCENTAGEM_FINANCIAMENTO_PADRAO);
    return;
  }

  const percentagem = Math.round((financiamento / valorAquisicao) * 10000) / 100;
  campoPercentagem.value = formatarValorInput(percentagem);
}

function reporCalculadora() {
  document.getElementById("valor").value = "";
  document.getElementById("financiamento").value = "";
  document.getElementById("percentagem-financiamento").value = String(PERCENTAGEM_FINANCIAMENTO_PADRAO);
  document.getElementById("tipo").value = "habitacao_propria";
  document.getElementById("isencao-jovem").checked = false;

  document.getElementById("imt").textContent = "—";
  document.getElementById("selo").textContent = "—";
  document.getElementById("selo-financiamento").textContent = "—";
  document.getElementById("escritura").textContent = "—";
  document.getElementById("processo").textContent = "—";
  document.getElementById("total").textContent = "—";
}

async function garantirJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;

  const fontes = [
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"
  ];

  for (const src of fontes) {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
    } catch (error) {
      // Tenta a próxima fonte.
    }
  }

  alert("Não foi possível carregar a biblioteca de exportação PDF. Verifica a ligação à internet e tenta novamente.");
  return null;
}

function calcularIMT(valor, tipo) {
  let imt = 0;
  let taxa = 0;
  let abatimento = 0;

  // Tabelas IMT 2025 — Continente
  if (tipo === "habitacao_propria") {
    if (valor <= 104261) { taxa = 0; abatimento = 0; }
    else if (valor <= 142618) { taxa = 0.02; abatimento = 2085.22; }
    else if (valor <= 194458) { taxa = 0.05; abatimento = 6363.76; }
    else if (valor <= 324058) { taxa = 0.07; abatimento = 10252.92; }
    else if (valor <= 648022) { taxa = 0.08; abatimento = 13493.50; }
    else if (valor <= 1128287) { taxa = 0.06; abatimento = 0; }
    else { taxa = 0.075; abatimento = 0; }

    imt = valor * taxa - abatimento;
  }

  else if (tipo === "secundaria") {
    if (valor <= 104261) { taxa = 0.01; abatimento = 0; }
    else if (valor <= 142618) { taxa = 0.02; abatimento = 1042.61; }
    else if (valor <= 194458) { taxa = 0.05; abatimento = 5321.15; }
    else if (valor <= 324058) { taxa = 0.07; abatimento = 9210.31; }
    else if (valor <= 648022) { taxa = 0.08; abatimento = 12450.89; }
    else if (valor <= 1128287) { taxa = 0.06; abatimento = 0; }
    else { taxa = 0.075; abatimento = 0; }

    imt = valor * taxa - abatimento;
  }

  else if (tipo === "terrenos") {
    imt = valor * 0.065;
  }

  return imt < 0 ? 0 : imt;
}

function calcular() {
  const valor = obterValorNumerico("valor");
  const financiamento = obterValorNumerico("financiamento");
  const tipo = document.getElementById("tipo").value;
  const aplicarIsencaoJovem = document.getElementById("isencao-jovem").checked;

  if (valor <= 0) {
    alert("Por favor, introduza um valor de aquisição válido.");
    return;
  }

  const imt = aplicarIsencaoJovem ? 0 : calcularIMT(valor, tipo);
  const selo = aplicarIsencaoJovem ? 0 : valor * 0.008;
  const seloFinanciamento = financiamento * 0.006;
  const escrituraRegisto = VALOR_ESCRITURA_REGISTO;
  const processoBancario = financiamento > 0 ? VALOR_PROCESSO_BANCARIO : 0;

  const total = imt + selo + seloFinanciamento + escrituraRegisto + processoBancario;

  document.getElementById("imt").textContent = formatarEuro(imt);
  document.getElementById("selo").textContent = formatarEuro(selo);
  document.getElementById("selo-financiamento").textContent = formatarEuro(seloFinanciamento);
  document.getElementById("escritura").textContent = formatarEuro(escrituraRegisto);
  document.getElementById("processo").textContent = formatarEuro(processoBancario);
  document.getElementById("total").textContent = formatarEuro(total);
}

document.getElementById("calcular").addEventListener("click", calcular);
document.getElementById("logo").addEventListener("click", reporCalculadora);
document.getElementById("logo").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    reporCalculadora();
  }
});

document.getElementById("valor").addEventListener("input", atualizarFinanciamentoAutomatico);
document.getElementById("percentagem-financiamento").addEventListener("input", atualizarFinanciamentoAutomatico);
document.getElementById("financiamento").addEventListener("input", atualizarPercentagemFinanciamento);

document.getElementById("valor").addEventListener("keydown", (event) => {
  if (event.key === "Enter") calcular();
});

document.getElementById("financiamento").addEventListener("keydown", (event) => {
  if (event.key === "Enter") calcular();
});

document.getElementById("exportar").addEventListener("click", async () => {
  const jsPDF = await garantirJsPDF();
  if (!jsPDF) return;

  const valor = document.getElementById("valor").value;
  const financiamento = document.getElementById("financiamento").value || "0";
  const percentagemFinanciamento = document.getElementById("percentagem-financiamento").value || "0";
  const isencaoJovem = document.getElementById("isencao-jovem").checked ? "Sim" : "Não";
  const tipoSelect = document.getElementById("tipo");
  const tipoTexto = tipoSelect.options[tipoSelect.selectedIndex].text;

  const imt = document.getElementById("imt").textContent;
  const selo = document.getElementById("selo").textContent;
  const seloFinanciamento = document.getElementById("selo-financiamento").textContent;
  const escritura = document.getElementById("escritura").textContent;
  const processo = document.getElementById("processo").textContent;
  const total = document.getElementById("total").textContent;

  if (!valor || imt === "—") {
    alert("Por favor, realiza primeiro o cálculo.");
    return;
  }

  const dataAtual = new Date().toLocaleDateString("pt-PT");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  if (!window.REMAX_LOGO_PDF_DATA) {
    alert("Não foi possível preparar o logotipo da RE/MAX Vantagem para o PDF. Tenta recarregar a página.");
    return;
  }

  // Cabeçalho
  doc.addImage(window.REMAX_LOGO_PDF_DATA, "PNG", 15, 14, 72, 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0, 75, 147);
  doc.text("Simulação de IMT e Imposto de Selo", 15, 52, { align: "left" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(114, 114, 114);
  doc.text(`Data: ${dataAtual}`, 195, 22, { align: "right" });

  doc.setDrawColor(228, 0, 43);
  doc.setLineWidth(0.7);
  doc.line(15, 59, 195, 59);

  // Cartão: dados principais
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(15, 72, 180, 70, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 75, 147);
  doc.text("Dados da Simulação", 22, 84);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Tipo de Habitação: ${tipoTexto}`, 22, 94);
  doc.text(`Valor de Aquisição: ${valor} €`, 22, 103);
  doc.text(`Percentagem de Financiamento: ${percentagemFinanciamento}%`, 22, 112);
  doc.text(`Valor do Financiamento: ${financiamento} €`, 22, 121);
  doc.text(`Isenção IMT Jovem: ${isencaoJovem}`, 22, 130);

  // Cartão: custos
  doc.setDrawColor(230, 230, 230);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 152, 180, 68, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 75, 147);
  doc.text("Resumo de Custos", 22, 164);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`IMT: ${imt}`, 22, 176);
  doc.text(`Imposto do Selo: ${selo}`, 22, 186);
  doc.text(`Imposto sobre Financiamento (0,6%): ${seloFinanciamento}`, 22, 196);
  doc.text(`Escritura + Registo: ${escritura}`, 22, 206);
  doc.text(`Processo Bancário: ${processo}`, 22, 216);

  // Total em destaque
  doc.setFillColor(0, 75, 147);
  doc.roundedRect(15, 233, 180, 18, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Total Estimado a Pagar: ${total}`, 22, 245);

  // Nota legal
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    NOTA_LEGAL,
    15,
    260,
    { maxWidth: 180 }
  );

  doc.save("Simulação_IMT.pdf");
});
