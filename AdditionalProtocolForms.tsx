function SectionTitle({ title }: { title: string }) {
  return (
    <summary className="section-heading">
      <div><h3>{title}</h3></div>
      <span className="chevron" aria-hidden="true">⌄</span>
    </summary>
  );
}

function UnitInput({ name, unit, min }: { name: string; unit: string; min?: number }) {
  return (
    <span className="input-with-unit">
      <input name={name} type="number" step="any" min={min} />
      <em>{unit}</em>
    </span>
  );
}

function CommonBasicFields() {
  return (
    <details className="form-section" id="basic" open>
      <SectionTitle title="Alapadatok" />
      <div className="section-content field-grid two-columns">
        <label>Dátum<input name="date" type="date" required /></label>
        <label>Hallgató neve<input name="studentName" type="text" placeholder="Teljes név" required /></label>
        <label className="full-span">Mérés célja<textarea name="measurementGoal" rows={4} /></label>
      </div>
    </details>
  );
}

export function ElectrospinningForm() {
  return (
    <>
      <CommonBasicFields />
      <details className="form-section" id="electro-equipment" open>
        <SectionTitle title="Mérés során használt paraméterek" />
        <div className="section-content field-grid two-columns">
          <label className="full-span">Elmentett projekt neve / elérési útja<input name="projectPath" type="text" /></label>
          <label>Szálképző berendezés típusa
            <select name="electroEquipment" defaultValue="">
              <option value="">Válassz…</option><option>R2</option><option>SpinCube</option><option>SpinCube BASE</option>
            </select>
          </label>
          <label>Szálképzés iránya
            <select name="electroDirection" defaultValue="">
              <option value="">Válassz…</option><option>Horizontális</option><option>Vertikális</option><option>Near-field</option>
            </select>
          </label>
        </div>
      </details>

      <details className="form-section" id="electro-solution" open>
        <SectionTitle title="Oldat paraméterek" />
        <div className="section-content">
          <div className="table-wrap wide-table">
            <table>
              <thead><tr><th>Polimer típusa(i)</th><th>Oldószer típusa(i)</th><th>Molekulatömeg [kDa]</th><th>Koncentráció [%]</th><th>Enzimtartalom</th></tr></thead>
              <tbody><tr>
                <td><input name="electroPolymer" aria-label="Polimer típusa" /></td>
                <td><input name="electroSolvent" aria-label="Oldószer típusa" /></td>
                <td><input name="electroMolecularWeight" type="number" step="any" aria-label="Molekulatömeg" /></td>
                <td><input name="electroConcentration" type="number" step="any" aria-label="Koncentráció" /></td>
                <td><input name="electroEnzymeContent" aria-label="Enzimtartalom" /></td>
              </tr></tbody>
            </table>
          </div>
          <div className="field-grid three-columns top-gap">
            <label>Polimerek aránya (ha releváns)<input name="electroPolymerRatio" type="text" /></label>
            <label>Oldószerek aránya (ha releváns)<input name="electroSolventRatio" type="text" /></label>
            <label>Oldat viszkozitása (ha ismert)<input name="electroViscosity" type="text" /></label>
          </div>
        </div>
      </details>

      <details className="form-section" id="electro-process" open>
        <SectionTitle title="Műveleti paraméterek" />
        <div className="section-content">
          <div className="field-grid four-columns">
            <label>Kollektor típusa<select name="electroCollectorType" defaultValue=""><option value="">Válassz…</option><option>Sík</option><option>Forgó</option></select></label>
            <label>Gyűjtőfelület anyaga<select name="electroCollectorSurface" defaultValue=""><option value="">Válassz…</option><option>Alufólia</option><option>Sütőpapír</option><option>Kollektor lemez</option></select></label>
            <label>Emitter típusa<select name="electroEmitterType" defaultValue=""><option value="">Válassz…</option><option>Egytűs</option><option>Koaxiális</option></select></label>
            <label>Forgási sebesség (ha releváns)<UnitInput name="electroRotationSpeed" unit="rpm" min={0} /></label>
          </div>
          <div className="table-wrap wide-table top-gap">
            <table>
              <thead><tr><th>Feszültség [kV]</th><th>Adagolási sebesség [ml/h]</th><th>Adagolt oldat [ml]</th><th>TCD [cm]</th><th>Emitter átmérő [G]</th><th>Időtartam [perc]</th></tr></thead>
              <tbody><tr>
                {[
                  ["electroVoltage", "Feszültség"], ["electroFeedRate", "Adagolási sebesség"], ["electroDispensedVolume", "Adagolt oldat"],
                  ["electroDistance", "Emitter-kollektor távolság"], ["electroEmitterDiameter", "Emitter átmérő"], ["electroDuration", "Időtartam"],
                ].map(([name, label]) => <td key={name}><input name={name} type="number" step="any" min="0" aria-label={label} /></td>)}
              </tr></tbody>
            </table>
          </div>
        </div>
      </details>

      <details className="form-section" id="electro-environment" open>
        <SectionTitle title="Környezeti paraméterek" />
        <div className="section-content field-grid two-columns">
          <label>Hőmérséklet<UnitInput name="electroTemperature" unit="°C" /></label>
          <label>Páratartalom<UnitInput name="electroHumidity" unit="%" min={0} /></label>
        </div>
      </details>
    </>
  );
}

export function ZetasizerForm() {
  return (
    <>
      <CommonBasicFields />
      <details className="form-section" id="zeta-settings" open>
        <SectionTitle title="Mérés során használt paraméterek" />
        <div className="section-content">
          <label>Elmentett projekt neve / elérési útja<input name="projectPath" type="text" /></label>
          <div className="check-row top-gap" role="group" aria-label="Mérés típusa">
            <label><input name="zetaModeSize" type="checkbox" value="Igen" /> Size</label>
            <label><input name="zetaModeZeta" type="checkbox" value="Igen" /> Zeta</label>
          </div>
        </div>
      </details>
      <details className="form-section" id="zeta-solution" open>
        <SectionTitle title="Oldat paraméterek" />
        <div className="section-content table-wrap wide-table">
          <table>
            <thead><tr><th>Koncentráció [mg/ml]</th><th>Felhasznált térfogat [µl]</th><th>Beállított anyag</th><th>Beállított oldószer</th></tr></thead>
            <tbody><tr>
              <td><input name="zetaConcentration" type="number" step="any" aria-label="Koncentráció" /></td>
              <td><input name="zetaVolume" type="number" step="any" aria-label="Felhasznált térfogat" /></td>
              <td><input name="zetaMaterial" aria-label="Beállított anyag" /></td>
              <td><input name="zetaSolvent" aria-label="Beállított oldószer" /></td>
            </tr></tbody>
          </table>
        </div>
      </details>
      <details className="form-section" id="zeta-measurements" open>
        <SectionTitle title="Mérési paraméterek" />
        <div className="section-content table-wrap wide-table">
          <table>
            <thead><tr><th>Mit mértünk?</th><th>Hőmérséklet [°C]</th><th>Ismétlések száma</th><th>Megjegyzés / egyéb változtatott paraméter</th></tr></thead>
            <tbody>{[0, 1].map((index) => <tr key={index}>
              <td><textarea name={`zetaMeasure${index}What`} rows={3} aria-label={`${index + 1}. mérés tárgya`} /></td>
              <td><input name={`zetaMeasure${index}Temperature`} type="number" step="any" aria-label={`${index + 1}. mérés hőmérséklete`} /></td>
              <td><input name={`zetaMeasure${index}Repeats`} type="number" step="1" min="0" aria-label={`${index + 1}. mérés ismétlésszáma`} /></td>
              <td><textarea name={`zetaMeasure${index}Notes`} rows={3} aria-label={`${index + 1}. mérés megjegyzése`} /></td>
            </tr>)}</tbody>
          </table>
        </div>
      </details>
    </>
  );
}

const plateRows = Array.from({ length: 8 }, (_, index) => String.fromCharCode(65 + index));
const plateColumns = Array.from({ length: 12 }, (_, index) => index + 1);

export function PlatereaderForm() {
  return (
    <>
      <CommonBasicFields />
      <details className="form-section" id="plate-reaction" open>
        <SectionTitle title="Reakció sematikus ábrája" />
        <div className="section-content"><textarea name="plateReaction" rows={7} placeholder="Írd le a reakciót vagy illeszd be a sematikus jelölését…" /></div>
      </details>
      <details className="form-section" id="plate-materials" open>
        <SectionTitle title="Felhasznált anyagok és oldatok" />
        <div className="section-content">
          <label>Elmentett eredmények fájlneve / elérési útja<input name="projectPath" type="text" /></label>
          <div className="table-wrap wide-table top-gap">
            <table className="numbered-table">
              <thead><tr><th>#</th><th>Név</th><th>c [mg/ml]</th><th>m [mg]</th><th>V [ml]</th></tr></thead>
              <tbody>
                {Array.from({ length: 9 }, (_, index) => <tr key={index}><th>{index + 1}</th>
                  <td><input name={`plateMaterial${index}Name`} aria-label={`${index + 1}. anyag neve`} /></td>
                  <td><input name={`plateMaterial${index}Concentration`} type="number" step="any" aria-label={`${index + 1}. koncentráció`} /></td>
                  <td><input name={`plateMaterial${index}Mass`} type="number" step="any" aria-label={`${index + 1}. tömeg`} /></td>
                  <td><input name={`plateMaterial${index}Volume`} type="number" step="any" aria-label={`${index + 1}. térfogat`} /></td>
                </tr>)}
                <tr className="total-row"><th>Σ</th><td>Összesen</td><td>–</td><td>–</td><td>–</td></tr>
              </tbody>
            </table>
          </div>
          <label className="top-gap">Megjegyzések<textarea name="plateMaterialsNotes" rows={4} /></label>
        </div>
      </details>
      <details className="form-section" id="plate-steps" open>
        <SectionTitle title="Mérés menetének leírása" />
        <div className="section-content"><textarea name="plateSteps" rows={14} /></div>
      </details>
      <details className="form-section" id="plate-settings" open>
        <SectionTitle title="Mérési paraméterek" />
        <div className="section-content field-grid two-columns">
          <label>Plate típusa<input name="plateType" type="text" /></label>
          <label>Elmentett protokoll neve / elérési útja<input name="plateProtocolPath" type="text" /></label>
          <label>Mérés típusa<select name="plateMeasurementType" defaultValue=""><option value="">Válassz…</option><option>Spektrum</option><option>Diszkrét hullámhossz</option></select></label>
          <label>Hullámhossztartomány / hullámhossz<input name="plateWavelength" type="text" /></label>
          <label>Hőmérséklet<UnitInput name="plateTemperature" unit="°C" /></label>
          <div className="check-row"><label><input name="plateIncubationRequired" type="checkbox" value="Igen" /> Inkubáció szükséges</label></div>
          <label>Kinetikus ciklusok száma<input name="plateKineticLoops" type="number" step="1" min="0" /></label>
          <label>Rázás<input name="plateShaking" type="text" /></label>
          <label className="full-span">Bemért térfogatok (ΣV/well)<input name="plateWellVolume" type="text" /></label>
        </div>
      </details>
      <details className="form-section" id="plate-layout" open>
        <SectionTitle title="Plate elrendezés" />
        <div className="section-content table-wrap plate-table-wrap">
          <table className="plate-layout-table"><thead><tr><th></th>{plateColumns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{plateRows.map((row) => <tr key={row}><th>{row}</th>{plateColumns.map((column) => <td key={column}><input name={`plate${row}${column}`} aria-label={`${row}${column} cella`} /></td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
      <details className="form-section" id="plate-observations" open>
        <SectionTitle title="Megfigyelések" />
        <div className="section-content"><textarea name="plateObservations" rows={8} /></div>
      </details>
    </>
  );
}
