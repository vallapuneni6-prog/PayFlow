
import { GoogleGenAI, Type } from "@google/genai";
import { PaymentItem } from "../types";

export const getFinancialAdvice = async (payments: PaymentItem[]) => {
  // Initialize AI client inside the function to ensure the freshest environment configuration
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const income = payments.filter(p => p.type === 'RECEIVE').map(p => `${p.title}: ₹${p.amount}`).join(', ');
  const expenses = payments.filter(p => p.type === 'PAY').map(p => `${p.title}: ₹${p.amount}`).join(', ');

  const prompt = `
    I am a personal finance tracker based in India. Here is my current monthly financial setup in Indian Rupees (₹):
    Incoming: ${income || 'None listed'}
    Outgoing: ${expenses || 'None listed'}
    
    Please provide 3 brief, actionable financial tips or observations based on this data. 
    Keep tips short and mobile-friendly (max 15 words each).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Defining responseSchema is the recommended best practice for structured JSON responses
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
            description: "A concise financial tip for the user."
          }
        }
      }
    });

    // Access the .text property directly instead of calling .text()
    const text = response.text;
    return text ? JSON.parse(text) : ["Stay consistent with your tracking!"];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Stay consistent with your tracking!", "Always set aside a small emergency fund.", "Review your subscription services regularly."];
  }
};
