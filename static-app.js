import { downloadProtocolPdf } from "/work/pdfExport.browser.mjs";

const logo = "/public/nanobio-logo.png";
const meta = {
  enzyme: { title: "Enzimtisztítás", sections: [["basic","Alapadatok"],["fermentation","Fermentáció"],["lysis-buffer","Feltáró puffer"],["cell-lysis","Sejtfeltárás"],["ni-nta","Ni-NTA tisztítás"],["sds-page","SDS-PAGE"],["buffer-exchange","Puffercsere"],["concentration","Töményítés"],["protein","Fehérjekoncentráció"],["storage","Tárolás"]] },
  electrospinning: { title: "Electrospinning", sections: [["basic","Alapadatok"],["electro-equipment","Berendezés"],["electro-solution","Oldat paraméterek"],["electro-process","Műveleti paraméterek"],["electro-environment","Környezeti paraméterek"]] },
  platereader: { title: "Platereader", sections: [["basic","Alapadatok"],["plate-reaction","Reakció"],["plate-materials","Anyagok és oldatok"],["plate-steps","Mérés menete"],["plate-settings","Mérési paraméterek"],["plate-layout","Plate elrendezés"],["plate-observations","Megfigyelések"]] },
  zetasizer: { title: "Zetasizer", sections: [["basic","Alapadatok"],["zeta-settings","Mérés beállításai"],["zeta-solution","Oldat paraméterek"],["zeta-measurements","Mérési paraméterek"]] },
};

let active = "enzyme";
let status = "clean";
let closed = false;
let photoSource = "";

const input = (label, name, type = "text", extra = "") => `<label>${label}<input name="${name}" type="${type}" ${extra}></label>`;
const textarea = (label, name, rows = 4, extra = "") => `<label ${extra}>${label}<textarea name="${name}" rows="${rows}"></textarea></label>`;
const unit = (label, name, suffix) => `<label>${label}<span class="input-with-unit"><input name="${name}" type="number" step="any"><em>${suffix}</em></span></label>`;
const select = (label, name, choices) => `<label>${label}<select name="${name}"><option value="">Válassz…</option>${choices.map((choice) => `<option>${choice}</option>`).join("")}</select></label>`;
const section = (id, title, body) => `<details class="form-section" id="${id}" open><summary class="section-heading"><div><h3>${title}</h3></div><span class="chevron">⌄</span></summary><div class="section-content">${body}</div></details>`;
const common = (third = "") => section("basic", "Alapadatok", `<div class="field-grid ${third ? "three-columns" : "two-columns"}">${input("Dátum","date","date","required")}${input("Hallgató neve","studentName","text","required")}${third}${third ? "" : textarea("Mérés célja","measurementGoal",4,'class="full-span"')}</div>`);

function enzymeForm() {
  const fractions = ["Felülúszó → áteső","LS1","HS","LS2","LIM","HIM","UHIM"].map((name,index) => `<tr><th>${name}</th><td>${index ? `<input name="fraction_${index}_concentration" aria-label="${name} koncentráció">` : "–"}</td><td><input name="fraction_${index}_amount" aria-label="${name} mennyiség"></td></tr>`).join("");
  const lanes = Array.from({length:15},(_,index) => `<label><span>${index+1}</span><input name="lane_${index+1}" aria-label="${index+1}. gélhely"></label>`).join("");
  return common(input("Enzim neve","enzymeName","text","required")) +
    section("fermentation","Fermentáció információi",`${textarea("Fermentáció leírása","fermentationInfo",5)}<div class="field-grid three-columns top-gap">${unit("Centrifugálás","fermentationCentrifugeG","G")}${unit("Idő","fermentationCentrifugeTime","perc")}${unit("Hőmérséklet","fermentationCentrifugeTemp","°C")}</div>`) +
    section("lysis-buffer","Feltáró puffer",`<div class="field-stack">${unit("Felhasznált mennyiség","lysisBufferTotal","ml")}${input("Lízispuffer (1×)","lysisBuffer")}${input("PMSF","pmsf")}${input("BA","ba")}${input("TCEP","tcep")}${input("DNáz","dnase")}</div>`) +
    section("cell-lysis","Sejtfeltárás",`<p class="device-note"><strong>Készülék típusa:</strong> Bandelin Sonoplus HD 4000</p><div class="field-grid four-columns">${unit("Intenzitás","sonicationIntensity","%")}${unit("Idő","sonicationTime","perc")}${unit("Program – bekapcsolva","sonicationOn","s on")}${unit("Program – kikapcsolva","sonicationOff","s off")}</div><div class="field-grid three-columns top-gap">${unit("Centrifugálás","lysisCentrifugeG","G")}${unit("Idő","lysisCentrifugeTime","perc")}${unit("Hőmérséklet","lysisCentrifugeTemp","°C")}</div>`) +
    section("ni-nta","Ni-NTA tisztítás",`<label class="narrow-field">Gyanta mennyisége<span class="amount-select"><input name="resinAmount" inputmode="decimal" placeholder="1,0"><select name="resinUnit"><option>g</option><option>mg</option></select></span></label><div class="table-wrap top-gap"><table><thead><tr><th>Frakció</th><th>Koncentráció (elkészített)</th><th>Felhasznált mennyiség</th></tr></thead><tbody>${fractions}</tbody></table></div><div class="protocol-note"><p>Ni-NTA oszlop tárolása 20%-os EtOH-ban történik. A használat előtt deszt. vízzel és LS-sel mosni kell.</p><p>Használat után deszt. vízzel és 20%-os EtOH-val mossuk és feleslegben tesszük el.</p></div><div class="protocol-note muted-note"><p>Az LS (50 mM HEPES, 50 mM NaCl) és HS (50 mM HEPES, 150 mM NaCl) pufferekből 10x töménységű van, ezeket hígítani szükséges 1x töménységre használat előtt.</p><p>A LIM és HIM pufferek az enzimtisztításhoz megfelelő imidazol koncentrációt tartalmazzák.</p><p>A fehérjemennyiséget Bradford teszttel követjük: 10 μl (5x hígított) Bradford reagens + 2,5 μl minta.</p></div>`) +
    section("sds-page","SDS-PAGE",`<div class="protocol-note"><p><strong>Mintakészítés:</strong> 10 μl minta + 20 μl mintakoktél, 95 °C-on 5 perc inkubálás.</p><p>Mintakoktél: 250 mM TrisHCl pH 6,8, 10% SDS, 10% DTT, 50% glicerin, 0,05% brómfenolkék.</p><p>10-es gélen 10 μl mintát, 15-ös gélre 5 μl mintát viszünk fel.</p></div><label class="top-gap">Mintafelviteli sorrend a gélre</label><div class="lane-grid">${lanes}</div><h4 class="subsection-title">Gélfuttatás</h4><div class="field-grid two-columns">${unit("Feszültség","gelVoltage","V")}${unit("Idő","gelTime","perc")}</div>`) +
    section("buffer-exchange","Puffercsere",`<div class="field-grid two-columns">${unit("Oszlopra felvitt minta mennyisége","desaltingSampleAmount","ml")}${unit("Oszlopra felvitt puffer mennyisége","desaltingBufferAmount","ml")}${textarea("Puffer összetétele","desaltingBufferComposition",3,'class="full-span"')}</div>`) +
    section("concentration","Töményítés",`${input("Használt ultracentrifuga töményítő cső (molekulatömeg feltüntetése)","concentratorTube")}<div class="field-grid three-columns top-gap">${unit("Centrifugálás","concentrationG","G")}${unit("Idő","concentrationTime","perc")}${unit("Hőmérséklet","concentrationTemp","°C")}</div>`) +
    section("protein","Fehérjekoncentráció meghatározása",`<div class="field-grid three-columns">${input("E1% (extinkciós koefficiens)","extinctionCoefficient","number","step=any")}${unit("Fehérjekoncentráció","proteinConcentration","mg/ml")}${unit("Expressziós termelés","expressionYield","mg/l fermentlé")}</div>`) +
    section("storage","Tárolás",`<div class="field-grid two-columns">${input("Additívek","storageAdditives")}${input("Hely","storageLocation")}${input("Jelzések","storageLabels")}${input("Adagok","storageAliquots")}<div class="photo-upload full-span"><label>Fénykép feltöltése <span>(opcionális)</span></label><input id="storagePhoto" type="file" accept="image/*"><div id="photoPreview"></div></div></div>`);
}

function electroForm() {
  const processNames = [["electroVoltage","Feszültség [kV]"],["electroFeedRate","Adagolási sebesség [ml/h]"],["electroDispensedVolume","Adagolt oldat [ml]"],["electroDistance","TCD [cm]"],["electroEmitterDiameter","Emitter átmérő [G]"],["electroDuration","Időtartam [perc]"]];
  return common() + section("electro-equipment","Mérés során használt paraméterek",`<div class="field-grid two-columns">${input("Elmentett projekt neve / elérési útja","projectPath","text",'class="full-span"')}${select("Szálképző berendezés típusa","electroEquipment",["R2","SpinCube","SpinCube BASE"])}${select("Szálképzés iránya","electroDirection",["Horizontális","Vertikális","Near-field"])}</div>`) +
    section("electro-solution","Oldat paraméterek",`<div class="table-wrap wide-table"><table><thead><tr><th>Polimer típusa(i)</th><th>Oldószer típusa(i)</th><th>Molekulatömeg [kDa]</th><th>Koncentráció [%]</th><th>Enzimtartalom</th></tr></thead><tbody><tr>${["electroPolymer","electroSolvent","electroMolecularWeight","electroConcentration","electroEnzymeContent"].map(name=>`<td><input name="${name}"></td>`).join("")}</tr></tbody></table></div><div class="field-grid three-columns top-gap">${input("Polimerek aránya (ha releváns)","electroPolymerRatio")}${input("Oldószerek aránya (ha releváns)","electroSolventRatio")}${input("Oldat viszkozitása (ha ismert)","electroViscosity")}</div>`) +
    section("electro-process","Műveleti paraméterek",`<div class="field-grid four-columns">${select("Kollektor típusa","electroCollectorType",["Sík","Forgó"])}${select("Gyűjtőfelület anyaga","electroCollectorSurface",["Alufólia","Sütőpapír","Kollektor lemez"])}${select("Emitter típusa","electroEmitterType",["Egytűs","Koaxiális"])}${unit("Forgási sebesség","electroRotationSpeed","rpm")}</div><div class="table-wrap wide-table top-gap"><table><thead><tr>${processNames.map(([,label])=>`<th>${label}</th>`).join("")}</tr></thead><tbody><tr>${processNames.map(([name])=>`<td><input name="${name}" type="number" step="any"></td>`).join("")}</tr></tbody></table></div>`) +
    section("electro-environment","Környezeti paraméterek",`<div class="field-grid two-columns">${unit("Hőmérséklet","electroTemperature","°C")}${unit("Páratartalom","electroHumidity","%")}</div>`);
}

function zetaForm() {
  return common() + section("zeta-settings","Mérés során használt paraméterek",`${input("Elmentett projekt neve / elérési útja","projectPath")}<div class="check-row top-gap"><label><input name="zetaModeSize" type="checkbox" value="Igen"> Size</label><label><input name="zetaModeZeta" type="checkbox" value="Igen"> Zeta</label></div>`) +
    section("zeta-solution","Oldat paraméterek",`<div class="table-wrap wide-table"><table><thead><tr><th>Koncentráció [mg/ml]</th><th>Felhasznált térfogat [µl]</th><th>Beállított anyag</th><th>Beállított oldószer</th></tr></thead><tbody><tr>${["zetaConcentration","zetaVolume","zetaMaterial","zetaSolvent"].map(name=>`<td><input name="${name}"></td>`).join("")}</tr></tbody></table></div>`) +
    section("zeta-measurements","Mérési paraméterek",`<div class="table-wrap wide-table"><table><thead><tr><th>Mit mértünk?</th><th>Hőmérséklet [°C]</th><th>Ismétlések száma</th><th>Megjegyzés / egyéb paraméter</th></tr></thead><tbody>${[0,1].map(index=>`<tr><td><textarea name="zetaMeasure${index}What"></textarea></td><td><input name="zetaMeasure${index}Temperature"></td><td><input name="zetaMeasure${index}Repeats"></td><td><textarea name="zetaMeasure${index}Notes"></textarea></td></tr>`).join("")}</tbody></table></div>`);
}

function plateForm() {
  const materials = Array.from({length:9},(_,index)=>`<tr><th>${index+1}</th><td><input name="plateMaterial${index}Name"></td><td><input name="plateMaterial${index}Concentration"></td><td><input name="plateMaterial${index}Mass"></td><td><input name="plateMaterial${index}Volume"></td></tr>`).join("");
  const columns = Array.from({length:12},(_,index)=>index+1);
  const grid = "ABCDEFGH".split("").map(row=>`<tr><th>${row}</th>${columns.map(column=>`<td><input name="plate${row}${column}" aria-label="${row}${column} cella"></td>`).join("")}</tr>`).join("");
  return common() + section("plate-reaction","Reakció sematikus ábrája",textarea("Reakció","plateReaction",7)) +
    section("plate-materials","Felhasznált anyagok és oldatok",`${input("Elmentett eredmények fájlneve / elérési útja","projectPath")}<div class="table-wrap wide-table top-gap"><table class="numbered-table"><thead><tr><th>#</th><th>Név</th><th>c [mg/ml]</th><th>m [mg]</th><th>V [ml]</th></tr></thead><tbody>${materials}<tr class="total-row"><th>Σ</th><td>Összesen</td><td>–</td><td>–</td><td>–</td></tr></tbody></table></div>${textarea("Megjegyzések","plateMaterialsNotes",4,'class="top-gap"')}`) +
    section("plate-steps","Mérés menetének leírása",textarea("Mérés menete","plateSteps",14)) +
    section("plate-settings","Mérési paraméterek",`<div class="field-grid two-columns">${input("Plate típusa","plateType")}${input("Elmentett protokoll neve / elérési útja","plateProtocolPath")}${select("Mérés típusa","plateMeasurementType",["Spektrum","Diszkrét hullámhossz"])}${input("Hullámhossztartomány / hullámhossz","plateWavelength")}${unit("Hőmérséklet","plateTemperature","°C")}<div class="check-row"><label><input name="plateIncubationRequired" type="checkbox" value="Igen"> Inkubáció szükséges</label></div>${input("Kinetikus ciklusok száma","plateKineticLoops","number")}${input("Rázás","plateShaking")}${input("Bemért térfogatok (ΣV/well)","plateWellVolume","text",'class="full-span"')}</div>`) +
    section("plate-layout","Plate elrendezés",`<div class="table-wrap plate-table-wrap"><table class="plate-layout-table"><thead><tr><th></th>${columns.map(column=>`<th>${column}</th>`).join("")}</tr></thead><tbody>${grid}</tbody></table></div>`) +
    section("plate-observations","Megfigyelések",textarea("Megfigyelések","plateObservations",8));
}

function formHtml() { return active === "enzyme" ? enzymeForm() : active === "electrospinning" ? electroForm() : active === "platereader" ? plateForm() : zetaForm(); }

function render() {
  const current = meta[active];
  document.querySelector("#app").innerHTML = `<main class="app-shell"><aside class="protocol-panel"><div class="logo-frame sidebar-logo"><img src="${logo}" alt="NanoBioTech Research Group"></div><p class="eyebrow">Labor jegyzőkönyvek</p><h1>Jegyzőkönyv kiválasztása</h1><label class="select-label" for="protocol">Sablon</label><select id="protocol"><option value="enzyme">Enzimtisztítás</option><option value="electrospinning">Electrospinning</option><option value="platereader">Platereader</option><option value="zetasizer">Zetasizer</option></select><div class="step-card"><div><strong>Aktív sablon</strong><p>${current.title} • ${current.sections.length} szakasz</p></div></div><nav class="section-nav">${current.sections.map(([id,label])=>`<a href="#${id}">${label}</a>`).join("")}</nav></aside><section class="workspace"><header class="workspace-header"><div><p class="eyebrow" id="stateEyebrow">Piszkozat</p><h2>${current.title}</h2><p class="subtitle">Töltsd ki a mérés során, szakaszonként haladva.</p></div><div class="header-meta"><div class="logo-frame header-logo"><img src="${logo}" alt="NanoBioTech Research Group"></div><span id="status" class="status-pill">Nincs mentve</span></div></header><form id="protocolForm" class="protocol-form"><fieldset>${formHtml()}</fieldset></form><footer class="action-bar"><p id="message">Alapsablon • a ClickUp-kapcsolat a következő fejlesztési lépés.</p><div><button id="save" class="secondary-button" type="button">Mentés</button><button id="close" class="primary-button" type="button">Lezárás és PDF letöltése</button></div></footer></section></main>`;
  document.querySelector("#protocol").value = active;
  document.querySelector("#protocol").addEventListener("change", (event) => { active = event.target.value; status = "clean"; closed = false; photoSource = ""; render(); });
  const form = document.querySelector("#protocolForm");
  form.addEventListener("change", () => { if (!closed) { status = "dirty"; updateStatus(); } });
  form.addEventListener("input", () => { if (!closed) { status = "dirty"; updateStatus(); } });
  const photo = document.querySelector("#storagePhoto");
  photo?.addEventListener("change", (event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { photoSource = String(reader.result); document.querySelector("#photoPreview").innerHTML = `<figure class="photo-preview"><img src="${photoSource}" alt="Fénykép előnézete"><figcaption>${file.name}</figcaption></figure>`; }; reader.readAsDataURL(file); });
  document.querySelector("#save").addEventListener("click", () => save(false));
  document.querySelector("#close").addEventListener("click", closeAndDownload);
  restore();
}

function collect() {
  const form = document.querySelector("#protocolForm");
  const data = Object.fromEntries([...new FormData(form).entries()].filter(([,value])=>typeof value === "string"));
  form.querySelectorAll('input[type="checkbox"]').forEach(box => data[box.name] = box.checked ? "Igen" : "Nem");
  return data;
}

function save(shouldClose) {
  const savedAt = new Date().toISOString();
  localStorage.setItem(`nanobio-protocol-${active}-draft-v1`, JSON.stringify({data:collect(),savedAt,closed:shouldClose}));
  closed = shouldClose; status = shouldClose ? "closed" : "saved"; updateStatus(savedAt);
}

function restore() {
  const raw = localStorage.getItem(`nanobio-protocol-${active}-draft-v1`);
  if (!raw) return updateStatus();
  try {
    const draft = JSON.parse(raw); const form = document.querySelector("#protocolForm");
    Object.entries(draft.data || {}).forEach(([name,value]) => { const field = form.elements.namedItem(name); if (!field) return; if (field.type === "checkbox") field.checked = value === "Igen"; else field.value = value; });
    closed = draft.closed && !["localhost","127.0.0.1"].includes(location.hostname); status = closed ? "closed" : "saved"; updateStatus(draft.savedAt);
  } catch { localStorage.removeItem(`nanobio-protocol-${active}-draft-v1`); }
}

function updateStatus(savedAt = "") {
  const pill = document.querySelector("#status");
  pill.className = `status-pill status-${status}`;
  pill.textContent = status === "closed" ? "Lezárva" : status === "saved" ? `Mentve ${savedAt ? new Date(savedAt).toLocaleTimeString("hu-HU",{hour:"2-digit",minute:"2-digit"}) : ""}` : status === "dirty" ? "Nem mentett módosítás" : "Nincs mentve";
  document.querySelector("#protocolForm fieldset").disabled = closed;
  document.querySelector("#save").disabled = closed;
  document.querySelector("#close").disabled = closed;
}

async function closeAndDownload() {
  const form = document.querySelector("#protocolForm");
  if (!form.reportValidity()) return;
  const button = document.querySelector("#close"); button.disabled = true; button.textContent = "PDF készítése…";
  const preview = window.open("", "_blank"); if (preview) preview.document.body.textContent = "A jegyzőkönyv PDF-változata készül…";
  try { await downloadProtocolPdf(active, collect(), logo, active === "enzyme" ? photoSource : undefined, preview); save(true); }
  catch (error) { console.error(error); preview?.close(); document.querySelector("#message").textContent = "A PDF elkészítése nem sikerült. Kérlek, próbáld újra."; button.disabled = false; }
  finally { button.textContent = "Lezárás és PDF letöltése"; }
}

render();
