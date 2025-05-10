// Comprehensive Aesthetic Industry Data
const aestheticProcedures = [
  // Injectables
  { 
    name: "Botulinum Toxin (Botox)", 
    category: "Injectables",
    growth: 15.3, 
    marketSize2025: 8.1, 
    primaryAgeGroup: "25-65", 
    trends: "Preventative use in younger patients, expanded applications",
    futureOutlook: "Strong growth with expanding age ranges and minimally invasive appeal"
  },
  { 
    name: "Dermal Fillers (HA)", 
    category: "Injectables",
    growth: 12.4, 
    marketSize2025: 7.2, 
    primaryAgeGroup: "25-60", 
    trends: "Increasing demand for natural looks, lip enhancements",
    futureOutlook: "Continued strong growth with new formulations and applications"
  },
  { 
    name: "Biostimulators", 
    category: "Injectables",
    growth: 14.8, 
    marketSize2025: 3.5, 
    primaryAgeGroup: "35-65", 
    trends: "Collagen-stimulating treatments gaining popularity for natural results",
    futureOutlook: "Strong growth as longer-lasting alternative to traditional fillers"
  },
  { 
    name: "Kybella/Deoxycholic Acid", 
    category: "Injectables",
    growth: 8.7, 
    marketSize2025: 1.9, 
    primaryAgeGroup: "30-60", 
    trends: "Fat dissolution for submental fullness and small body areas",
    futureOutlook: "Moderate growth with competition from newer technologies"
  },
  { 
    name: "PRP/PRF Treatments", 
    category: "Injectables",
    growth: 16.2, 
    marketSize2025: 2.8, 
    primaryAgeGroup: "30-65", 
    trends: "Autologous treatments for skin quality and hair restoration",
    futureOutlook: "Strong growth with expanding applications and natural appeal"
  },

  // Energy-Based Devices
  { 
    name: "Laser Skin Resurfacing", 
    category: "Energy-Based",
    growth: 11.7, 
    marketSize2025: 5.4, 
    primaryAgeGroup: "35-65", 
    trends: "Fractional technologies balancing results with downtime",
    futureOutlook: "Steady growth with technological improvements reducing downtime"
  },
  { 
    name: "Radiofrequency Treatments", 
    category: "Energy-Based",
    growth: 15.3, 
    marketSize2025: 4.8, 
    primaryAgeGroup: "35-65", 
    trends: "Non-invasive skin tightening with minimal downtime",
    futureOutlook: "Strong growth with improved technologies and comfort profiles"
  },
  { 
    name: "Ultrasound Therapy", 
    category: "Energy-Based",
    growth: 13.4, 
    marketSize2025: 3.9, 
    primaryAgeGroup: "40-65", 
    trends: "Focused ultrasound for deeper tissue tightening",
    futureOutlook: "Strong growth with technological improvements and patient comfort"
  },
  { 
    name: "IPL Photofacial", 
    category: "Energy-Based",
    growth: 9.8, 
    marketSize2025: 3.2, 
    primaryAgeGroup: "30-65", 
    trends: "Treatment for pigmentation, vascular issues, and overall skin quality",
    futureOutlook: "Moderate growth with improved targeting technologies"
  },
  { 
    name: "Microneedling RF", 
    category: "Energy-Based",
    growth: 16.9, 
    marketSize2025: 3.1, 
    primaryAgeGroup: "30-60", 
    trends: "Combining microneedling with radiofrequency for enhanced results",
    futureOutlook: "Strong growth with results comparable to more invasive procedures"
  },

  // Body Contouring
  { 
    name: "CoolSculpting", 
    category: "Body Contouring",
    growth: 8.9, 
    marketSize2025: 3.5, 
    primaryAgeGroup: "30-50", 
    trends: "Non-invasive fat reduction, alternative to liposuction",
    futureOutlook: "Moderate growth with competition from newer technologies"
  },
  { 
    name: "EmSculpt/mSculpt", 
    category: "Body Contouring",
    growth: 15.2, 
    marketSize2025: 2.8, 
    primaryAgeGroup: "25-45", 
    trends: "Muscle toning without exercise, popularity with fitness enthusiasts",
    futureOutlook: "Strong growth as technology improves and awareness increases"
  },
  { 
    name: "Radiofrequency Body Contouring", 
    category: "Body Contouring",
    growth: 13.8, 
    marketSize2025: 2.6, 
    primaryAgeGroup: "30-55", 
    trends: "Skin tightening and fat reduction with minimal downtime",
    futureOutlook: "Strong growth with improved technologies and applications"
  },
  { 
    name: "Laser Lipolysis", 
    category: "Body Contouring",
    growth: 10.2, 
    marketSize2025: 2.3, 
    primaryAgeGroup: "30-55", 
    trends: "Minimally invasive laser-assisted fat reduction",
    futureOutlook: "Moderate growth with improvements in technology and safety"
  },
  { 
    name: "Cellulite Treatments", 
    category: "Body Contouring",
    growth: 11.6, 
    marketSize2025: 2.1, 
    primaryAgeGroup: "25-60", 
    trends: "Increasing effectiveness with combination approaches",
    futureOutlook: "Steady growth with improved technologies addressing root causes"
  },

  // Skin Treatments
  { 
    name: "Chemical Peels", 
    category: "Skin Treatments",
    growth: 9.4, 
    marketSize2025: 3.2, 
    primaryAgeGroup: "25-65", 
    trends: "Customized formulations for specific skin concerns",
    futureOutlook: "Moderate growth with innovative formulations"
  },
  { 
    name: "Microdermabrasion", 
    category: "Skin Treatments",
    growth: 7.2, 
    marketSize2025: 2.1, 
    primaryAgeGroup: "20-60", 
    trends: "Gentle exfoliation with minimal downtime",
    futureOutlook: "Limited growth with competition from newer technologies"
  },
  { 
    name: "Hydrafacial", 
    category: "Skin Treatments",
    growth: 13.7, 
    marketSize2025: 2.4, 
    primaryAgeGroup: "All ages", 
    trends: "Multi-step treatment combining cleansing, extraction, and hydration",
    futureOutlook: "Strong growth with expanding treatment protocols and add-ons"
  },
  { 
    name: "Medical Grade Skincare", 
    category: "Skin Treatments",
    growth: 12.8, 
    marketSize2025: 5.6, 
    primaryAgeGroup: "All ages", 
    trends: "Professional-only formulations with clinically proven ingredients",
    futureOutlook: "Strong growth with consumer education and clinic-home integration"
  },
  { 
    name: "Skin Treatments (Overall)", 
    category: "Skin Treatments",
    growth: 14.1, 
    marketSize2025: 8.4, 
    primaryAgeGroup: "All ages", 
    trends: "Chemical peels, microdermabrasion, focus on skin health",
    futureOutlook: "Steady growth with increasing emphasis on overall skin health"
  },

  // Advanced Treatments
  { 
    name: "Exosome Therapy", 
    category: "Advanced Treatments",
    growth: 18.6, 
    marketSize2025: 1.9, 
    primaryAgeGroup: "35-65", 
    trends: "Emerging regenerative treatment, cellular rejuvenation",
    futureOutlook: "Extremely high growth potential as research advances and applications expand"
  },
  { 
    name: "Stem Cell Treatments", 
    category: "Advanced Treatments",
    growth: 17.3, 
    marketSize2025: 2.2, 
    primaryAgeGroup: "40-70", 
    trends: "Regenerative approaches for skin and hair rejuvenation",
    futureOutlook: "Strong growth potential with advancing research and regulatory clarity"
  },
  { 
    name: "Thread Lifts", 
    category: "Advanced Treatments",
    growth: 14.8, 
    marketSize2025: 3.1, 
    primaryAgeGroup: "40-65", 
    trends: "Minimally invasive lifting with improved thread technology",
    futureOutlook: "Strong growth as alternative to surgical facelifts for moderate laxity"
  },
  { 
    name: "Platelet-Rich Plasma (PRP)", 
    category: "Advanced Treatments",
    growth: 15.9, 
    marketSize2025: 2.8, 
    primaryAgeGroup: "35-65", 
    trends: "Autologous treatment for skin, hair, and intimate wellness",
    futureOutlook: "Strong growth with expanded applications and natural approach"
  },

  // Hair Treatments
  { 
    name: "Hair Restoration", 
    category: "Hair Treatments",
    growth: 13.2, 
    marketSize2025: 4.3, 
    primaryAgeGroup: "30-60", 
    trends: "Advanced FUE techniques and robotic-assisted procedures",
    futureOutlook: "Strong growth with increasing technological sophistication and reducing stigma"
  },
  { 
    name: "Low-Level Laser Therapy", 
    category: "Hair Treatments",
    growth: 11.8, 
    marketSize2025: 1.8, 
    primaryAgeGroup: "25-60", 
    trends: "At-home and in-office light therapy for hair growth",
    futureOutlook: "Moderate growth with improvements in efficacy and convenience"
  },
  { 
    name: "PRP for Hair Loss", 
    category: "Hair Treatments",
    growth: 16.4, 
    marketSize2025: 2.4, 
    primaryAgeGroup: "30-60", 
    trends: "Autologous treatment stimulating follicle activity",
    futureOutlook: "Strong growth with combination protocols enhancing results"
  },

  // Vascular Treatments
  { 
    name: "Laser Vein Removal", 
    category: "Vascular Treatments",
    growth: 9.7, 
    marketSize2025: 2.1, 
    primaryAgeGroup: "30-70", 
    trends: "Treatment for small facial and leg veins with minimal downtime",
    futureOutlook: "Moderate growth with technological improvements in targeting"
  },
  { 
    name: "Sclerotherapy", 
    category: "Vascular Treatments",
    growth: 7.5, 
    marketSize2025: 1.6, 
    primaryAgeGroup: "30-65", 
    trends: "Injectable treatment for spider veins and small varicose veins",
    futureOutlook: "Stable growth with consistent demand and proven effectiveness"
  },

  // Wellness Treatments
  { 
    name: "IV Therapy", 
    category: "Wellness Treatments",
    growth: 15.7, 
    marketSize2025: 2.3, 
    primaryAgeGroup: "25-55", 
    trends: "Customized nutrient infusions for skin health and wellness",
    futureOutlook: "Strong growth with increasing integration into aesthetics practices"
  },
  { 
    name: "Hormone Optimization", 
    category: "Wellness Treatments",
    growth: 14.2, 
    marketSize2025: 3.4, 
    primaryAgeGroup: "40-65", 
    trends: "Bioidentical hormone treatments supporting skin and overall health",
    futureOutlook: "Strong growth with holistic approach to aging management"
  },
  { 
    name: "Weight Management", 
    category: "Wellness Treatments",
    growth: 12.8, 
    marketSize2025: 4.2, 
    primaryAgeGroup: "30-65", 
    trends: "Medical weight management programs integrated with aesthetics",
    futureOutlook: "Strong growth with holistic wellness focus"
  }
];

// Categories for grouping procedures
const aestheticCategories = [
  "Injectables", 
  "Energy-Based", 
  "Body Contouring", 
  "Skin Treatments", 
  "Advanced Treatments", 
  "Hair Treatments", 
  "Vascular Treatments", 
  "Wellness Treatments"
];

// Aesthetic market overall growth data for timeline visualization
const aestheticMarketGrowth = [
  { year: 2020, size: 43.8 },
  { year: 2021, size: 49.9 },
  { year: 2022, size: 56.8 },
  { year: 2023, size: 64.7 },
  { year: 2024, size: 73.7 },
  { year: 2025, size: 83.9 }, // Projected
  { year: 2026, size: 95.5 }, // Projected
  { year: 2027, size: 108.8 }, // Projected
  { year: 2028, size: 123.8 }, // Projected
  { year: 2029, size: 141.0 }, // Projected
  { year: 2030, size: 160.6 } // Projected
];

// Aesthetic patient demographics
const aestheticDemographics = [
  { ageGroup: "18-24", percentage: 11 },
  { ageGroup: "25-34", percentage: 27 },
  { ageGroup: "35-49", percentage: 33 },
  { ageGroup: "50-64", percentage: 22 },
  { ageGroup: "65+", percentage: 7 }
];

// Aesthetic procedure gender distribution
const aestheticGenderDistribution = [
  { name: "Male", value: 13 },
  { name: "Female", value: 87 }
];

// Export named exports to match the structure expected by dataLoader.js
export {
  aestheticProcedures,
  aestheticCategories,
  aestheticMarketGrowth,
  aestheticDemographics,
  aestheticGenderDistribution
};
