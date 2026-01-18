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

  // --- Tabelas AT 2026 (atualização de 2% face a 2025) ---
  if (tipo === "habitacao_propria") {
    if (valor <= 106346) { taxa = 0; abatimento = 0; }
    else if (valor <= 145470) { taxa = 0.02; abatimento = 2126.92; }
    else if (valor <= 198347) { taxa = 0.05; abatimento = 6491.03; }
    else if (valor <= 330539) { taxa = 0.07; abatimento = 10457.97; }
    else if (valor <= 660982) { taxa = 0.08; abatimento = 13763.36; }
    else if (valor <= 1150853) { taxa = 0.06; abatimento = 0; }
    else { taxa = 0.075; abatimento = 0; }
    imt = valor * taxa - abatimento;
  } 
  else if (tipo === "secundaria") {
    if (valor <= 106346) { taxa = 0.01; abatimento = 0; }
    else if (valor <= 145470) { taxa = 0.02; abatimento = 1063.46; }
    else if (valor <= 198347) { taxa = 0.05; abatimento = 5427.57; }
    else if (valor <= 330539) { taxa = 0.07; abatimento = 9394.51; }
    else if (valor <= 660982) { taxa = 0.08; abatimento = 12699.90; }
    else if (valor <= 1150853) { taxa = 0.06; abatimento = 0; }
    else { taxa = 0.075; abatimento = 0; }
    imt = valor * taxa - abatimento;
  } 
  else if (tipo === "terrenos") {
    imt = valor * 0.065;
  }

  if (imt < 0) imt = 0;

  const selo = valor * 0.008;
  const total = imt + selo;

  document.getElementById("imt").textContent = imt.toFixed(2) + " €";
  document.getElementById("selo").textContent = selo.toFixed(2) + " €";
  document.getElementById("total").textContent = total.toFixed(2) + " €";
});

// --- Função para converter imagem para Base64 ---
function getBase64Image(imgPath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve({
        data: canvas.toDataURL("image/png"),
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => reject(new Error("Erro ao carregar imagem"));
    img.src = imgPath;
  });
}

// --- Formatar número com separador de milhares ---
function formatarNumero(num) {
  return parseFloat(num).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// --- Cores da marca ---
const cores = {
  primaria: [0, 105, 143],      // #00698F - Azul Falcão
  escura: [0, 77, 107],         // #004D6B - Azul escuro
  clara: [232, 244, 248],       // #E8F4F8 - Azul claro
  texto: [44, 62, 80],          // #2C3E50 - Texto escuro
  cinza: [108, 117, 125],       // #6C757D - Texto secundário
  branco: [255, 255, 255]
};

// --- Exportação PDF ---
document.getElementById("exportar").addEventListener("click", async () => {
  const valor = document.getElementById("valor").value;
  const tipoSelect = document.getElementById("tipo");
  const tipoTexto = tipoSelect.options[tipoSelect.selectedIndex].text;
  const imt = document.getElementById("imt").textContent.replace(" €", "");
  const selo = document.getElementById("selo").textContent.replace(" €", "");
  const total = document.getElementById("total").textContent.replace(" €", "");

  if (!valor || imt === "—") {
    alert("Por favor, realiza primeiro o cálculo.");
    return;
  }

  const dataAtual = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // --- HEADER com fundo colorido ---
  doc.setFillColor(...cores.primaria);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logótipo
  try {
    const logoData = await getBase64Image("assets/icon_branco.png");
    const logoHeight = 25;
    const logoWidth = (logoData.width / logoData.height) * logoHeight;
    doc.addImage(logoData.data, "PNG", margin, 12, logoWidth, logoHeight);
  } catch (e) {
    // Fallback: texto se o logo não carregar
    doc.setTextColor(...cores.branco);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("FALCÃO", margin, 28);
    doc.setFontSize(10);
    doc.text("Real Estate Agency", margin, 35);
  }

  // Data no header
  doc.setTextColor(...cores.branco);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(dataAtual, pageWidth - margin, 30, { align: "right" });

  // --- TÍTULO ---
  doc.setTextColor(...cores.texto);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Simulação de Impostos", margin, 70);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...cores.cinza);
  doc.text("IMT e Imposto do Selo na aquisição de imóvel", margin, 80);

  // --- Linha decorativa ---
  doc.setDrawColor(...cores.primaria);
  doc.setLineWidth(0.8);
  doc.line(margin, 88, pageWidth - margin, 88);

  // --- SECÇÃO: Dados da Simulação ---
  let yPos = 105;

  doc.setFillColor(...cores.clara);
  doc.roundedRect(margin, yPos - 8, pageWidth - (margin * 2), 35, 3, 3, "F");

  doc.setTextColor(...cores.primaria);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("DADOS DA SIMULAÇÃO", margin + 8, yPos);

  yPos += 12;
  doc.setTextColor(...cores.texto);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  // Tipo de imóvel
  doc.text("Tipo de Imóvel:", margin + 8, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(tipoTexto, margin + 50, yPos);

  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.text("Valor de Aquisição:", margin + 8, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(formatarNumero(valor) + " €", margin + 50, yPos);

  // --- SECÇÃO: Resultados ---
  yPos = 160;

  doc.setTextColor(...cores.primaria);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("IMPOSTOS CALCULADOS", margin, yPos);

  yPos += 5;
  doc.setDrawColor(...cores.primaria);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, margin + 50, yPos);

  // Tabela de resultados
  yPos += 15;
  const colLabel = margin;
  const colValue = pageWidth - margin - 40;

  // IMT
  doc.setFillColor(250, 250, 250);
  doc.rect(margin, yPos - 6, pageWidth - (margin * 2), 14, "F");
  doc.setTextColor(...cores.texto);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("IMT (Imposto Municipal sobre Transmissões)", colLabel + 5, yPos + 2);
  doc.setFont("helvetica", "bold");
  doc.text(imt + " €", colValue, yPos + 2, { align: "right" });

  yPos += 18;
  // Imposto do Selo
  doc.setFont("helvetica", "normal");
  doc.text("Imposto do Selo (0,8%)", colLabel + 5, yPos + 2);
  doc.setFont("helvetica", "bold");
  doc.text(selo + " €", colValue, yPos + 2, { align: "right" });

  // Linha separadora
  yPos += 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // TOTAL
  yPos += 15;
  doc.setFillColor(...cores.primaria);
  doc.roundedRect(margin, yPos - 8, pageWidth - (margin * 2), 18, 3, 3, "F");
  
  doc.setTextColor(...cores.branco);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL DE IMPOSTOS", colLabel + 5, yPos + 4);
  doc.setFontSize(14);
  doc.text(total + " €", colValue, yPos + 4, { align: "right" });

  // --- AVISO LEGAL (sem moldura, sem tom amarelo) ---
  const avisoY = pageHeight - 50;
  
  doc.setTextColor(...cores.cinza);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("AVISO LEGAL", margin, avisoY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  const avisoTexto = "Esta simulação é meramente indicativa e baseia-se nas tabelas de IMT em vigor. Os valores apresentados dependem dos dados introduzidos e não têm caráter vinculativo. Para obter cálculos finais e oficiais, deverá contactar a Autoridade Tributária e Aduaneira.";
  doc.text(avisoTexto, margin, avisoY + 8, { maxWidth: pageWidth - (margin * 2) });

  // --- RODAPÉ ---
  doc.setDrawColor(...cores.primaria);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

  doc.setTextColor(...cores.cinza);
  doc.setFontSize(8);
  doc.text("Documento gerado automaticamente pela Calculadora IMT | Falcão Real Estate Agency", pageWidth / 2, pageHeight - 8, { align: "center" });

  // Guardar PDF
  doc.save("Simulacao_IMT_Falcao.pdf");
});
