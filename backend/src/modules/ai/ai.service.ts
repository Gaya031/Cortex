import { GoogleGenAI } from "@google/genai";
import { env } from "../../config/env.js";
import { ContextService } from "../context/context.service.js";
import { FlowExlainerService } from "../flow-explainer/flow-explainer.service.js";

export class AIService {
  private readonly client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  private readonly contextService = new ContextService();
  private readonly flowExplainerService = new FlowExlainerService();

  async generate(prompt: string) {
    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  }

  private isFlowQuestion(question: string) {
    const q = question.toLowerCase();
    const keyWords = [
      "flow",
      "workflow",
      "execution",
      "how does",
      "request path",
      "user fetching",
      "order creation",
      "authentication flow",
      "call chain",
      "journey",
    ];
    return keyWords.some((keyword) => q.includes(keyword));
  }

  private async findRelevantFunction(workspaceId: string, question: string) {
    const context = await this.contextService.buildQuestionContext(
      workspaceId,
      question,
    );

    const firstChunk = context.chunks[0];

    if (!firstChunk) {
      return null;
    }

    const functionMatch = firstChunk.content.match(
      /function\s+([A-Za-z0-9_]+)/,
    );

    if (functionMatch?.[1]) {
      return functionMatch[1];
    }

    const constMatch = firstChunk.content.match(/const\s+([A-Za-z0-9_]+)\s*=/);

    if (constMatch?.[1]) {
      return constMatch[1];
    }

    return null;
  }

  async answerRepositoryQuestion(workspaceId: string, question: string) {
    if (this.isFlowQuestion(question)) {
      let functionName = await this.findRelevantFunction(workspaceId, question);
      if (functionName) {
        const flow = await this.flowExplainerService.explainFunctionFlow(
          workspaceId,
          functionName,
        );

        if (flow) {
          const flowPrompt = `

You are a senior software architect.
Explain the execution flow using the provided graph data.
Rules:
1. Explain step by step.
2. Mention components, hooks, services and functions.
3. Mention file names.
4. Mention cycles if present.
5. Keep the explanation technical but concise.

Question:
${question}

Flow Data:
${JSON.stringify(flow, null, 2)}
`;

          const flowResponse = await this.client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: flowPrompt,
          });
          const sources = [
            ...new Map(
              flow.paths
                .flatMap((path) => path.path)
                .filter((node) => node.filePath)
                .map((node) => [
                  node.filePath,
                  {
                    filePath: node.filePath,
                  },
                ]),
            ).values(),
          ];

          return {
            answer: flowResponse.text,
            sources,
            mode: "FLOW",
          };
        }
      }
    }

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
      mode: "RAG",
    };
  }
}
