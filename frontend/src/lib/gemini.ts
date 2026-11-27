import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Analyzes a crop image using Gemini 1.5 Flash.
 * Specifically checks for non-plant subjects (humans, irrelevant objects).
 */
export const analyzeCropImage = async (
  base64ImageData: string,
  selectedFile: File,
  selectedCrop = '',
): Promise<Record<string, any>> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Sanitize base64 (remove data:image/png;base64, prefix if present)
    const base64Content = base64ImageData.split(',')[1] || base64ImageData;

    const prompt = `
      Analyze this agricultural image. 
      ${selectedCrop && selectedCrop !== 'Other' && selectedCrop !== 'Not Sure' ? `The user has identified this crop as: ${selectedCrop}. Please bias your analysis towards diseases common to ${selectedCrop}.` : ''}

      FIRST MANDATORY STEP: Determine if this is a photo of a plant, crop, or leaf. 
      If it contains a human face, a whole person, a vehicle, a room interior without plants, or any other totally irrelevant object, strictly return a JSON with { "isPlantImage": false }.

      If it is a plant or crop, provide a detailed analysis in the following JSON format:
      {
        "isPlantImage": true,
        "cropName": "Name of the crop (e.g., Wheat, Tomato, Rice)",
        "healthStatus": "healthy" or "diseased",
        "diseaseName": "Name of the disease (or 'Healthy' if no disease)",
        "diseaseType": "Fungal/Viral/Bacterial/Nutrient Deficiency",
        "severity": "mild", "moderate", or "severe",
        "confidencePercent": 0-100,
        "affectedParts": ["leaves", "stems", etc.],
        "symptoms": ["short description of what is seen"],
        "causes": ["why this happened"],
        "treatments": [
          { "step": 1, "action": "Clear short action", "detail": "Detailed instruction", "timing": "e.g., Immediate", "type": "organic" or "chemical" }
        ],
        "preventionTips": ["tip 1", "tip 2"]
      }

      Return ONLY the JSON. No conversational text.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Content,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown blocks
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const aiData = JSON.parse(jsonStr);

    return {
      ...aiData,
      aiSource: "google_gemini_1.5_flash",
      cropName: selectedCrop || aiData.cropName || "Unknown Crop"
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw {
      type: 'api_error',
      message: "The AI is currently busy or unable to process this image. Please ensure your API key is valid and try again."
    };
  }
};

/**
 * Validates if an image is likely a soil report document using Gemini.
 */
export const validateSoilReportImage = async (base64ImageData: string): Promise<boolean> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Content = base64ImageData.split(',')[1] || base64ImageData;

    const prompt = `
      Analyze this image. 
      Is this a document, a laboratory report, or a structured text paper? 
      Strictly return 'VALID' if it looks like a soil analysis report or document.
      Return 'INVALID' if it is a photo of a human, a face, a landscape, or any other non-document subject.
      
      Response must be exactly 'VALID' or 'INVALID'.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Content,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().trim().toUpperCase();
    
    return text.includes('VALID');
  } catch (error) {
    console.error("Soil Validation Error:", error);
    return true; // Fallback to Tesseract if AI validation fails
  }
};

/**
 * Direct Visual Analysis of actual soil images.
 */
export const analyzeVisualSoil = async (base64ImageData: string): Promise<Record<string, any>> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const base64Content = base64ImageData.split(',')[1] || base64ImageData;

    const prompt = `
      Analyze this photo of actual soil (mud/dirt).
      
      FIRST: Is this an image of soil? If it contains humans, animals, or irrelevant objects, return JSON { "isValid": false }.
      
      SECOND: If it is soil, identify its characteristics and return a JSON in this format:
      {
        "isValid": true,
        "SoilType": "One of: Alluvial, Black, Red, Laterite, Desert, Mountain",
        "pH": estimate float 4.0-9.0,
        "Nitrogen": estimate int 50-300,
        "Phosphorus": int 10-100,
        "Potassium": int 50-400,
        "Moisture": int 0-100,
        "OrganicCarbon": float 0.1-2.0,
        "Texture": "Fine/Coarse/Sandy/Clayey",
        "Color": "Descriptive color name",
        "isVisualEstimate": true
      }
      
      Return ONLY the JSON.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Content,
          mimeType: "image/jpeg"
        }
      }
    ]);

    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    const data = JSON.parse(text);

    return data;
  } catch (error) {
    console.error("Visual Soil Analysis Error:", error);
    throw error;
  }
};

/**
 * Conversational agricultural advice, generated client-side with Gemini.
 * The previous implementation called a Node/Express endpoint; that backend
 * has been removed in favour of Firebase, so the assistant runs here.
 */
export const localAgriculturalAdvice = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes('scheme') || q.includes('subsidy') || q.includes('government')) {
    return 'Check your state agriculture department portal for active crop, irrigation and soil-health schemes. Most programmes require land records and a bank account linked to your Aadhaar-equivalent national ID.';
  }
  if (q.includes('weather') || q.includes('rain') || q.includes('irrigation')) {
    return 'Check the Weather page before irrigating. If heavy rain is forecast, skip irrigation and ensure field drainage. Drip irrigation at dawn reduces evaporation loss.';
  }
  if (q.includes('fertilizer') || q.includes('nutrient') || q.includes('npk')) {
    return 'Get a soil test first, then apply only the missing nutrients. Split nitrogen into two or three doses rather than one large application, and incorporate organic compost to improve retention.';
  }
  if (q.includes('market') || q.includes('price') || q.includes('mandi')) {
    return 'Open the Market Prices page to compare live prices across markets. Add a crop to your watchlist so you can check rates quickly before selling.';
  }
  return 'For a precise diagnosis, upload a clear leaf photo on the Detect page. In general, maintain good drainage, use certified seed, rotate crops and scout fields weekly for early pest signs.';
};

export const getAgriculturalAdvice = async (question: string, context = ''): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a friendly agricultural assistant. Give practical, concise advice in plain English.\n${context}\nFarmer question: ${question}`;
    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();
    return answer || localAgriculturalAdvice(question);
  } catch (error) {
    console.warn("Gemini advice unavailable, using local knowledge:", error);
    return localAgriculturalAdvice(question);
  }
};
