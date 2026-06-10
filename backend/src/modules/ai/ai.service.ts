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
You are a senior software architect analyzing a codebase.

Rules:
1. Answer only from the provided repository context.
2. Explain the answer using file names and function names when possible.
3. Be concise but technical.
4. If multiple files are involved, describe the flow step-by-step.
5. If the answer is not present in the context, reply:
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

    const sources = [
      ...new Map(
        repositoryContext.chunks.map((chunk) => [
          chunk.filePath,
          {
            filePath: chunk.filePath,
            score: chunk.score,
          },
        ]),
      ).values(),
    ];

    return {
      answer: response.text,
      sources,
    };
    // return {
    //   answer: response.text,
    //   // chunks: repositoryContext.chunks,
    // };
  }
}
