// renderer.js
const { jsPDF } = window.jspdf;

document.getElementById("calcular").addEventListener("click", () => {
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;

  if (isNaN(valor) || valor <= 0) {
    alert("Por favor, introduza um valor válido.");
    return;
  }

  let imt = 0, taxa = 0, abatimento = 0;

  // --- Tabelas AT 2025 (Continente) ---
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
    // Terrenos e outros imóveis urbanos
    imt = valor * 0.065; // taxa fixa 6,5% (AT 2025)
  }

  if (imt < 0) imt = 0;

  const selo = valor * 0.008;
  const total = imt + selo;

  document.getElementById("imt").textContent = imt.toFixed(2) + " €";
  document.getElementById("selo").textContent = selo.toFixed(2) + " €";
  document.getElementById("total").textContent = total.toFixed(2) + " €";
});

// --- Exportar PDF ---
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
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const logo = new Image();
  logo.src = "assets/icon.png";

  logo.onload = () => {
    // Logótipo no topo esquerdo
    doc.addImage(logo, "PNG", 40, 40, 100, 50);

    // Título logo abaixo do logótipo (alinhado à esquerda)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Simulação de IMT e Imposto do Selo", 40, 110, { align: "left" });

    // Data no canto superior direito
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Data: ${dataAtual}`, 550, 70, { align: "right" });

    // Tipo e valores
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Tipo de Habitação: ${tipoTexto}`, 50, 150);
    doc.text(`Valor de Aquisição: ${valor} €`, 50, 170);
    doc.text(`IMT: ${imt}`, 50, 190);
    doc.text(`Imposto do Selo: ${selo}`, 50, 210);
    doc.text(`Total de Impostos: ${total}`, 50, 230);

    // Nota legal
    doc.setFontSize(10);
    doc.text(
      "NOTA: A informação aqui apresentada é meramente indicativa e depende dos dados introduzidos pelo utilizador.\nPara obter cálculos finais e vinculativos deverá contactar a Autoridade Tributária e Aduaneira.",
      50,
      290,
      { maxWidth: 500 }
    );

    doc.save("Simulação_IMT.pdf");
  };
});
