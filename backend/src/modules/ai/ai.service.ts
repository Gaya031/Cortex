import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { ContextService } from "../context/context.service.js";

export class AIService {
  private readonly client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  private readonly contextService = new ContextService();

  async generate(prompt: string) {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }

  async answerRepositoryQuestion(workspaceId: string, question: string) {
    const repositoryContext = await this.contextService.buildQuestionContext(
      workspaceId,
      question,
    );
    const prompt = `
You are an expert software architect.
Answer ONLY using the provided repository context.
If the answer is not present in the context, say:
"I could not find that information in the indexed repository."

Question:
${question}
Repository Context:
${repositoryContext.context}
`;
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return {
      answer: response.text,
      chunks: repositoryContext.chunks,
    };
  }
}
