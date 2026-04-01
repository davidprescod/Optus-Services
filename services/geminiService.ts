
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getValuationAdvice = async (make: string, model: string, qty: number) => {
  try {
    // Basic Text Tasks use gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a realistic B2B trade-in valuation advice for ${qty} units of ${make} ${model} hardware in "Fully Working" condition for the UK market. Suggest a typical Buyer Bid price and a suggested Admin Margin. Return in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedBuyerBid: { type: Type.NUMBER, description: 'Total price a refurbisher might pay' },
            suggestedMargin: { type: Type.NUMBER, description: 'Reasonable broker margin in GBP' },
            logisticsEstimate: { type: Type.NUMBER, description: 'Estimated shipping/logistics cost' },
            marketInsight: { type: Type.STRING, description: 'Short note on current demand' }
          },
          required: ['suggestedBuyerBid', 'suggestedMargin', 'logisticsEstimate', 'marketInsight'],
          propertyOrdering: ["suggestedBuyerBid", "suggestedMargin", "logisticsEstimate", "marketInsight"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini valuation failed:", error);
    return null;
  }
};

export const analyzeHardwareImage = async (base64Image: string) => {
  try {
    // Sending multi-modal content using the parts array as per SDK guidelines
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Analyze this industrial hardware. Identify the Make and Model Number if visible. Confirm if it looks like a barcode scanner or mobile terminal." },
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            make: { type: Type.STRING },
            model: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            isIndustrialHardware: { type: Type.BOOLEAN }
          },
          required: ['make', 'model', 'isIndustrialHardware'],
          propertyOrdering: ["make", "model", "confidence", "isIndustrialHardware"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini image analysis failed:", error);
    return null;
  }
};
