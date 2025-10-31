// renderer.js — Calculadora IMT v1.0
const { jsPDF } = window.jspdf;

// --- Cálculo de IMT e Imposto do Selo ---
document.getElementById("calcular").addEventListener("click", () => {
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (isNaN(valor) || valor <= 0) {
    alert("Por favor, introduza um valor válido.");
    return;
  }

  let imt = 0, taxa = 0, abatimento = 0;

  // --- Tabelas AT 2025 ---
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
    // Terrenos e outros imóveis urbanos (taxa fixa AT 2025)
    imt = valor * 0.065;
  }

  if (imt < 0) imt = 0;

  const selo = valor * 0.008;
  const total = imt + selo;

  document.getElementById("imt").textContent = imt.toFixed(2) + " €";
  document.getElementById("selo").textContent = selo.toFixed(2) + " €";
  document.getElementById("total").textContent = total.toFixed(2) + " €";
});

// --- Exportação PDF ---
document.getElementById("exportar").addEventListener("click", () => {
  const valor = document.getElementById("valor").value;
  const tipoSelect = document.getElementById("tipo");
  const tipoTexto = tipoSelect.options[tipoSelect.selectedIndex].text;
  const imt = document.getElementById("imt").textContent;
  const selo = document.getElementById("selo").textContent;
  const total = document.getElementById("total").textContent;

  if (!valor || imt === "—") {
    alert("Por favor, realiza primeiro o cálculo.");
    return;
  }

  const dataAtual = new Date().toLocaleDateString("pt-PT");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const logo = new Image();
  logo.src = "assets/icon.png";

  logo.onload = () => {
    // Cabeçalho
    doc.addImage(logo, "PNG", 15, 15, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Simulação de IMT e Imposto de Selo", 55, 30);

    // Linha separadora
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(15, 50, 195, 50);

    // Dados principais
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Tipo de Habitação: ${tipoTexto}`, 15, 65);
    doc.text(`Valor de Aquisição: ${valor} €`, 15, 75);
    doc.text(`IMT: ${imt}`, 15, 85);
    doc.text(`Imposto de Selo: ${selo}`, 15, 95);
    doc.text(`Total de Impostos: ${total}`, 15, 110);

    // Nota final
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "NOTA: A informação aqui apresentada é meramente indicativa e depende dos dados introduzidos pelo utilizador. Para obter cálculos finais e vinculativos deverá contactar a Autoridade Tributária e Aduaneira.",
      15,
      260,
      { maxWidth: 180 }
    );

    // Data no canto inferior direito
    doc.setTextColor(120);
    doc.setFontSize(9);
    doc.text(`Data: ${dataAtual}`, 195, 280, { align: "right" });

    // Guardar
    doc.save("Simulação_IMT.pdf");
  };
});
