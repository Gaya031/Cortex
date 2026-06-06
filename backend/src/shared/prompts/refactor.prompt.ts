export function buildRefactorPrompt(
  fileSummary: any,
  projectContext: any,
  riskAnalysis: any
) {
  return `
You are a principal software architect.

FILE SUMMARY:

${JSON.stringify(fileSummary, null, 2)}

PROJECT CONTEXT:

${JSON.stringify(projectContext, null, 2)}

RISK ANALYSIS:

${JSON.stringify(riskAnalysis, null, 2)}

Analyze this file and provide:

1. Problems
2. Refactoring Recommendations
3. Estimated Impact

Rules:

- Respect engineering decisions.
- Avoid high-risk recommendations unless necessary.
- Consider coupling.
- Consider impact score.
- Consider architecture risks.
- Prefer incremental improvements.

Return ONLY JSON:

{
  "problems": [],
  "recommendations": [],
  "estimatedImpact": []
}
`;
}