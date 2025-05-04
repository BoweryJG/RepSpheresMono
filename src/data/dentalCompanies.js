// Dental Companies Dataset

// Top dental companies with market and financial data
const dentalCompanies = [
  {
    name: "Align Technology",
    marketCap: "$16.2B",
    revenue: "$3.9B",
    founded: 1997,
    timeInMarket: 28,
    keyOfferings: ["Clear Aligners", "Intraoral Scanners", "CAD/CAM Software"],
    topProducts: ["Invisalign", "iTero Scanner", "exocad Software"],
    parentCompany: "Independent",
    description: "Global medical device company focused on clear aligners, intraoral scanners, and CAD/CAM software for orthodontics and restorative dentistry.",
    website: "https://www.aligntech.com",
    marketShare: 22.4,
    headquarters: "Tempe, Arizona, USA",
    growthRate: 11.6,
    employeeCount: "~25,000"
  },
  {
    name: "Dentsply Sirona",
    marketCap: "$7.8B",
    revenue: "$4.1B",
    founded: 1899,
    timeInMarket: 126,
    keyOfferings: ["Dental Equipment", "Consumables", "Digital Dentistry", "Implants"],
    topProducts: ["CEREC CAD/CAM", "Primescan", "SureSmile", "Implant Systems"],
    parentCompany: "Independent",
    description: "World's largest manufacturer of professional dental products and technologies, providing comprehensive end-to-end solutions.",
    website: "https://www.dentsplysirona.com",
    marketShare: 18.7,
    headquarters: "Charlotte, North Carolina, USA",
    growthRate: 8.3,
    employeeCount: "~15,000"
  },
  {
    name: "Straumann Group",
    marketCap: "$19.5B",
    revenue: "$2.7B",
    founded: 1954,
    timeInMarket: 71,
    keyOfferings: ["Dental Implants", "Digital Dentistry", "Orthodontics", "Biomaterials"],
    topProducts: ["Straumann BLX Implant", "ClearCorrect Aligners", "Neodent Implant System"],
    parentCompany: "Independent",
    description: "Global leader in aesthetic dentistry specializing in implant, restorative and regenerative dentistry and orthodontics.",
    website: "https://www.straumann.com",
    marketShare: 15.6,
    headquarters: "Basel, Switzerland",
    growthRate: 14.2,
    employeeCount: "~10,500"
  },
  {
    name: "Henry Schein",
    marketCap: "$9.8B",
    revenue: "$12.6B",
    founded: 1932,
    timeInMarket: 93,
    keyOfferings: ["Dental Distribution", "Practice Management Software", "Equipment"],
    topProducts: ["Dentrix Practice Management", "axiUm", "Schein Dental Equipment"],
    parentCompany: "Independent",
    description: "World's largest provider of health care products and services to office-based dental and medical practitioners.",
    website: "https://www.henryschein.com",
    marketShare: 13.9,
    headquarters: "Melville, New York, USA",
    growthRate: 6.8,
    employeeCount: "~22,000"
  },
  {
    name: "Envista Holdings",
    marketCap: "$4.2B",
    revenue: "$2.6B",
    founded: 2018,
    timeInMarket: 7,
    keyOfferings: ["Dental Products", "Orthodontics", "Implants", "Digital Imaging"],
    topProducts: ["Nobel Biocare Implants", "Spark Clear Aligners", "KaVo Imaging"],
    parentCompany: "Spun off from Danaher Corporation",
    description: "Global dental products company focused on innovative dental equipment, consumables, and specialty products.",
    website: "https://www.envistaco.com",
    marketShare: 9.8,
    headquarters: "Brea, California, USA",
    growthRate: 7.9,
    employeeCount: "~12,000"
  }
];

// Aesthetic companies for comparison
const aestheticCompanies = [
  {
    name: "AbbVie (Allergan Aesthetics)",
    marketCap: "$248B",
    revenue: "$13.8B (Aesthetics Division: ~$4.5B)",
    founded: 2013,
    acquisition: "Allergan acquisition in 2020",
    timeInMarket: 12,
    keyOfferings: ["Facial Injectables", "Body Contouring", "Skincare"],
    topProducts: ["Botox Cosmetic", "Juvederm Fillers", "CoolSculpting"],
    parentCompany: "AbbVie Inc.",
    description: "Global pharmaceutical company with a leading aesthetics division following the acquisition of Allergan, offering the most recognized portfolio of aesthetic products worldwide.",
    website: "https://www.allerganaesthetics.com",
    marketShare: 36.2,
    headquarters: "Irvine, California, USA",
    growthRate: 15.7,
    employeeCount: "~50,000 (AbbVie total)"
  },
  {
    name: "Galderma",
    marketCap: "$20.8B",
    revenue: "$3.8B",
    founded: 1981,
    timeInMarket: 44,
    keyOfferings: ["Facial Injectables", "Skincare", "Lasers and Energy Devices"],
    topProducts: ["Restylane Fillers", "Dysport", "Sculptra"],
    parentCompany: "Independent (Previously Nestlé)",
    description: "Focused exclusively on dermatology and skincare, offering a broad range of aesthetic treatments, prescription medications, and consumer skincare.",
    website: "https://www.galderma.com",
    marketShare: 15.3,
    headquarters: "Lausanne, Switzerland",
    growthRate: 14.2,
    employeeCount: "~5,500"
  },
  {
    name: "Bausch Health Companies",
    marketCap: "$3.4B",
    revenue: "$8.8B (Aesthetics: ~$1.8B)",
    founded: 1959,
    timeInMarket: 66,
    keyOfferings: ["Skincare", "Aesthetic Devices", "Eye Care"],
    topProducts: ["Thermage", "Fraxel", "Clear + Brilliant"],
    parentCompany: "Independent",
    description: "Global healthcare company with a significant aesthetics division focused on lasers, energy-based devices, and skincare products.",
    website: "https://www.bauschhealth.com",
    marketShare: 8.7,
    headquarters: "Laval, Quebec, Canada",
    growthRate: 7.9,
    employeeCount: "~20,000"
  },
  {
    name: "Merz Aesthetics",
    marketCap: "Private",
    revenue: "~$1.2B",
    founded: 1908,
    timeInMarket: 117,
    keyOfferings: ["Facial Injectables", "Energy-Based Devices", "Skincare"],
    topProducts: ["Radiesse", "Belotero", "Ultherapy"],
    parentCompany: "Merz Pharma Group",
    description: "Family-owned pharmaceutical company with a strong focus on aesthetics, neurotoxins, and energy-based treatments.",
    website: "https://www.merzaesthetics.com",
    marketShare: 7.2,
    headquarters: "Frankfurt, Germany",
    growthRate: 9.8,
    employeeCount: "~3,000"
  },
  {
    name: "Cynosure (Hologic)",
    marketCap: "Part of Hologic ($18.6B)",
    revenue: "~$800M",
    founded: 1991,
    timeInMarket: 34,
    keyOfferings: ["Laser Systems", "Body Contouring", "Skin Revitalization"],
    topProducts: ["SculpSure", "PicoSure", "TempSure"],
    parentCompany: "Hologic",
    description: "Leading developer and manufacturer of aesthetic treatment systems using laser, light, and energy-based technologies.",
    website: "https://www.cynosure.com",
    marketShare: 6.1,
    headquarters: "Westford, Massachusetts, USA",
    growthRate: 11.2,
    employeeCount: "~1,500"
  }
];

export {
  dentalCompanies,
  aestheticCompanies
};
