const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // There isn't a direct listModels in the SDK easily accessible this way, 
    // but we can try a fetch to the REST endpoint.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error);
      return;
    }

    console.log("--- Available Models ---");
    data.models.forEach(m => {
      console.log(`Name: ${m.name} | Methods: ${m.supportedGenerationMethods.join(', ')}`);
    });
    console.log("------------------------");
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

listModels();
