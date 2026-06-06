export function buildPlannerPrompt(goal: string, context: any) {
  return `
You are a principal software architect.

GOAL:

${goal}

PROJECT CONTEXT:

${JSON.stringify(context, null, 2)}

Create an execution roadmap.

Rules:

1. Respect engineering decisions.
2. Prioritize low-risk, high-impact changes first.
3. Resolve circular dependencies early.
4. Remove orphan files before refactoring.
5. Reduce coupling before major architectural changes.

Return ONLY JSON:

{
  "roadmap": [
    {
      "phase": 1,
      "tasks": []
    }
  ]
}
`;
}
