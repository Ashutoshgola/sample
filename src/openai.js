import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function listAvailableModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:", models);
    return models;
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
}

export async function sendMsgToOpenAI(message) {
  try {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });




    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
