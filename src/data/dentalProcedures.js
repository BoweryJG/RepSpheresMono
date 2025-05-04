// Comprehensive Dental Industry Data
const dentalProcedures = [
  // Preventive Dentistry
  { 
    name: "Regular Cleanings", 
    category: "Preventive",
    growth: 7.8, 
    marketSize2025: 5.6, 
    primaryAgeGroup: "All ages", 
    trends: "Increased emphasis on prevention and regular maintenance",
    futureOutlook: "Steady growth with advanced cleaning technologies and integration with telehealth monitoring"
  },
  { 
    name: "Dental Exams", 
    category: "Preventive",
    growth: 6.5, 
    marketSize2025: 4.8, 
    primaryAgeGroup: "All ages", 
    trends: "AI-assisted diagnostic tools improving accuracy and detection rates",
    futureOutlook: "Growth driven by preventative care focus and insurance coverage expansion"
  },
  { 
    name: "Dental X-rays", 
    category: "Preventive",
    growth: 5.2, 
    marketSize2025: 3.9, 
    primaryAgeGroup: "All ages", 
    trends: "Lower radiation digital imaging becoming standard",
    futureOutlook: "Moderate growth with 3D imaging replacing traditional X-rays"
  },
  { 
    name: "Fluoride Treatments", 
    category: "Preventive",
    growth: 4.1, 
    marketSize2025: 2.4, 
    primaryAgeGroup: "0-17", 
    trends: "Advanced application methods with improved long-term protection",
    futureOutlook: "Steady growth in pediatric segment, moderate overall"
  },
  { 
    name: "Dental Sealants", 
    category: "Preventive",
    growth: 6.8, 
    marketSize2025: 2.1, 
    primaryAgeGroup: "5-14", 
    trends: "Improved materials with longer durability and anti-bacterial properties",
    futureOutlook: "Strong growth in pediatric preventive care protocols"
  },

  // Restorative Dentistry
  { 
    name: "Dental Fillings", 
    category: "Restorative",
    growth: 3.5, 
    marketSize2025: 11.2, 
    primaryAgeGroup: "All ages", 
    trends: "Shift to tooth-colored composite materials away from amalgam",
    futureOutlook: "Steady growth with bioactive materials replacing traditional composites"
  },
  { 
    name: "Dental Crowns", 
    category: "Restorative",
    growth: 7.6, 
    marketSize2025: 8.3, 
    primaryAgeGroup: "40-70", 
    trends: "Same-day CAD/CAM milling becoming standard in many practices",
    futureOutlook: "Strong growth with aesthetic demands and aging population"
  },
  { 
    name: "Root Canal Therapy", 
    category: "Restorative",
    growth: 5.6, 
    marketSize2025: 4.1, 
    primaryAgeGroup: "30-65", 
    trends: "Introduction of minimally invasive techniques, pain management improvements",
    futureOutlook: "Moderate growth with focus on preserving natural teeth over extractions"
  },
  { 
    name: "Dental Bridges", 
    category: "Restorative",
    growth: 4.2, 
    marketSize2025: 3.7, 
    primaryAgeGroup: "45-70", 
    trends: "More durable materials and improved aesthetic outcomes",
    futureOutlook: "Slower growth as implants become more popular"
  },
  { 
    name: "Dental Implants", 
    category: "Restorative",
    growth: 11.5, 
    marketSize2025: 8.9, 
    primaryAgeGroup: "45-65", 
    trends: "Growth driven by aging population and technological advancements",
    futureOutlook: "Expected continued growth over next 5-10 years with integration of AI diagnostics"
  },
  { 
    name: "Dentures", 
    category: "Restorative",
    growth: 3.1, 
    marketSize2025: 4.6, 
    primaryAgeGroup: "65+", 
    trends: "Improved materials and digital design for better fit and comfort",
    futureOutlook: "Modest growth limited by increasing preference for implants"
  },

  // Cosmetic Dentistry
  { 
    name: "Teeth Whitening", 
    category: "Cosmetic",
    growth: 9.3, 
    marketSize2025: 5.8, 
    primaryAgeGroup: "20-55", 
    trends: "Advanced LED light technologies and professional-grade home kits",
    futureOutlook: "Strong growth driven by aesthetic demands and social media influence"
  },
  { 
    name: "Dental Veneers", 
    category: "Cosmetic",
    growth: 12.7, 
    marketSize2025: 7.4, 
    primaryAgeGroup: "25-60", 
    trends: "Minimal-prep and no-prep options with improved durability",
    futureOutlook: "Very strong growth in premium cosmetic segment"
  },
  { 
    name: "Dental Bonding", 
    category: "Cosmetic",
    growth: 8.4, 
    marketSize2025: 3.2, 
    primaryAgeGroup: "18-50", 
    trends: "Improved composite materials with better color stability",
    futureOutlook: "Steady growth as affordable cosmetic option"
  },
  { 
    name: "Cosmetic Dentistry", 
    category: "Cosmetic",
    growth: 12.4, 
    marketSize2025: 9.3, 
    primaryAgeGroup: "25-55", 
    trends: "Teeth whitening, veneers, aesthetic improvements",
    futureOutlook: "Strong growth driven by appearance consciousness and social media influence"
  },
  { 
    name: "Gum Contouring", 
    category: "Cosmetic",
    growth: 10.2, 
    marketSize2025: 2.6, 
    primaryAgeGroup: "25-60", 
    trends: "Laser techniques reducing recovery time and improving precision",
    futureOutlook: "Growing segment of holistic smile design protocols"
  },

  // Orthodontics
  { 
    name: "Traditional Braces", 
    category: "Orthodontics",
    growth: 3.2, 
    marketSize2025: 5.1, 
    primaryAgeGroup: "10-18", 
    trends: "Self-ligating brackets and improved wire technology reducing treatment time",
    futureOutlook: "Limited growth due to clear aligner popularity"
  },
  { 
    name: "Clear Aligners", 
    category: "Orthodontics",
    growth: 15.8, 
    marketSize2025: 8.6, 
    primaryAgeGroup: "15-45", 
    trends: "Telehealth monitoring and remote treatment protocols expanding",
    futureOutlook: "Very strong growth with improvements in treatment complexity capability"
  },
  { 
    name: "Orthodontics (Overall)", 
    category: "Orthodontics",
    growth: 9.8, 
    marketSize2025: 7.2, 
    primaryAgeGroup: "12-30", 
    trends: "Clear aligners replacing traditional braces, digital scanning adoption",
    futureOutlook: "Market shifting to adult orthodontics and at-home treatment options"
  },
  { 
    name: "Accelerated Orthodontics", 
    category: "Orthodontics",
    growth: 13.5, 
    marketSize2025: 2.8, 
    primaryAgeGroup: "20-45", 
    trends: "Light and vibration therapies to reduce treatment time",
    futureOutlook: "Strong growth in adult segment where treatment time is primary concern"
  },
  { 
    name: "Retainers & Maintenance", 
    category: "Orthodontics",
    growth: 7.2, 
    marketSize2025: 2.3, 
    primaryAgeGroup: "12-40", 
    trends: "3D printed custom retainers and remote monitoring",
    futureOutlook: "Steady growth following overall orthodontic treatment expansion"
  },

  // Periodontics
  { 
    name: "Scaling & Root Planing", 
    category: "Periodontics",
    growth: 5.8, 
    marketSize2025: 3.4, 
    primaryAgeGroup: "40+", 
    trends: "Ultrasonic and laser-assisted techniques improving outcomes",
    futureOutlook: "Steady growth with increased awareness of periodontal-systemic health connection"
  },
  { 
    name: "Gum Grafting", 
    category: "Periodontics",
    growth: 8.4, 
    marketSize2025: 2.1, 
    primaryAgeGroup: "40-65", 
    trends: "Minimally invasive techniques with improved donor site protocols",
    futureOutlook: "Moderate growth with aging population and implant-related needs"
  },
  { 
    name: "Periodontal Maintenance", 
    category: "Periodontics",
    growth: 7.3, 
    marketSize2025: 4.2, 
    primaryAgeGroup: "45+", 
    trends: "Integration with systemic health monitoring and risk assessment",
    futureOutlook: "Strong growth with increased awareness of periodontal-systemic health links"
  },

  // Oral Surgery
  { 
    name: "Tooth Extractions", 
    category: "Oral Surgery",
    growth: 2.8, 
    marketSize2025: 5.3, 
    primaryAgeGroup: "All ages", 
    trends: "Less invasive techniques with improved healing protocols",
    futureOutlook: "Limited growth as tooth preservation techniques improve"
  },
  { 
    name: "Wisdom Teeth Removal", 
    category: "Oral Surgery",
    growth: 4.1, 
    marketSize2025: 4.2, 
    primaryAgeGroup: "16-25", 
    trends: "3D imaging improving treatment planning and reducing complications",
    futureOutlook: "Stable market with consistent demographic need"
  },
  { 
    name: "Dental Bone Grafting", 
    category: "Oral Surgery",
    growth: 10.2, 
    marketSize2025: 2.9, 
    primaryAgeGroup: "45-70", 
    trends: "Advanced biomaterials and growth factors improving outcomes",
    futureOutlook: "Strong growth tied to implant placement procedures"
  },

  // Endodontics
  { 
    name: "Root Canal Specialists", 
    category: "Endodontics",
    growth: 6.3, 
    marketSize2025: 3.8, 
    primaryAgeGroup: "35-65", 
    trends: "Microscope-assisted techniques improving success rates",
    futureOutlook: "Moderate growth with specialization for complex cases"
  },
  { 
    name: "Endodontic Retreatment", 
    category: "Endodontics",
    growth: 7.1, 
    marketSize2025: 1.9, 
    primaryAgeGroup: "40-65", 
    trends: "Advanced imaging and instrumentation improving previous treatment failures",
    futureOutlook: "Steady growth as tooth preservation value increases"
  },

  // Pediatric Dentistry
  { 
    name: "Pediatric Preventive", 
    category: "Pediatric",
    growth: 8.5, 
    marketSize2025: 4.1, 
    primaryAgeGroup: "0-17", 
    trends: "Child-specific preventive protocols with behavior management",
    futureOutlook: "Strong growth with parental focus on early prevention"
  },
  { 
    name: "Pediatric Restorative", 
    category: "Pediatric",
    growth: 6.2, 
    marketSize2025: 3.5, 
    primaryAgeGroup: "0-17", 
    trends: "Bioactive materials supporting pulp vitality and tooth development",
    futureOutlook: "Moderate growth with improved preventive care reducing need"
  },

  // Digital Dentistry
  { 
    name: "Digital Impressions", 
    category: "Digital Dentistry",
    growth: 16.2, 
    marketSize2025: 3.8, 
    primaryAgeGroup: "All ages", 
    trends: "Intraoral scanners replacing traditional impressions in most practices",
    futureOutlook: "Very strong growth as technology becomes more affordable"
  },
  { 
    name: "CAD/CAM Restorations", 
    category: "Digital Dentistry",
    growth: 14.8, 
    marketSize2025: 6.3, 
    primaryAgeGroup: "All ages", 
    trends: "In-office milling and 3D printing for same-day restorations",
    futureOutlook: "Strong growth with improved materials and workflow efficiency"
  },
  { 
    name: "3D Imaging", 
    category: "Digital Dentistry",
    growth: 17.5, 
    marketSize2025: 4.7, 
    primaryAgeGroup: "All ages", 
    trends: "CBCT integration for comprehensive treatment planning",
    futureOutlook: "Very strong growth with reduced radiation dosage and increased applications"
  }
];

// Categories for grouping procedures
const dentalCategories = [
  "Preventive", 
  "Restorative", 
  "Cosmetic", 
  "Orthodontics", 
  "Periodontics", 
  "Oral Surgery", 
  "Endodontics", 
  "Pediatric", 
  "Digital Dentistry"
];

// Dental market overall growth data for timeline visualization
const dentalMarketGrowth = [
  { year: 2020, size: 35.2 },
  { year: 2021, size: 39.1 },
  { year: 2022, size: 43.6 },
  { year: 2023, size: 48.5 },
  { year: 2024, size: 54.0 },
  { year: 2025, size: 60.2 }, // Projected
  { year: 2026, size: 67.1 }, // Projected
  { year: 2027, size: 74.8 }, // Projected
  { year: 2028, size: 83.4 }, // Projected
  { year: 2029, size: 93.0 }, // Projected
  { year: 2030, size: 103.7 } // Projected
];

// Dental patient demographics
const dentalDemographics = [
  { ageGroup: "0-17", percentage: 22 },
  { ageGroup: "18-34", percentage: 19 },
  { ageGroup: "35-49", percentage: 21 },
  { ageGroup: "50-64", percentage: 24 },
  { ageGroup: "65+", percentage: 14 }
];

// Dental procedure gender distribution
const dentalGenderDistribution = [
  { name: "Male", value: 44 },
  { name: "Female", value: 56 }
];

export {
  dentalProcedures,
  dentalCategories,
  dentalMarketGrowth,
  dentalDemographics,
  dentalGenderDistribution
};
