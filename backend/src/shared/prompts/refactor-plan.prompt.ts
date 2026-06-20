export function buildRefactorPlanPrompt(
  objective: string,
  transformationContext: any,
  projectContext: any,
  riskAnalysis: any,
) {
  return `
You are a principal software architect.

OBJECTIVE:

${objective}

TRANSFORMATION CONTEXT:

${JSON.stringify(transformationContext, null, 2)}

PROJECT CONTEXT:

${JSON.stringify(projectContext, null, 2)}

RISK ANALYSIS:

${JSON.stringify(riskAnalysis, null, 2)}

Create a safe refactor plan.

Rules:

- Respect engineering decisions.
- Avoid high-risk modifications unless necessary.
- Prefer incremental changes.
- Preserve existing behavior.
- Separate responsibilities when possible.

Return ONLY JSON:

{
  "objective": "",
  "newFiles": [],
  "moves": [],
  "reasoning": [],
  "estimatedBenefits": []
}
`;
}


export function buildRepositoryContextPrompt(repositoryContext: any, goal: string){
 return `You are an expert software architect.
Repository Context:
${repositoryContext.context}
User Goal:
${goal}
Supported actions:
1. RENAME_FUNCTION
{
  "type": "RENAME_FUNCTION",
  "oldName": "...",
  "newName": "..."
}
2. MOVE_FUNCTION
{
  "type": "MOVE_FUNCTION",
  "function": "...",
  "from": "...",
  "to": "..."
}
Return ONLY valid JSON.
Example:
{
  "summary": "...",
  "actions": [...]
}`
}