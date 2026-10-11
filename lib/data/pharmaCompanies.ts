export interface PharmaCompany {
  id: string;
  label: string;
  fullName: string;
  count: string;
}

export const ALL_PHARMA_COMPANIES: PharmaCompany[] = [
  { id: "ALL", label: "All Companies", fullName: "All Licensed BD Manufacturers (41k+)", count: "41,302" },
  { id: "Square", label: "Square Pharma", fullName: "Square Pharmaceuticals PLC", count: "2,065" },
  { id: "Incepta", label: "Incepta Pharma", fullName: "Incepta Pharmaceuticals Ltd.", count: "1,775" },
  { id: "Drug International", label: "Drug International", fullName: "Drug International Ltd.", count: "1,530" },
  { id: "ACI", label: "ACI Limited", fullName: "Advanced Chemical Industries (ACI)", count: "1,564" },
  { id: "Opsonin", label: "Opsonin Pharma", fullName: "Opsonin Pharma Limited", count: "1,400" },
  { id: "Eskayef", label: "Eskayef (SK+F)", fullName: "Eskayef Pharmaceuticals Ltd.", count: "1,370" },
  { id: "Renata", label: "Renata Limited", fullName: "Renata PLC", count: "1,216" },
  { id: "ACME", label: "The ACME", fullName: "The ACME Laboratories Ltd.", count: "1,152" },
  { id: "Beximco", label: "Beximco Pharma", fullName: "Beximco Pharmaceuticals Ltd.", count: "1,084" },
  { id: "Healthcare", label: "Healthcare Pharma", fullName: "Healthcare Pharmaceuticals Ltd.", count: "1,046" },
  { id: "Aristopharma", label: "Aristopharma", fullName: "Aristopharma Limited", count: "877" },
  { id: "Popular", label: "Popular Pharma", fullName: "Popular Pharmaceuticals PLC", count: "811" },
  { id: "General", label: "General Pharma", fullName: "General Pharmaceuticals Ltd.", count: "736" },
  { id: "Unimed Unihealth", label: "Unimed Unihealth", fullName: "Unimed Unihealth Pharmaceuticals", count: "700" },
  { id: "Beacon", label: "Beacon Pharma", fullName: "Beacon Pharmaceuticals PLC (Oncology)", count: "657" },
  { id: "Globe", label: "Globe Pharma", fullName: "Globe Pharmaceuticals Ltd.", count: "635" },
  { id: "Navana", label: "Navana Pharma", fullName: "Navana Pharmaceuticals Ltd.", count: "632" },
  { id: "Biopharma", label: "Biopharma Ltd.", fullName: "Biopharma Laboratories Ltd.", count: "616" },
  { id: "Techno Drugs", label: "Techno Drugs", fullName: "Techno Drugs Ltd.", count: "575" },
  { id: "Albion", label: "Albion Labs", fullName: "Albion Laboratories Ltd.", count: "562" },
  { id: "Ibn Sina", label: "Ibn Sina", fullName: "Ibn Sina Pharmaceutical Ind. Ltd.", count: "533" },
  { id: "Orion", label: "Orion Pharma", fullName: "Orion Pharma Ltd.", count: "448" },
  { id: "Synovia", label: "Synovia (Sanofi)", fullName: "Synovia Pharma PLC (Formerly Sanofi)", count: "388" },
  { id: "Ziska", label: "Ziska Pharma", fullName: "Ziska Pharmaceuticals Ltd.", count: "381" },
  { id: "Delta", label: "Delta Pharma", fullName: "Delta Pharma PLC.", count: "368" },
  { id: "Kemiko", label: "Kemiko Pharma", fullName: "Kemiko Pharmaceuticals Ltd.", count: "342" },
  { id: "Pacific", label: "Pacific Pharma", fullName: "Pacific Pharmaceuticals Ltd.", count: "329" },
  { id: "Chemist", label: "Chemist Labs", fullName: "Chemist Laboratories Ltd.", count: "325" },
  { id: "Everest", label: "Everest Pharma", fullName: "Everest Pharmaceuticals Ltd.", count: "317" },
  { id: "Jayson", label: "Jayson Pharma", fullName: "Jayson Pharmaceuticals Ltd.", count: "288" },
  { id: "Apex", label: "Apex Pharma", fullName: "Apex Pharma Ltd.", count: "287" },
  { id: "EDCL", label: "EDCL (Govt)", fullName: "Essential Drugs Company Limited (Govt)", count: "286" },
  { id: "Asiatic", label: "Asiatic Labs", fullName: "Asiatic Laboratories Ltd.", count: "285" },
  { id: "Jenphar", label: "Jenphar BD", fullName: "Jenphar Bangladesh Ltd.", count: "281" },
  { id: "Pharmasia", label: "Pharmasia", fullName: "Pharmasia Ltd.", count: "277" },
  { id: "Euro Pharma", label: "Euro Pharma", fullName: "Euro Pharma Ltd.", count: "268" },
  { id: "NIPRO JMI", label: "NIPRO JMI", fullName: "NIPRO JMI Pharma Limited (Japan-BD)", count: "251" },
  { id: "Radiant", label: "Radiant Pharma", fullName: "Radiant Pharmaceuticals Ltd.", count: "242" },
  { id: "Alco", label: "Alco Pharma", fullName: "Alco Pharma Ltd.", count: "223" },
  { id: "Kumudini", label: "Kumudini Pharma", fullName: "Kumudini Pharma Ltd.", count: "199" },
  { id: "Nuvista", label: "Nuvista Pharma", fullName: "Nuvista Pharma (Formerly Organon)", count: "197" },
  { id: "White Horse", label: "White Horse", fullName: "White Horse Pharmaceuticals Ltd.", count: "195" },
  { id: "Silva", label: "Silva Pharma", fullName: "Silva Pharmaceuticals Ltd.", count: "187" },
  { id: "Medicon", label: "Medicon Pharma", fullName: "Medicon Pharmaceuticals Ltd.", count: "183" },
  { id: "Cosmo", label: "Cosmo Pharma", fullName: "Cosmo Pharma Laboratories Ltd.", count: "20" },
];

export const TOP_QUICK_PHARMA_COMPANIES: PharmaCompany[] = ALL_PHARMA_COMPANIES.slice(0, 16);

export function matchPharmaCompany(mfg: string): PharmaCompany | undefined {
  if (!mfg) return undefined;
  const lower = mfg.toLowerCase();
  if (lower.includes("advanced chemical") || lower.includes("aci")) {
    return ALL_PHARMA_COMPANIES.find((c) => c.id === "ACI");
  }
  return ALL_PHARMA_COMPANIES.find(
    (c) => c.id !== "ALL" && lower.includes(c.id.toLowerCase())
  );
}
