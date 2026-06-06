import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
export class AIService {
  private readonly client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  async generate(prompt: string) {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }
}
