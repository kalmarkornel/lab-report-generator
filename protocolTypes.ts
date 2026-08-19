export type ProtocolKind = "enzyme" | "electrospinning" | "platereader" | "zetasizer";

type ProtocolMeta = {
  title: string;
  pdfTitle: string;
  slug: string;
  sections: Array<{ id: string; label: string }>;
};

export const PROTOCOL_META: Record<ProtocolKind, ProtocolMeta> = {
  enzyme: {
    title: "Enzimtisztítás",
    pdfTitle: "Enzimtisztítás jegyzőkönyv",
    slug: "enzimtisztitas",
    sections: [
      { id: "basic", label: "Alapadatok" },
      { id: "fermentation", label: "Fermentáció" },
      { id: "lysis-buffer", label: "Feltáró puffer" },
      { id: "cell-lysis", label: "Sejtfeltárás" },
      { id: "ni-nta", label: "Ni-NTA tisztítás" },
      { id: "sds-page", label: "SDS-PAGE" },
      { id: "buffer-exchange", label: "Puffercsere" },
      { id: "concentration", label: "Töményítés" },
      { id: "protein", label: "Fehérjekoncentráció" },
      { id: "storage", label: "Tárolás" },
    ],
  },
  electrospinning: {
    title: "Electrospinning",
    pdfTitle: "Electrospinning jegyzőkönyv",
    slug: "electrospinning",
    sections: [
      { id: "basic", label: "Alapadatok" },
      { id: "electro-equipment", label: "Berendezés" },
      { id: "electro-solution", label: "Oldat paraméterek" },
      { id: "electro-process", label: "Műveleti paraméterek" },
      { id: "electro-environment", label: "Környezeti paraméterek" },
    ],
  },
  platereader: {
    title: "Platereader",
    pdfTitle: "Platereader jegyzőkönyv",
    slug: "platereader",
    sections: [
      { id: "basic", label: "Alapadatok" },
      { id: "plate-reaction", label: "Reakció" },
      { id: "plate-materials", label: "Anyagok és oldatok" },
      { id: "plate-steps", label: "Mérés menete" },
      { id: "plate-settings", label: "Mérési paraméterek" },
      { id: "plate-layout", label: "Plate elrendezés" },
      { id: "plate-observations", label: "Megfigyelések" },
    ],
  },
  zetasizer: {
    title: "Zetasizer",
    pdfTitle: "Zetasizer jegyzőkönyv",
    slug: "zetasizer",
    sections: [
      { id: "basic", label: "Alapadatok" },
      { id: "zeta-settings", label: "Mérés beállításai" },
      { id: "zeta-solution", label: "Oldat paraméterek" },
      { id: "zeta-measurements", label: "Mérési paraméterek" },
    ],
  },
};
