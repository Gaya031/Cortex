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
