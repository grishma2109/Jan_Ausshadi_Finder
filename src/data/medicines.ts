export interface MedicineData {
  brandName: string;
  genericName: string;
  genericPrice: number;
  brandedPrice: number;
  savingsPercentage: number;
  composition: string;
  usage: string;
}

export const COMMON_MEDICINES: MedicineData[] = [
  {
    brandName: "Crocin",
    genericName: "Paracetamol",
    genericPrice: 12,
    brandedPrice: 35,
    savingsPercentage: 65,
    composition: "Paracetamol 500mg",
    usage: "Pain relief and fever reduction."
  },
  {
    brandName: "Augmentin",
    genericName: "Amoxycillin + Potassium Clavulante",
    genericPrice: 120,
    brandedPrice: 450,
    savingsPercentage: 73,
    composition: "Amoxycillin 500mg + Clavulanic Acid 125mg",
    usage: "Antibiotic for bacterial infections."
  },
  {
    brandName: "Calpol",
    genericName: "Paracetamol",
    genericPrice: 10,
    brandedPrice: 30,
    savingsPercentage: 66,
    composition: "Paracetamol 650mg",
    usage: "Treatment of mild to moderate pain and fever."
  },
  {
    brandName: "Pan 40",
    genericName: "Pantoprazole",
    genericPrice: 25,
    brandedPrice: 110,
    savingsPercentage: 77,
    composition: "Pantoprazole 40mg",
    usage: "Acidity, heartburn, and gastroesophageal reflux disease (GERD)."
  },
  {
    brandName: "Voveran",
    genericName: "Diclofenac",
    genericPrice: 15,
    brandedPrice: 70,
    savingsPercentage: 78,
    composition: "Diclofenac Sodium 50mg",
    usage: "Non-steroidal anti-inflammatory drug (NSAID) for pain and inflammation."
  },
  {
    brandName: "Combiflam",
    genericName: "Ibuprofen + Paracetamol",
    genericPrice: 18,
    brandedPrice: 55,
    savingsPercentage: 67,
    composition: "Ibuprofen 400mg + Paracetamol 325mg",
    usage: "Muscle pain, back pain, joint pain, and menstrual cramps."
  },
  {
    brandName: "Atarax",
    genericName: "Hydroxyzine",
    genericPrice: 30,
    brandedPrice: 120,
    savingsPercentage: 75,
    composition: "Hydroxyzine Hydrochloride 25mg",
    usage: "Anxiety and allergic skin reactions (itching)."
  },
  {
    brandName: "Telma 40",
    genericName: "Telmisartan",
    genericPrice: 35,
    brandedPrice: 145,
    savingsPercentage: 75,
    composition: "Telmisartan 40mg",
    usage: "High blood pressure (hypertension) and heart health."
  },
  {
    brandName: "Glycomet",
    genericName: "Metformin",
    genericPrice: 20,
    brandedPrice: 85,
    savingsPercentage: 76,
    composition: "Metformin Hydrochloride 500mg",
    usage: "Type 2 diabetes mellitus."
  },
  {
    brandName: "Zyrtec",
    genericName: "Cetirizine",
    genericPrice: 12,
    brandedPrice: 45,
    savingsPercentage: 73,
    composition: "Cetirizine Hydrochloride 10mg",
    usage: "Allergic symptoms like runny nose, sneezing, and watery eyes."
  },
  {
    brandName: "Lipitor",
    genericName: "Atorvastatin",
    genericPrice: 45,
    brandedPrice: 210,
    savingsPercentage: 78,
    composition: "Atorvastatin Calcium 10mg",
    usage: "Lowering cholesterol and reducing the risk of heart disease."
  },
  {
    brandName: "Dolo 650",
    genericName: "Paracetamol",
    genericPrice: 10,
    brandedPrice: 30,
    savingsPercentage: 66,
    composition: "Paracetamol 650mg",
    usage: "Fever and mild to moderate pain."
  },
  {
    brandName: "Saridon",
    genericName: "Propyphenazone + Paracetamol + Caffeine",
    genericPrice: 12,
    brandedPrice: 40,
    savingsPercentage: 70,
    composition: "Propyphenazone 150mg + Paracetamol 250mg + Caffeine 50mg",
    usage: "Headache and body ache."
  },
  {
    brandName: "Aciloc",
    genericName: "Ranitidine",
    genericPrice: 8,
    brandedPrice: 35,
    savingsPercentage: 77,
    composition: "Ranitidine 150mg",
    usage: "Stomach acid, indigestion, and ulcers."
  },
  {
    brandName: "Cetzin",
    genericName: "Cetirizine",
    genericPrice: 10,
    brandedPrice: 45,
    savingsPercentage: 78,
    composition: "Cetirizine 10mg",
    usage: "Allergies, hay fever, and cold symptoms."
  },
  {
    brandName: "Econorm",
    genericName: "Saccharomyces Boulardii",
    genericPrice: 40,
    brandedPrice: 150,
    savingsPercentage: 73,
    composition: "Saccharomyces boulardii 250mg",
    usage: "Probiotic for diarrhea and gut health."
  },
  {
    brandName: "Allegra",
    genericName: "Fexofenadine",
    genericPrice: 45,
    brandedPrice: 180,
    savingsPercentage: 75,
    composition: "Fexofenadine Hydrochloride 120mg",
    usage: "Non-drowsy allergy relief."
  },
  {
    brandName: "Dexorange",
    genericName: "Ferric Ammonium Citrate + Vit B12 + Folic Acid",
    genericPrice: 90,
    brandedPrice: 220,
    savingsPercentage: 59,
    composition: "Iron 32.8mg + Vit B12 7.5mcg + Folic Acid 0.5mg",
    usage: "Iron deficiency anemia."
  }
];
