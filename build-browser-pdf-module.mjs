import fs from "node:fs";
import path from "node:path";

const workspace = path.resolve(import.meta.dirname, "..");
let source = fs.readFileSync(path.join(workspace, "app", "pdfExport.ts"), "utf8");
source = source
  .replace(/import \{ PROTOCOL_META, type ProtocolKind \} from "\.\/protocolTypes";/, 'import { PROTOCOL_META } from "/work/protocolTypes.qa.mjs";')
  .replace(/type ProtocolData[\s\S]*?const PAGE_WIDTH/, "const PAGE_WIDTH")
  .replace(/: string \| undefined/g, "")
  .replace(/\?: Window \| null/g, "")
  .replace(/: ProtocolData/g, "")
  .replace(/: ProtocolKind/g, "")
  .replace(/: PdfSection\[\]/g, "")
  .replace(/: PageSurface\[\]/g, "")
  .replace(/: Uint8Array\[\]/g, "")
  .replace(/: PageSurface/g, "")
  .replace(/: CanvasRenderingContext2D/g, "")
  .replace(/: string\[\]/g, "")
  .replace(/: string/g, "")
  .replace(/: number/g, "")
  .replace(/: boolean/g, "")
  .replace(/: PdfRow/g, "")
  .replace(/: PdfTable/g, "")
  .replace(/: NonNullable<PdfSection\["notes"\]>\[number\]/g, "")
  .replace(/([A-Za-z_$][\w$]*)\?(?=[,)])/g, "$1")
  .replace(/new Promise<HTMLImageElement>/g, "new Promise")
  .replace(/new Promise<Blob>/g, "new Promise")
  .replace(/\.\/vendor\/pdf-lib/g, "/app/vendor/pdf-lib.js");
fs.writeFileSync(path.join(import.meta.dirname, "pdfExport.browser.mjs"), source);
