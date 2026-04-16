import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeResearchPaper(pdfText: string) {
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }

  // Switching to gemini-flash-latest to resolve quota limits
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an academic assistant. I will provide you with the text extracted from a Thai research paper PDF.
    Your task is to extract specific information and return it in a valid JSON format.
    
    The JSON should have the following keys (keep the keys as named):
    - title_th: (String)
    - title_en: (String)
    - abstract: (String)
    - background: (String)
    - objectives: (String)
    - scope: (String)
    - theory: (String)
    - methodology: (String)
    - results: (String)
    - discussion: (String)
    - suggestions_use: (String)
    - suggestions_next: (String)
    - keywords: (String)
    
    If you cannot find a specific field, leave it as an empty string.
    Translate your understanding into clear Thai for the fields.
    
    The text extracted from the PDF is as follows:
    ---
    ${pdfText.substring(0, 30000)} 
    ---
    
    Return ONLY the valid JSON object. No other text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown code blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
