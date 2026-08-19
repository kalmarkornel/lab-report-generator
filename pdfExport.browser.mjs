import { PROTOCOL_META } from "/work/protocolTypes.qa.mjs";

const PAGE_WIDTH = 1240;
const PAGE_HEIGHT = 1754;
const RENDER_SCALE = 2.5;
const MARGIN = 86;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_HEIGHT - 88;
const PURPLE = "#6f2cff";
const MAGENTA = "#c12cdb";
const INK = "#111111";
const MUTED = "#5f5868";
const PALE_PURPLE = "#f3edff";

function displayValue(value, unit = "") {
  const cleanValue = value?.trim();
  return cleanValue ? `${cleanValue}${unit ? ` ${unit}` : ""}` : "—";
}

function buildEnzymeSections(data) {
  const fractionNames = ["Felülúszó → áteső", "LS1", "HS", "LS2", "LIM", "HIM", "UHIM"];
  const fractionRows = fractionNames.map((name, index) => [
    name,
    index === 0 ? "-" : displayValue(data[`fraction_${index}_concentration`]),
    displayValue(data[`fraction_${index}_amount`]),
  ]);

  const laneNumbers = Array.from({ length: 15 }, (_, index) => String(index + 1));
  const laneValues = Array.from({ length: 15 }, (_, index) => data[`lane_${index + 1}`]?.trim() || "");

  return [
    {
      title: "Alapadatok",
      rows: [
        { label: "Dátum", value: displayValue(data.date) },
        { label: "Hallgató neve", value: displayValue(data.studentName) },
        { label: "Enzim neve", value: displayValue(data.enzymeName) },
      ],
    },
    {
      title: "Fermentáció információi",
      rows: [
        { label: "Fermentáció leírása", value: displayValue(data.fermentationInfo) },
        { label: "Centrifugálás", value: displayValue(data.fermentationCentrifugeG, "G") },
        { label: "Idő", value: displayValue(data.fermentationCentrifugeTime, "perc") },
        { label: "Hőmérséklet", value: displayValue(data.fermentationCentrifugeTemp, "°C") },
      ],
    },
    {
      title: "Feltáró puffer",
      rows: [
        { label: "Felhasznált mennyiség", value: displayValue(data.lysisBufferTotal, "ml") },
        { label: "Lízispuffer (1×)", value: displayValue(data.lysisBuffer) },
        { label: "PMSF", value: displayValue(data.pmsf) },
        { label: "BA", value: displayValue(data.ba) },
        { label: "TCEP", value: displayValue(data.tcep) },
        { label: "DNáz", value: displayValue(data.dnase) },
      ],
    },
    {
      title: "Sejtfeltárás",
      rows: [
        { label: "Készülék típusa", value: "Bandelin Sonoplus HD 4000" },
        { label: "Intenzitás", value: displayValue(data.sonicationIntensity, "%") },
        { label: "Idő", value: displayValue(data.sonicationTime, "perc") },
        { label: "Program – bekapcsolva", value: displayValue(data.sonicationOn, "s on") },
        { label: "Program – kikapcsolva", value: displayValue(data.sonicationOff, "s off") },
        { label: "Centrifugálás", value: displayValue(data.lysisCentrifugeG, "G") },
        { label: "Centrifugálás ideje", value: displayValue(data.lysisCentrifugeTime, "perc") },
        { label: "Hőmérséklet", value: displayValue(data.lysisCentrifugeTemp, "°C") },
      ],
    },
    {
      title: "Ni-NTA tisztítás",
      rows: [
        { label: "Gyanta mennyisége", value: displayValue(data.resinAmount, data.resinUnit || "g") },
      ],
      tables: [
        {
          headers: ["Frakció", "Koncentráció (elkészített)", "Felhasznált mennyiség"],
          rows: fractionRows,
          columnWidths: [270, 399, 399],
          centered: true,
        },
      ],
      notes: [
        {
          paragraphs: [
            "Ni-NTA oszlop tárolása 20%-os EtOH-ban történik. A használat előtt deszt. vízzel és LS-sel mosni kell.",
            "Használat után deszt. vízzel és 20%-os EtOH-val mossuk és feleslegben tesszük el.",
          ],
        },
        {
          tone: "magenta",
          paragraphs: [
            "Az LS (50 mM HEPES, 50 mM NaCl) és HS (50 mM HEPES, 150 mM NaCl) pufferekből 10x töménységű van, ezeket hígítani szükséges 1x töménységre használat előtt.",
            "A LIM és HIM pufferek az enzimtisztításhoz megfelelő imidazol koncentrációt tartalmazzák, melyet az 1 M (UHIM) törzsoldatból hígítunk az 1x LS puffer segítségével.",
            "A fehérjemennyiséget Bradford teszttel követjük: 10 μl (5x hígított) Bradford reagens + 2,5 μl minta.",
          ],
        },
      ],
    },
    {
      title: "SDS-PAGE",
      tablesBeforeRows: [
        {
          title: "Mintafelviteli sorrend a gélre",
          headers: laneNumbers,
          rows: [laneValues],
          columnWidths: Array.from({ length: 15 }, () => CONTENT_WIDTH / 15),
          compact: true,
          centered: true,
          rounded: true,
          boldBody: true,
          bodyFill: "#faf7ff",
        },
      ],
      rows: [
        { label: "Gélfuttatás – feszültség", value: displayValue(data.gelVoltage, "V") },
        { label: "Gélfuttatás – idő", value: displayValue(data.gelTime, "perc") },
      ],
      notes: [
        {
          paragraphs: [
            "Mintakészítés: 10 μl minta + 20 μl mintakoktél, 95 °C-on 5 perc inkubálás.",
            "Mintakoktél: 250 mM TrisHCl pH 6,8, 10% SDS, 10% DTT, 50% glicerin, 0,05% brómfenolkék. A DTT-t használat előtt adjuk hozzá, vagy amennyiben az elmúlt 1 hónapban lett a mixhez adva DTT, akkor az úgy még felhasználható.",
            "10-es gélen 10 μl mintát (a tisztított frakciókból), míg 15-ös gélre 5 μl mintát viszünk fel. A markerből, pelletből, lizátumból, átesőből 3 μl elegendő.",
          ],
        },
      ],
    },
    {
      title: "Puffercsere",
      rows: [
        { label: "Oszlopra felvitt minta", value: displayValue(data.desaltingSampleAmount, "ml") },
        { label: "Oszlopra felvitt puffer", value: displayValue(data.desaltingBufferAmount, "ml") },
        { label: "Puffer összetétele", value: displayValue(data.desaltingBufferComposition) },
      ],
    },
    {
      title: "Töményítés",
      rows: [
        { label: "Használt ultracentrifuga töményítő cső", value: displayValue(data.concentratorTube) },
        { label: "Centrifugálás", value: displayValue(data.concentrationG, "G") },
        { label: "Idő", value: displayValue(data.concentrationTime, "perc") },
        { label: "Hőmérséklet", value: displayValue(data.concentrationTemp, "°C") },
      ],
    },
    {
      title: "Fehérjekoncentráció meghatározása",
      rows: [
        { label: "E1% (extinkciós koefficiens)", value: displayValue(data.extinctionCoefficient) },
        { label: "Fehérjekoncentráció", value: displayValue(data.proteinConcentration, "mg/ml") },
        { label: "Expressziós termelés", value: displayValue(data.expressionYield, "mg/l fermentlé") },
      ],
    },
    {
      title: "Tárolás",
      rows: [
        { label: "Additívek", value: displayValue(data.storageAdditives) },
        { label: "Hely", value: displayValue(data.storageLocation) },
        { label: "Jelzések", value: displayValue(data.storageLabels) },
        { label: "Adagok", value: displayValue(data.storageAliquots) },
      ],
    },
  ];
}

function yesNo(value) {
  return value === "Igen" ? "Igen" : "Nem";
}

function buildElectrospinningSections(data) {
  return [
    {
      title: "Alapadatok",
      rows: [
        { label: "Dátum", value: displayValue(data.date) },
        { label: "Hallgató neve", value: displayValue(data.studentName) },
        { label: "Mérés célja", value: displayValue(data.measurementGoal) },
      ],
    },
    {
      title: "Mérés során használt paraméterek",
      rows: [
        { label: "Elmentett projekt neve / elérési útja", value: displayValue(data.projectPath) },
        { label: "Szálképző berendezés típusa", value: displayValue(data.electroEquipment) },
        { label: "Szálképzés iránya", value: displayValue(data.electroDirection) },
      ],
    },
    {
      title: "Oldat paraméterek",
      tablesBeforeRows: [{
        headers: ["Polimer típusa(i)", "Oldószer típusa(i)", "Molekulatömeg [kDa]", "Koncentráció [%]", "Enzimtartalom"],
        rows: [[
          displayValue(data.electroPolymer), displayValue(data.electroSolvent), displayValue(data.electroMolecularWeight),
          displayValue(data.electroConcentration), displayValue(data.electroEnzymeContent),
        ]],
        columnWidths: [224, 224, 210, 205, 205],
        compact: true,
        centered: true,
      }],
      rows: [
        { label: "Polimerek aránya (ha releváns)", value: displayValue(data.electroPolymerRatio) },
        { label: "Oldószerek aránya (ha releváns)", value: displayValue(data.electroSolventRatio) },
        { label: "Oldat viszkozitása (ha ismert)", value: displayValue(data.electroViscosity) },
      ],
    },
    {
      title: "Műveleti paraméterek",
      startOnNewPage: true,
      rows: [
        { label: "Kollektor típusa", value: displayValue(data.electroCollectorType) },
        { label: "Gyűjtőfelület anyaga", value: displayValue(data.electroCollectorSurface) },
        { label: "Emitter típusa", value: displayValue(data.electroEmitterType) },
        { label: "Forgási sebesség (ha releváns)", value: displayValue(data.electroRotationSpeed, "rpm") },
      ],
      tables: [{
        headers: ["Feszültség [kV]", "Adagolási sebesség [ml/h]", "Adagolt oldat [ml]", "TCD [cm]", "Emitter átmérő [G]", "Időtartam [perc]"],
        rows: [[
          displayValue(data.electroVoltage), displayValue(data.electroFeedRate), displayValue(data.electroDispensedVolume),
          displayValue(data.electroDistance), displayValue(data.electroEmitterDiameter), displayValue(data.electroDuration),
        ]],
        columnWidths: [170, 205, 183, 160, 180, 170],
        compact: true,
        centered: true,
      }],
    },
    {
      title: "Környezeti paraméterek",
      rows: [
        { label: "Hőmérséklet", value: displayValue(data.electroTemperature, "°C") },
        { label: "Páratartalom", value: displayValue(data.electroHumidity, "%") },
      ],
    },
  ];
}

function buildZetasizerSections(data) {
  return [
    {
      title: "Alapadatok",
      rows: [
        { label: "Dátum", value: displayValue(data.date) },
        { label: "Hallgató neve", value: displayValue(data.studentName) },
        { label: "Mérés célja", value: displayValue(data.measurementGoal) },
      ],
    },
    {
      title: "Mérés során használt paraméterek",
      rows: [
        { label: "Elmentett projekt neve / elérési útja", value: displayValue(data.projectPath) },
        { label: "Size mérés", value: yesNo(data.zetaModeSize) },
        { label: "Zeta mérés", value: yesNo(data.zetaModeZeta) },
      ],
    },
    {
      title: "Oldat paraméterek",
      tables: [{
        headers: ["Koncentráció [mg/ml]", "Felhasznált térfogat [µl]", "Beállított anyag", "Beállított oldószer"],
        rows: [[
          displayValue(data.zetaConcentration), displayValue(data.zetaVolume), displayValue(data.zetaMaterial), displayValue(data.zetaSolvent),
        ]],
        columnWidths: [267, 267, 267, 267],
        centered: true,
      }],
    },
    {
      title: "Mérési paraméterek",
      tables: [{
        headers: ["Mit mértünk?", "Hőmérséklet [°C]", "Ismétlések száma", "Megjegyzés / egyéb változtatott paraméter"],
        rows: [0, 1].map((index) => [
          displayValue(data[`zetaMeasure${index}What`]), displayValue(data[`zetaMeasure${index}Temperature`]),
          displayValue(data[`zetaMeasure${index}Repeats`]), displayValue(data[`zetaMeasure${index}Notes`]),
        ]),
        columnWidths: [260, 230, 210, 368],
        centered: true,
      }],
    },
  ];
}

function buildPlatereaderSections(data) {
  const materials = Array.from({ length: 9 }, (_, index) => [
    String(index + 1), displayValue(data[`plateMaterial${index}Name`]), displayValue(data[`plateMaterial${index}Concentration`]),
    displayValue(data[`plateMaterial${index}Mass`]), displayValue(data[`plateMaterial${index}Volume`]),
  ]);
  materials.push(["Σ", "Összesen", "–", "–", "–"]);
  const plateColumns = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const plateRows = Array.from({ length: 8 }, (_, rowIndex) => {
    const rowName = String.fromCharCode(65 + rowIndex);
    return [rowName, ...plateColumns.map((column) => data[`plate${rowName}${column}`]?.trim() || "")];
  });

  return [
    {
      title: "Alapadatok",
      rows: [
        { label: "Dátum", value: displayValue(data.date) },
        { label: "Hallgató neve", value: displayValue(data.studentName) },
        { label: "Mérés célja", value: displayValue(data.measurementGoal) },
        { label: "Elmentett eredmények fájlneve / elérési útja", value: displayValue(data.projectPath) },
      ],
    },
    {
      title: "Reakció sematikus ábrája",
      notes: [{ paragraphs: [displayValue(data.plateReaction)] }],
    },
    {
      title: "Felhasznált anyagok és oldatok",
      startOnNewPage: true,
      tablesBeforeRows: [{
        headers: ["#", "Név", "c [mg/ml]", "m [mg]", "V [ml]"],
        rows: materials,
        columnWidths: [72, 408, 196, 196, 196],
        compact: true,
        centered: true,
        boldFirstColumn: true,
      }],
      rows: [{ label: "Megjegyzések", value: displayValue(data.plateMaterialsNotes) }],
    },
    {
      title: "Mérés menetének leírása",
      notes: [{ paragraphs: [displayValue(data.plateSteps)] }],
    },
    {
      title: "Mérési paraméterek",
      rows: [
        { label: "Plate típusa", value: displayValue(data.plateType) },
        { label: "Elmentett protokoll neve / elérési útja", value: displayValue(data.plateProtocolPath) },
        { label: "Mérés típusa", value: displayValue(data.plateMeasurementType) },
        { label: "Hullámhossztartomány / hullámhossz", value: displayValue(data.plateWavelength) },
        { label: "Hőmérséklet", value: displayValue(data.plateTemperature, "°C") },
        { label: "Inkubáció szükséges", value: yesNo(data.plateIncubationRequired) },
        { label: "Kinetikus ciklusok száma", value: displayValue(data.plateKineticLoops) },
        { label: "Rázás", value: displayValue(data.plateShaking) },
        { label: "Bemért térfogatok (ΣV/well)", value: displayValue(data.plateWellVolume) },
      ],
    },
    {
      title: "Plate elrendezés",
      tables: [{
        headers: ["", ...plateColumns],
        rows: plateRows,
        columnWidths: [60, ...Array.from({ length: 12 }, () => 84)],
        compact: true,
        tiny: true,
        centered: true,
        rounded: true,
        boldFirstColumn: true,
      }],
    },
    {
      title: "Megfigyelések",
      notes: [{ paragraphs: [displayValue(data.plateObservations)] }],
    },
  ];
}

function buildSections(protocol, data) {
  if (protocol === "electrospinning") return buildElectrospinningSections(data);
  if (protocol === "platereader") return buildPlatereaderSections(data);
  if (protocol === "zetasizer") return buildZetasizerSections(data);
  return buildEnzymeSections(data);
}

function createPage() {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_WIDTH * RENDER_SCALE;
  canvas.height = PAGE_HEIGHT * RENDER_SCALE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("A PDF rajzfelülete nem hozható létre.");
  context.scale(RENDER_SCALE, RENDER_SCALE);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.textBaseline = "top";
  return { canvas, context };
}

function wrapText(context, text, maxWidth) {
  const lines = [];
  const paragraphs = text.replace(/\r/g, "").split("\n");
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }
    let line = words[0];
    for (const word of words.slice(1)) {
      const candidate = `${line} ${word}`;
      if (context.measureText(candidate).width <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

function drawLines(
  context,
  lines,
  x,
  y,
  lineHeight,
) {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener("error", () => reject(new Error("A kép nem tölthető be.")), { once: true });
    image.src = source;
  });
}

async function canvasesToPdf(pages) {
  const { PDFDocument } = await import("/app/vendor/pdf-lib.js");
  const pngPages = [];
  for (const { canvas, context } of pages) {
    context.getImageData(0, 0, 1, 1);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((result) => result ? resolve(result) : reject(new Error("A PDF-oldal nem készíthető el.")), "image/png");
    });
    pngPages.push(new Uint8Array(await blob.arrayBuffer()));
  }

  const pdfDocument = await PDFDocument.create();
  for (const pngBytes of pngPages) {
    const embeddedPage = await pdfDocument.embedPng(pngBytes);
    const pdfPage = pdfDocument.addPage([595.28, 841.89]);
    pdfPage.drawImage(embeddedPage, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  return pdfDocument.save();
}

export async function createProtocolPdfBytes(
  protocol,
  data,
  logoSource,
  photoSource,
) {
  const logo = await loadImage(logoSource);
  const pages = [];
  let page = createPage();
  pages.push(page);
  let y = MARGIN + 174;

  const drawPageHeader = (surface) => {
    const { context } = surface;
    const top = MARGIN;
    context.fillStyle = INK;
    context.font = "700 48px Arial, sans-serif";
    context.fillText(PROTOCOL_META[protocol].pdfTitle, MARGIN, top);
    context.font = "400 23px Arial, sans-serif";
    context.fillStyle = MUTED;
    context.fillText("NanoBioTech Research Group", MARGIN, top + 64);
    const logoWidth = 250;
    const logoHeight = logoWidth * (logo.height / logo.width);
    context.drawImage(logo, PAGE_WIDTH - MARGIN - logoWidth, top - 28, logoWidth, logoHeight);
    context.fillStyle = PURPLE;
    context.fillRect(MARGIN, top + 132, CONTENT_WIDTH, 7);
  };

  drawPageHeader(page);

  const newPage = () => {
    page = createPage();
    pages.push(page);
    y = MARGIN;
  };

  const ensureSpace = (height) => {
    if (y + height > CONTENT_BOTTOM) newPage();
  };

  const drawSectionTitle = (title) => {
    ensureSpace(150);
    const { context } = page;
    context.fillStyle = PALE_PURPLE;
    context.fillRect(MARGIN, y, CONTENT_WIDTH, 58);
    context.fillStyle = PURPLE;
    context.fillRect(MARGIN, y, 9, 58);
    context.font = "700 29px Arial, sans-serif";
    context.fillStyle = INK;
    context.fillText(title, MARGIN + 27, y + 13);
    y += 76;
  };

  const drawRow = ({ label, value }) => {
    const measureContext = page.context;
    const labelWidth = 365;
    const valueX = MARGIN + labelWidth + 34;
    const valueWidth = CONTENT_WIDTH - labelWidth - 34;
    measureContext.font = "700 22px Arial, sans-serif";
    const labelLines = wrapText(measureContext, label, labelWidth);
    measureContext.font = "400 24px Arial, sans-serif";
    const valueLines = wrapText(measureContext, value, valueWidth);
    const lineCount = Math.max(labelLines.length, valueLines.length);
    const rowHeight = Math.max(58, lineCount * 31 + 25);
    ensureSpace(rowHeight);

    const { context } = page;
    context.fillStyle = INK;
    context.font = "700 22px Arial, sans-serif";
    drawLines(context, labelLines, MARGIN, y + 11, 31);
    context.font = "400 24px Arial, sans-serif";
    drawLines(context, valueLines, valueX, y + 9, 31);
    context.strokeStyle = "#ddd6e7";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(MARGIN, y + rowHeight - 8);
    context.lineTo(MARGIN + CONTENT_WIDTH, y + rowHeight - 8);
    context.stroke();
    y += rowHeight;
  };

  const drawNote = ({ paragraphs, tone = "purple" }) => {
    const measureContext = page.context;
    measureContext.font = "400 21px Arial, sans-serif";
    const paragraphLines = paragraphs.map((paragraph) => wrapText(measureContext, paragraph, CONTENT_WIDTH - 58));
    const height = paragraphLines.reduce((total, lines) => total + lines.length * 29, 0)
      + Math.max(0, paragraphLines.length - 1) * 18
      + 38;
    ensureSpace(height + 10);
    const { context } = page;
    context.font = "400 21px Arial, sans-serif";
    context.fillStyle = tone === "magenta" ? "#faeffd" : PALE_PURPLE;
    context.fillRect(MARGIN, y, CONTENT_WIDTH, height);
    context.fillStyle = tone === "magenta" ? MAGENTA : PURPLE;
    context.fillRect(MARGIN, y, 5, height);
    context.fillStyle = INK;
    let paragraphY = y + 19;
    paragraphLines.forEach((lines, index) => {
      drawLines(context, lines, MARGIN + 29, paragraphY, 29);
      paragraphY += lines.length * 29;
      if (index < paragraphLines.length - 1) paragraphY += 18;
    });
    y += height + 12;
  };

  const drawTable = ({
    title,
    headers,
    rows,
    columnWidths,
    compact = false,
    centered = false,
    rounded = false,
    boldBody = false,
    bodyFill,
    tiny = false,
    boldFirstColumn = false,
  }) => {
    const measureContext = page.context;
    const headerFontSize = tiny ? 14 : compact ? 17 : 18;
    const bodyFontSize = tiny ? 14 : compact ? 17 : 19;
    const lineHeight = tiny ? 19 : compact ? 23 : 25;
    const horizontalPadding = tiny ? 4 : compact ? 6 : 16;
    const measureRow = (cells, isHeader) => {
      measureContext.font = `${isHeader || boldBody ? "700" : "400"} ${isHeader ? headerFontSize : bodyFontSize}px Arial, sans-serif`;
      const lineCounts = cells.map((cell, index) =>
        wrapText(measureContext, cell, columnWidths[index] - horizontalPadding * 2).length,
      );
      return Math.max(isHeader ? (tiny ? 42 : compact ? 52 : 54) : (tiny ? 42 : compact ? 68 : 48), Math.max(...lineCounts) * lineHeight + (tiny ? 14 : 22));
    };

    const captionHeight = title ? 43 : 0;
    const headerHeight = measureRow(headers, true);
    const rowHeights = rows.map((row) => measureRow(row, false));
    const totalHeight = captionHeight + headerHeight + rowHeights.reduce((sum, height) => sum + height, 0);
    ensureSpace(totalHeight + 18);

    const { context } = page;
    if (title) {
      context.fillStyle = INK;
      context.font = "700 22px Arial, sans-serif";
      context.fillText(title, MARGIN, y + 2);
      y += captionHeight;
    }

    const tableTop = y;
    const gridHeight = headerHeight + rowHeights.reduce((sum, height) => sum + height, 0);
    if (rounded) {
      context.save();
      context.beginPath();
      context.roundRect(MARGIN, tableTop, CONTENT_WIDTH, gridHeight, 16);
      context.clip();
    }

    const drawTableRow = (cells, rowHeight, isHeader, rowIndex = 0) => {
      let x = MARGIN;
      cells.forEach((cell, columnIndex) => {
        const cellWidth = columnWidths[columnIndex];
        context.fillStyle = isHeader
          ? PALE_PURPLE
          : bodyFill || (rowIndex % 2 === 0 ? "#ffffff" : "#fcfaff");
        context.fillRect(x, y, cellWidth, rowHeight);
        context.strokeStyle = "#d9cfe6";
        context.lineWidth = 1.5;
        context.strokeRect(x, y, cellWidth, rowHeight);
        context.fillStyle = INK;
        context.font = `${isHeader || boldBody || (boldFirstColumn && columnIndex === 0) || (headers.length === 3 && columnIndex === 0) ? "700" : "400"} ${isHeader ? headerFontSize : bodyFontSize}px Arial, sans-serif`;
        const lines = wrapText(context, cell, cellWidth - horizontalPadding * 2);
        if (centered) {
          const fontSize = isHeader ? headerFontSize : bodyFontSize;
          const textBlockHeight = lines.length
            ? (lines.length - 1) * lineHeight + fontSize
            : 0;
          const textTop = y + (rowHeight - textBlockHeight) / 2;
          lines.forEach((line, lineIndex) => {
            const textWidth = context.measureText(line).width;
            context.fillText(line, x + (cellWidth - textWidth) / 2, textTop + lineIndex * lineHeight);
          });
        } else {
          drawLines(context, lines, x + horizontalPadding, y + 11, lineHeight);
        }
        x += cellWidth;
      });
      y += rowHeight;
    };

    drawTableRow(headers, headerHeight, true);
    rows.forEach((row, index) => drawTableRow(row, rowHeights[index], false, index));
    if (rounded) {
      context.restore();
      context.strokeStyle = "#d9cfe6";
      context.lineWidth = 1.5;
      context.beginPath();
      context.roundRect(MARGIN, tableTop, CONTENT_WIDTH, gridHeight, 16);
      context.stroke();
    }
    y += 16;
  };

  for (const section of buildSections(protocol, data)) {
    if (section.startOnNewPage && y > MARGIN) newPage();
    drawSectionTitle(section.title);
    section.tablesBeforeRows?.forEach(drawTable);
    section.rows?.forEach(drawRow);
    section.tables?.forEach(drawTable);
    section.notes?.forEach(drawNote);
    y += 16;
  }

  if (photoSource) {
    const photo = await loadImage(photoSource);
    const maxWidth = 760;
    const maxHeight = 520;
    const ratio = Math.min(maxWidth / photo.width, maxHeight / photo.height, 1);
    const width = photo.width * ratio;
    const height = photo.height * ratio;
    ensureSpace(height + 86);
    page.context.font = "700 22px Arial, sans-serif";
    page.context.fillStyle = INK;
    page.context.fillText("Feltöltött tárolási fénykép", MARGIN, y);
    y += 44;
    page.context.drawImage(photo, MARGIN, y, width, height);
    y += height + 20;
  }

  pages.forEach((surface, index) => {
    const { context } = surface;
    context.font = "400 18px Arial, sans-serif";
    context.fillStyle = MUTED;
    context.fillText(`NanoBioTech • ${PROTOCOL_META[protocol].title} • ${index + 1}/${pages.length}`, MARGIN, PAGE_HEIGHT - 54);
    context.fillStyle = index % 2 === 0 ? PURPLE : MAGENTA;
    context.fillRect(PAGE_WIDTH - MARGIN - 72, PAGE_HEIGHT - 50, 72, 5);
  });

  return canvasesToPdf(pages);
}

export async function downloadProtocolPdf(
  protocol,
  data,
  logoSource,
  photoSource,
  previewWindow,
) {
  const pdfBytes = await createProtocolPdfBytes(protocol, data, logoSource, photoSource);
  const pdfBlob = new Blob([pdfBytes.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(pdfBlob);
  const filePart = (value, fallback) =>
    (value?.trim() || fallback).replace(/[^a-zA-Z0-9áéíóöőúüűÁÉÍÓÖŐÚÜŰ_-]+/g, "-");
  const protocolPart = protocol === "enzyme" && data.enzymeName
    ? filePart(data.enzymeName, PROTOCOL_META[protocol].slug)
    : PROTOCOL_META[protocol].slug;
  const filename = `${filePart(data.studentName, "hallgato")}_${protocolPart}_${filePart(data.date, "jegyzokonyv")}.pdf`;
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (previewWindow && !previewWindow.closed) {
    previewWindow.location.replace(url);
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 300_000);
}
