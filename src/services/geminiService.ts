import { GoogleGenerativeAI } from "@google/generative-ai";
import { COMMON_MEDICINES } from "../data/medicines";
import Fuse from "fuse.js";

const API_KEY = process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);

// Initialize Fuse for local searching
const fuse = new Fuse(COMMON_MEDICINES, {
  keys: ["brandName", "genericName", "composition"],
  threshold: 0.3, // Allow for some spelling mistakes
});

export interface MedicineTranslation {
  brandName: string;
  genericName: string;
  genericPrice: number;
  brandedPrice: number;
  savingsPercentage: number;
  composition: string;
  usage: string;
}

export async function translateMedicine(query: string): Promise<MedicineTranslation | null> {
  // 1. Check local database first using Fuzzy Search (Instant result)
  const results = fuse.search(query);
  
  if (results.length > 0) {
    // Return the best match
    return results[0].item;
  }

  if (!API_KEY) {
    // Fallback for demo if no key is provided
    return {
      brandName: query,
      genericName: "Generic Eq. of " + query,
      genericPrice: 15,
      brandedPrice: 85,
      savingsPercentage: 82,
      composition: "Salt A + Salt B",
      usage: "Commonly used for fever and pain relief."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction: "You are a medicine translator. Return only a valid JSON object. No markdown, no prose."
    });

    const prompt = `Translate the brand name medicine "${query}" into its generic Jan-Aushadhi equivalent. 
    Provide real-world estimated prices in Indian Rupees (INR).
    Return a JSON object with these EXACT keys:
    "brandName", "genericName", "brandedPrice" (number), "genericPrice" (number), "savingsPercentage" (number), "composition", "usage".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return null;
  }
}

export async function checkMedicineStock(medicineName: string, storeName: string) {
  if (!API_KEY) {
    return "AI Stock checking remains unavailable until Gemini API Key is provided.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(
      `Check stock for "${medicineName}" at "${storeName}". 
      Most medicines are available. Respond in 2-3 sentences. 
      Mention that this is a simulated real-time check.`
    );

    return response.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error querying stock. Please try again later.";
  }
}
