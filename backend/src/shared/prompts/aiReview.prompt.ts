export function aiReviewPrompt(report: any) {
  return `
You are a senior staff software engineer.

Review the repository below.

Repository Health:

${JSON.stringify(report.health, null, 2)}

Architecture:

${JSON.stringify(report.architecture, null, 2)}

Top Risks:

${JSON.stringify(report.topRisks, null, 2)}

Recommendations:

${JSON.stringify(report.recommendationActions, null, 2)}

Return ONLY valid JSON.

{

  "overallAssessment": "",

  "strengths": [],

  "weaknesses": [],

  "highPriorityFixes": [],

  "longTermImprovements": [],

  "score": 0,

  "grade": ""

}
`;
}
