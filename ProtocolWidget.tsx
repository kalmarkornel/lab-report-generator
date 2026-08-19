"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { NANOBIO_LOGO } from "./logo";
import { downloadProtocolPdf } from "./pdfExport";
import { ElectrospinningForm, PlatereaderForm, ZetasizerForm } from "./AdditionalProtocolForms";
import { PROTOCOL_META, type ProtocolKind } from "./protocolTypes";

type SaveStatus = "clean" | "dirty" | "saved" | "closed";

type StoredDraft = {
  data: Record<string, string>;
  savedAt: string;
  closed: boolean;
};

const fractionRows = [
  ["Felülúszó → áteső", true],
  ["LS1", false],
  ["HS", false],
  ["LS2", false],
  ["LIM", false],
  ["HIM", false],
  ["UHIM", false],
] as const;

function UnitInput({
  name,
  unit,
  required = false,
  min,
}: {
  name: string;
  unit: string;
  required?: boolean;
  min?: number;
}) {
  return (
    <span className="input-with-unit">
      <input name={name} type="number" step="any" min={min} required={required} />
      <em>{unit}</em>
    </span>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <summary className="section-heading">
      <div>
        <h3>{title}</h3>
      </div>
      <span className="chevron" aria-hidden="true">⌄</span>
    </summary>
  );
}

export default function ProtocolWidget() {
  const formRef = useRef<HTMLFormElement>(null);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolKind>("enzyme");
  const [status, setStatus] = useState<SaveStatus>("clean");
  const [savedAt, setSavedAt] = useState<string>("");
  const [closed, setClosed] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoName, setPhotoName] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const protocolMeta = PROTOCOL_META[activeProtocol];
  const storageKey = `nanobio-protocol-${activeProtocol}-draft-v1`;

  useEffect(() => {
    setStatus("clean");
    setSavedAt("");
    setClosed(false);
    setPhotoPreview("");
    setPhotoName("");
    setExportError("");

    const raw = window.localStorage.getItem(storageKey);
    if (!raw || !formRef.current) return;

    try {
      const draft = JSON.parse(raw) as StoredDraft;
      for (const [name, value] of Object.entries(draft.data)) {
        const field = formRef.current.elements.namedItem(name);
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          field.checked = value === "Igen";
        } else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
          field.value = value;
        }
      }
      setSavedAt(draft.savedAt);
      const isLocalPreview =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const draftIsClosed = draft.closed && !isLocalPreview;
      setClosed(draftIsClosed);
      setStatus(draftIsClosed ? "closed" : "saved");
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  function collectData() {
    if (!formRef.current) return {};
    const data: Record<string, string> = {};
    for (const [key, value] of new FormData(formRef.current).entries()) {
      if (typeof value === "string") data[key] = value;
    }
    formRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((checkbox) => {
      data[checkbox.name] = checkbox.checked ? (checkbox.value || "Igen") : "Nem";
    });
    return data;
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoPreview("");
      setPhotoName("");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setPhotoPreview(typeof reader.result === "string" ? reader.result : "");
      setPhotoName(file.name);
      setStatus("dirty");
    });
    reader.readAsDataURL(file);
  }

  function persistDraft(shouldClose = false) {
    const now = new Date().toISOString();
    const payload: StoredDraft = { data: collectData(), savedAt: now, closed: shouldClose };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    setSavedAt(now);
    setClosed(shouldClose);
    setStatus(shouldClose ? "closed" : "saved");
  }

  function handleSave() {
    if (closed) return;
    persistDraft(false);
  }

  async function handleCloseAndPrint() {
    if (!formRef.current?.reportValidity()) return;
    if (isExporting) return;

    const pdfWindow = window.open("", "_blank");
    if (pdfWindow) {
      pdfWindow.document.title = "PDF készítése…";
      pdfWindow.document.body.style.fontFamily = "Arial, sans-serif";
      pdfWindow.document.body.style.padding = "32px";
      pdfWindow.document.body.textContent = "A jegyzőkönyv PDF-változata készül…";
    }

    setIsExporting(true);
    setExportError("");
    try {
      await downloadProtocolPdf(activeProtocol, collectData(), NANOBIO_LOGO, activeProtocol === "enzyme" ? photoPreview : undefined, pdfWindow);
      persistDraft(true);
    } catch (error) {
      console.error("PDF export failed", error);
      pdfWindow?.close();
      setExportError("A PDF elkészítése nem sikerült. Kérlek, próbáld újra.");
    } finally {
      setIsExporting(false);
    }
  }

  const statusLabel = status === "closed"
    ? "Lezárva"
    : status === "saved"
      ? `Mentve ${new Date(savedAt).toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}`
      : status === "dirty"
        ? "Nem mentett módosítás"
        : "Nincs mentve";

  return (
    <main className="app-shell">
      <aside className="protocol-panel">
        <div className="logo-frame sidebar-logo">
          <img src={NANOBIO_LOGO} alt="NanoBioTech Research Group" />
        </div>
        <p className="eyebrow">Labor jegyzőkönyvek</p>
        <h1>Jegyzőkönyv kiválasztása</h1>
        <label className="select-label" htmlFor="protocol">Sablon</label>
        <select id="protocol" value={activeProtocol} onChange={(event) => setActiveProtocol(event.target.value as ProtocolKind)} aria-label="Jegyzőkönyv sablon">
          <option value="enzyme">Enzimtisztítás</option>
          <option value="electrospinning">Electrospinning</option>
          <option value="platereader">Platereader</option>
          <option value="zetasizer">Zetasizer</option>
        </select>

        <div className="step-card">
          <div>
            <strong>Aktív sablon</strong>
            <p>{protocolMeta.title} • {protocolMeta.sections.length} szakasz</p>
          </div>
        </div>

        <nav className="section-nav" aria-label="Jegyzőkönyv szakaszai">
          {protocolMeta.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.label}</a>)}
        </nav>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">{closed ? "Lezárt jegyzőkönyv" : "Piszkozat"}</p>
            <h2>{protocolMeta.title}</h2>
            <p className="subtitle">Töltsd ki a mérés során, szakaszonként haladva.</p>
          </div>
          <div className="header-meta">
            <div className="logo-frame header-logo">
              <img src={NANOBIO_LOGO} alt="NanoBioTech Research Group" />
            </div>
            <span className={`status-pill status-${status}`}>{statusLabel}</span>
          </div>
        </header>

        <form
          key={activeProtocol}
          ref={formRef}
          className="protocol-form"
          onChange={() => !closed && setStatus("dirty")}
        >
          <fieldset disabled={closed}>
            {activeProtocol === "enzyme" ? <>
            <details className="form-section" id="basic" open>
              <SectionTitle title="Alapadatok" />
              <div className="section-content field-grid three-columns">
                <label>Dátum<input name="date" type="date" required /></label>
                <label>Hallgató neve<input name="studentName" type="text" placeholder="Teljes név" required /></label>
                <label>Enzim neve<input name="enzymeName" type="text" placeholder="Pl. lipáz" required /></label>
              </div>
            </details>

            <details className="form-section" id="fermentation" open>
              <SectionTitle title="Fermentáció információi" />
              <div className="section-content">
                <label>Fermentáció leírása<textarea name="fermentationInfo" rows={5} placeholder="Írd ide a fermentáció részleteit…" /></label>
                <div className="field-grid three-columns top-gap">
                  <label>Centrifugálás<UnitInput name="fermentationCentrifugeG" unit="G" min={0} /></label>
                  <label>Idő<UnitInput name="fermentationCentrifugeTime" unit="perc" min={0} /></label>
                  <label>Hőmérséklet<UnitInput name="fermentationCentrifugeTemp" unit="°C" /></label>
                </div>
              </div>
            </details>

            <details className="form-section" id="lysis-buffer" open>
              <SectionTitle title="Feltáró puffer" />
              <div className="section-content">
                <div className="field-stack">
                  <label>Felhasznált mennyiség<UnitInput name="lysisBufferTotal" unit="ml" min={0} /></label>
                  <label>Lízispuffer (1×)<input name="lysisBuffer" type="text" placeholder="Mennyiség / koncentráció" /></label>
                  <label>PMSF<input name="pmsf" type="text" placeholder="Mennyiség / koncentráció" /></label>
                  <label>BA<input name="ba" type="text" placeholder="Mennyiség / koncentráció" /></label>
                  <label>TCEP<input name="tcep" type="text" placeholder="Mennyiség / koncentráció" /></label>
                  <label>DNáz<input name="dnase" type="text" placeholder="Mennyiség / koncentráció" /></label>
                </div>
              </div>
            </details>

            <details className="form-section" id="cell-lysis" open>
              <SectionTitle title="Sejtfeltárás" />
              <div className="section-content">
                <p className="device-note"><strong>Készülék típusa:</strong> Bandelin Sonoplus HD 4000</p>
                <div className="field-grid four-columns">
                  <label>Intenzitás<UnitInput name="sonicationIntensity" unit="%" min={0} /></label>
                  <label>Idő<UnitInput name="sonicationTime" unit="perc" min={0} /></label>
                  <label>Program - bekapcsolva<UnitInput name="sonicationOn" unit="s on" min={0} /></label>
                  <label>Program - kikapcsolva<UnitInput name="sonicationOff" unit="s off" min={0} /></label>
                </div>
                <div className="field-grid three-columns top-gap">
                  <label>Centrifugálás<UnitInput name="lysisCentrifugeG" unit="G" min={0} /></label>
                  <label>Idő<UnitInput name="lysisCentrifugeTime" unit="perc" min={0} /></label>
                  <label>Hőmérséklet<UnitInput name="lysisCentrifugeTemp" unit="°C" /></label>
                </div>
              </div>
            </details>

            <details className="form-section" id="ni-nta" open>
              <SectionTitle title="Ni-NTA tisztítás" />
              <div className="section-content">
                <label className="narrow-field">Gyanta mennyisége
                  <span className="amount-select">
                    <input name="resinAmount" type="text" inputMode="decimal" pattern="[0-9]+([,.][0-9]+)?" placeholder="1,0" aria-label="Gyanta mennyisége" />
                    <select name="resinUnit" defaultValue="g" aria-label="Gyanta mértékegysége">
                      <option value="g">g</option>
                      <option value="mg">mg</option>
                    </select>
                  </span>
                </label>
                <div className="table-wrap top-gap">
                  <table>
                    <thead><tr><th>Frakció</th><th>Koncentráció (elkészített)</th><th>Felhasznált mennyiség</th></tr></thead>
                    <tbody>
                      {fractionRows.map(([label, concentrationLocked], index) => (
                        <tr key={label}>
                          <th>{label}</th>
                          <td>{concentrationLocked ? <span className="not-applicable">–</span> : <input aria-label={`${label} koncentráció`} name={`fraction_${index}_concentration`} type="text" />}</td>
                          <td><input aria-label={`${label} felhasznált mennyiség`} name={`fraction_${index}_amount`} type="text" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="protocol-note">
                  <p>Ni-NTA oszlop tárolása 20%-os EtOH-ban történik. A használat előtt deszt. vízzel és LS-sel mosni kell.</p>
                  <p>Használat után deszt. vízzel és 20%-os EtOH-val mossuk és feleslegben tesszük el.</p>
                </div>
                <div className="protocol-note muted-note">
                  <p>Az LS (50 mM HEPES, 50 mM NaCl) és HS (50 mM HEPES, 150 mM NaCl) pufferekből 10x töménységű van, ezeket hígítani szükséges 1x töménységre használat előtt.</p>
                  <p>A LIM és HIM pufferek az enzimtisztításhoz megfelelő imidazol koncentrációt tartalmazzák, melyet az 1 M (UHIM) törzsoldatból hígítunk az 1x LS puffer segítségével.</p>
                  <p>A fehérjemennyiséget Bradford teszttel követjük: 10 μl (5x hígított) Bradford reagens + 2,5 μl minta.</p>
                </div>
              </div>
            </details>

            <details className="form-section" id="sds-page" open>
              <SectionTitle title="SDS-PAGE" />
              <div className="section-content">
                <div className="protocol-note">
                  <p><strong>Mintakészítés:</strong> 10 μl minta + 20 μl mintakoktél, 95 °C-on 5 perc inkubálás.</p>
                  <p>(Mintakoktél: 250 mM TrisHCl pH 6,8, 10% SDS, 10% DTT, 50% glicerin, 0,05% brómfenolkék) – a DTT-t használat előtt adjuk hozzá, vagy amennyiben az elmúlt 1 hónapban lett a mixhez adva DTT, akkor az úgy még felhasználható.</p>
                  <p>10-es gélen 10 μl mintát (a tisztított frakciókból), míg 15-ös gélre 5 μl mintát viszünk fel. A markerből, pelletből, lizátumból, átesőből 3 μl elegendő.</p>
                </div>
                <label className="top-gap">Mintafelviteli sorrend a gélre</label>
                <div className="lane-grid">
                  {Array.from({ length: 15 }, (_, index) => (
                    <label key={index}><span>{index + 1}</span><input name={`lane_${index + 1}`} aria-label={`${index + 1}. gélhely`} type="text" /></label>
                  ))}
                </div>
                <h4 className="subsection-title">Gélfuttatás</h4>
                <div className="field-grid two-columns top-gap">
                  <label>Feszültség<UnitInput name="gelVoltage" unit="V" min={0} /></label>
                  <label>Idő<UnitInput name="gelTime" unit="perc" min={0} /></label>
                </div>
              </div>
            </details>

            <details className="form-section" id="buffer-exchange" open>
              <SectionTitle title="Puffercsere" />
              <div className="section-content field-grid two-columns">
                <label>Oszlopra felvitt minta mennyisége<UnitInput name="desaltingSampleAmount" unit="ml" min={0} /></label>
                <label>Oszlopra felvitt puffer mennyisége<UnitInput name="desaltingBufferAmount" unit="ml" min={0} /></label>
                <label className="full-span">Puffer összetétele<textarea name="desaltingBufferComposition" rows={3} /></label>
              </div>
            </details>

            <details className="form-section" id="concentration" open>
              <SectionTitle title="Töményítés" />
              <div className="section-content">
                <label>Használt ultracentrifuga töményítő cső (molekulatömeg feltüntetése)<input name="concentratorTube" type="text" /></label>
                <div className="field-grid three-columns top-gap">
                  <label>Centrifugálás<UnitInput name="concentrationG" unit="G" min={0} /></label>
                  <label>Idő<UnitInput name="concentrationTime" unit="perc" min={0} /></label>
                  <label>Hőmérséklet<UnitInput name="concentrationTemp" unit="°C" /></label>
                </div>
              </div>
            </details>

            <details className="form-section" id="protein" open>
              <SectionTitle title="Fehérjekoncentráció meghatározása" />
              <div className="section-content field-grid three-columns">
                <label>E1% (extinkciós koefficiens)<input name="extinctionCoefficient" type="number" step="any" /></label>
                <label>Fehérjekoncentráció<UnitInput name="proteinConcentration" unit="mg/ml" min={0} /></label>
                <label>Expressziós termelés<UnitInput name="expressionYield" unit="mg/l fermentlé" min={0} /></label>
              </div>
            </details>

            <details className="form-section" id="storage" open>
              <SectionTitle title="Tárolás" />
              <div className="section-content field-grid two-columns">
                <label>Additívek<input name="storageAdditives" type="text" /></label>
                <label>Hely<input name="storageLocation" type="text" /></label>
                <label>Jelzések<input name="storageLabels" type="text" /></label>
                <label>Adagok<input name="storageAliquots" type="text" /></label>
                <div className="photo-upload full-span">
                  <label htmlFor="storagePhoto">Fénykép feltöltése <span>(opcionális, legfeljebb egy kép)</span></label>
                  <input id="storagePhoto" name="storagePhoto" type="file" accept="image/*" onChange={handlePhotoChange} />
                  {photoPreview && (
                    <figure className="photo-preview">
                      <img src={photoPreview} alt="A feltöltött tárolási fénykép előnézete" />
                      <figcaption>{photoName}</figcaption>
                    </figure>
                  )}
                </div>
              </div>
            </details>
            </> : activeProtocol === "electrospinning" ? <ElectrospinningForm /> : activeProtocol === "platereader" ? <PlatereaderForm /> : <ZetasizerForm />}
          </fieldset>
        </form>

        <footer className="action-bar">
          <p>{exportError || (closed ? "A jegyzőkönyv lezárva, a mezők már nem szerkeszthetők." : "Alapsablon • a ClickUp-kapcsolat a következő fejlesztési lépés.")}</p>
          <div>
            <button className="secondary-button" type="button" onClick={handleSave} disabled={closed}>Mentés</button>
            <button className="primary-button" type="button" onClick={handleCloseAndPrint} disabled={closed || isExporting}>
              {isExporting ? "PDF készítése…" : "Lezárás és PDF letöltése"}
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
