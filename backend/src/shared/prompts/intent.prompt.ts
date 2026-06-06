export function buildIntentPrompt(
  goal: string,
  context: any
) {
  return `
You are a principal software architect.

USER GOAL:

${goal}

PROJECT CONTEXT:

${JSON.stringify(
  context,
  null,
  2
)}

IMPORTANT RULES:

1. Respect stored engineering decisions.
2. Avoid recommendations that contradict decisions.
3. Consider high-risk files.
4. Consider circular dependencies.
5. Consider highly coupled files.
6. Consider impact scores.
7. Prefer low-risk improvements first.

Return ONLY JSON:

{
  "problems": [],
  "suggestions": [],
  "impact": [],
  "highRiskAreas": []
}
`;
}